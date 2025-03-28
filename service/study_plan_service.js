import 'dotenv/config';
import pool from '../config/database.js';
import jwt from'jsonwebtoken'
import subtopic from '../model/subtopic.js';
import study_plan from '../model/study_plan.js';
import jlpt_exam_date from '../model/jlpt_exam_date.js'
import item from '../model/item.js';
import {spawn} from 'child_process';


function runPythonScript(args) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', args);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
          const result = JSON.parse(output.trim()); 
          resolve(result);
      } else {
        reject(new Error(`Python script exited with code ${code}. Error: ${errorOutput}`));
      }
    });
  });
};

class study_plan_service{

    async getJLPTExamDate(){
      let connection;
      try {
          connection = await pool.getConnection();
          await connection.beginTransaction();

          const rows = await jlpt_exam_date.getJLPTExamDate(connection)

          return {statusCode: 201, message: 'Get JLPT Exam Date Successfully.', data: rows};
      }catch (error) {
        if (connection) {
          await connection.rollback();
        }
        return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
    } finally {
        if (connection) {
          connection.release();
        }
    }
    }

    async getStudyPlan(session_token){
      if(!session_token){
        throw {statusCode: 400, message: '*Session Token is required.', data: null};
     }
        
      const decoded = jwt.verify(session_token, process.env.JWT_SECRET); 
      const email = decoded.email; 

      if (!email) {
          throw {statusCode: 400, message: '*Invalid Session Token.', data: null};
      }

      let connection;
      try {
          connection = await pool.getConnection();
          await connection.beginTransaction();

          const row = await study_plan.getStudyPlan(email, connection)

          return {statusCode: 201, message: 'Get Study Plan Successfully.', data: row};
      }catch (error) {
        if (connection) {
          await connection.rollback();
        }
        return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
    } finally {
        if (connection) {
          connection.release();
        }
    }

  }
  
  async generateStudy_Plan(current_level, target_level, daily_study_time, days_to_exam,
                           target_goal, session_token){

      if(!current_level || !target_level || !daily_study_time || !days_to_exam || !session_token || !target_goal){
          throw {statusCode: 400, message: '*Missing Parameters.', data: null};
      }

    
      const decoded = jwt.verify(session_token, process.env.JWT_SECRET); 
      const email = decoded.email; 

      if (!email) {
          throw {statusCode: 400, message: '*Invalid Session Token.', data: null};
      }


      let connection;
      try {
          connection = await pool.getConnection();
          await connection.beginTransaction();

          const subtopic_list = await subtopic.getSubtopicByLevel(current_level, target_level, email, connection)

          if (!subtopic_list || !subtopic_list.length) {
              return {statusCode: 201, message: '*You had completed all the study materials!', data: null};
          }
          
          const subtopic_id_list = subtopic_list.map(row => row.subtopic_id)
          
          //GA Parameters
          const item_group_list = await item.getLearningItemBySubtopicID(subtopic_id_list, connection)
          //CBF Parameters
          const vocab_features_list = await item.getVocabularyFeatureBySubtopicID(subtopic_id_list, connection)
          const grammar_features_list = await item.getGrammarFeatureBySubtopicID(subtopic_id_list, connection)

          if (!item_group_list || !item_group_list.length) {
            return {statusCode: 201, message: '*No study material is available to the users.', data: null};
          }

          if (!vocab_features_list) {
            return {statusCode: 500, message: '*Internal Error', data: null};
          }

          if (!grammar_features_list) {
            return {statusCode: 500, message: '*Internal Error', data: null};
          }

          const vocab_group_sizes = [];
          const grammar_group_sizes = [];

          let vocabGoal = 0;
          let grammarGoal = 0;
      
          item_group_list.forEach(row => {
            if (row.category_name === 'Vocabulary') {
              vocab_group_sizes.push(row.item_count);
              vocabGoal += row.item_count;
            }else if (row.category_name === 'Grammar') {
              grammar_group_sizes.push(row.item_count);
              grammarGoal += row.item_count;
            }
          });

          if(!vocab_group_sizes || vocabGoal <= 0){
            vocab_group_sizes.push(0)
          }

          if(!grammar_group_sizes || grammarGoal <= 0){
              grammar_group_sizes.push(0)
          }

          const params = {
            dailyStudyTime: daily_study_time,
            daysToExam: days_to_exam,
            vocabGoal: vocabGoal,
            grammarGoal: grammarGoal,
            vocabGroupSizes: vocab_group_sizes,
            grammarGroupSizes: grammar_group_sizes,
            numGenerations: 50,
            solPerPop: 100,
            targetGoal: target_goal,
            level: current_level 
          };

          const args = [
            './ga.py',
            params.dailyStudyTime.toString(),
            params.daysToExam.toString(),
            params.vocabGoal.toString(),
            params.grammarGoal.toString(),
            params.vocabGroupSizes.join(','),
            params.grammarGroupSizes.join(','),
            params.numGenerations.toString(),
            params.solPerPop.toString(),
            params.targetGoal.toString(),
            params.level.toString()
          ];

          const result = await runPythonScript(args)
          const {study_plan, score} = result;

          console.log(result)
/*
          const vocab_item_features = vocab_features_list.map(item_feature => ({
            item_id: item_feature.item_id,
            level: JLPTLevel[item_feature.level_name] || -1,
            is_common: item_feature.frequency === 'Common' ? 1 : 0,
            part_of_speech: item_feature.part_of_speech || 'Unknown',
            word: item_feature.word,
            type: "vocabulary"
          }));

                
          const grammar_item_features = grammar_features_list.map(item_feature => ({
            item_id: item_feature.item_id,
            level: JLPTLevel[item_feature.level_name] || -1,
            type: "grammar"
          }));

          const all_item_features = [...vocab_item_features, ...grammar_item_features];

          const cbf_params = {
            studyPlan: study_plan,
            dailyStudyTime: daily_study_time,
            daysToExam: days_to_exam,
            vocabGroupSizes: vocab_group_sizes,
            grammarGroupSizes: grammar_group_sizes,
            itemFeatures: all_item_features
          }

          const cbf_process = spawn("python3", ["content_based_filtering.py"]);
          cbf_process .stdin.write(JSON.stringify(cbf_params));
          cbf_process .stdin.end();

          let cbfOutput = "";
          cbfProcess.stdout.on("data", (data) => {
            cbfOutput += data.toString();
          });

          cbfProcess.on("close", (code) => {
            if (code !== 0) {
              console.error(`CBF exited with code ${code}`);
              return;
            }
            const finalResult = JSON.parse(cbfOutput);
            console.log("Final Study Plan:", JSON.stringify(finalResult, null, 2));
          });*/
      } catch (error) {
          if (connection) {
            await connection.rollback();
          }
          return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
      } finally {
          if (connection) {
            connection.release();
          }
      }

  };


}

export default new study_plan_service();