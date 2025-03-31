import 'dotenv/config';
import pool from '../config/database.js';
import jwt from'jsonwebtoken'
import subtopic from '../model/subtopic.js';
import study_plan from '../model/study_plan.js';
import jlpt_exam_date from '../model/jlpt_exam_date.js'
import grammar_item from '../model/grammar_item.js';
import vocabulary_item from '../model/vocabulary_item.js';
import item from '../model/item.js';
import {spawn} from 'child_process';
import account from '../model/account.js';
import firebase_service from './firebase_service.js';

async function runGA(args) {
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

async function runCBF(params, scriptPath = './content_based_filtering.py') {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [scriptPath]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdin.write(JSON.stringify(params));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse output: ${e.message}. Output: ${output}`));
        }
      } else {
        reject(new Error(`Python script exited with code ${code}. Error: ${errorOutput}`));
      }
    });
  });
}

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

    async getStudyPlanSummary(session_token){
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

          const row = await study_plan.getStudyPlanSummary(email, connection)

          connection.commit()

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

  async getStudyPlanItem(item_id_list){
    if(!item_id_list){
      throw {statusCode: 400, message: '*Item ID List is required.', data: null};
   }
  
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let grammarList = await grammar_item.getGrammarByItemIDList(item_id_list, connection)
        let vocabularyList = await vocabulary_item.getVocabularyByItemIDList(item_id_list, connection)

        if(!grammarList || grammarList.length === 0){
          grammarList = null
        }

        if(!vocabularyList || vocabularyList.length === 0){
          vocabularyList = null;
        }

        connection.commit()

        return {statusCode: 201, 
          message: 'Get study plan item succcessfully.', 
          data:{'grammarList': grammarList, 'vocabularyList': vocabularyList}}
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

  async updateStudyPlan(session_token, study_plan_item_id){
    if(!session_token ||!study_plan_item_id){
      throw {statusCode: 400, message: '*Session Token and study plan item id are required.', data: null};
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

        await study_plan.updateStudyPlan(email, study_plan_item_id)
        connection.commit()

        return {statusCode: 201, 
          message: 'Updated Study Plan Status.', 
          data: null}
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

  async generateStudyPlan(current_level, target_level, daily_study_time, days_to_exam,
                           target_goal, session_token){

      //Check Parameters
      if(!current_level || !target_level || !daily_study_time || !days_to_exam || !session_token || !target_goal){
          throw {statusCode: 400, message: '*Missing Parameters.', data: null};
      }

      const decoded = jwt.verify(session_token, process.env.JWT_SECRET); 
      const email = decoded.email; 

      if (!email) {
          throw {statusCode: 400, message: '*Invalid Session Token.', data: null};
      }

      //Fetch study materials from database
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

          const vocab_subtopic_id = [];
          const grammar_subtopic_id = [];

          //Preprocess GA parameters
          let vocabGoal = 0;
          let grammarGoal = 0;
      
          // Map GA group ID to subtopic_id
          item_group_list.forEach(row => {
            if (row.category_name === 'Vocabulary') {
              vocab_group_sizes.push(row.item_count);
              vocabGoal += row.item_count;
              vocab_subtopic_id.push(row.subtopic_id); 
            }else if (row.category_name === 'Grammar') {
              grammar_group_sizes.push(row.item_count);
              grammarGoal += row.item_count;
              grammar_subtopic_id.push(row.subtopic_id);
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
            targetGoal: target_goal,
            level: current_level 
          };

          //Call python script to run GA
          const args = [
            './ga.py',
            params.dailyStudyTime.toString(),
            params.daysToExam.toString(),
            params.vocabGoal.toString(),
            params.grammarGoal.toString(),
            params.vocabGroupSizes.join(','),
            params.grammarGroupSizes.join(','),
            params.targetGoal.toString(),
            params.level.toString()
          ];


          const result = await runGA(args)
          const {study_plans, score} = result;     //Result of GA

          console.log(score)
          //Bad study plan
          /*if(score <= 0){
            return {statusCode: 500, message: '*Bad Study Plan', data: null};
          }*/
          
          //Preparation of CBF
          const JLPTLevel = {
            'N5': 5, 
            'N4': 4, 
            'N3': 3, 
            'N2': 2, 
            'N1': 1
          }

          const subtopic_id_map = {};

          vocab_subtopic_id.forEach((subtopic_id, index) => {
            subtopic_id_map[index + 1] = subtopic_id; 
          });

          grammar_subtopic_id.forEach((subtopic_id, index) => {
            subtopic_id_map[vocab_group_sizes.length + index + 1] = subtopic_id;
          });

          const daily_study_plans = [];
          for (let i = 0; i < study_plans.length; i += daily_study_time) {
            daily_study_plans.push(study_plans.slice(i, i + daily_study_time));
          }

          const vocab_item_features = vocab_features_list.map(item_feature => ({
            item_id: item_feature.item_id,
            subtopic_id: item_feature.subtopic_id,
            level: JLPTLevel[item_feature.level_name] || -1,
            is_common: item_feature.frequency === 'Common' ? 1 : 0,
            part_of_speech: item_feature.part_of_speech || 'Unknown',
            word: item_feature.word,
            type: "vocabulary"
          }));
                
          const grammar_item_features = grammar_features_list.map(item_feature => ({
            item_id: item_feature.item_id,
            subtopic_id: item_feature.subtopic_id,
            level: JLPTLevel[item_feature.level_name] || -1,
            type: "grammar"
          }));

          const cbf_params = {
            dailyStudyPlan: daily_study_plans,
            dailyStudyTime: daily_study_time,
            daysToExam: days_to_exam,
            vocabGroupSizes: vocab_group_sizes,
            grammarGroupSizes: grammar_group_sizes,
            vocabItemFeatures: vocab_features_list,
            grammarItemFeatures: grammar_features_list,
            groupMapping: subtopic_id_map
          };
      
          //Call CBF Python Script
          const cbf_result = await runCBF(cbf_params);

          //Insert result to the database
          const acc = await account.getAccountByEmail(email, connection)

          if(!acc){
            return {statusCode: 400, message: 'Account not found.', data: null};
          }


          await study_plan.deleteExistStudyPlan(acc.account_id, connection)
          await study_plan.insertStudyPlan(acc.account_id, score, cbf_result, connection)
          await firebase_service.sendNotificationToUser(acc.firebase_token)

          await connection.commit()

          console.log("SCORE: " , score)
          return {statusCode: 201, message: 'Study Plan generated.', data: null};
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
    }
  
};

export default new study_plan_service();