import 'dotenv/config';
import pool from '../config/database';
import subtopic from '../model/subtopic';
import item from '../model/item';

class study_plan_service{

    async generateStudyPlan(current_level, target_level, daily_study_time, days_to_exam,
                            perferences, session_token){

        if(!current_level || !target_level || !daily_study_time || !perferences || !session_token){
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
            
            const subtopic_id_list = subtopic.map(row => row.subtopic_id)
            const item_group_list = await item.getLearningItemBySubtopicID(subtopic_id_list, connection)
            const vocab_features_list = await item.geVocabularyFeatureBySubtopicID(subtopic_id_list, connection)

            if (!item_group_list || !item_group_list.length) {
              return {statusCode: 400, message: '*Failed to get item_group_list', data: null};
            }

            if (!vocab_features_list || !vocab_features_list.length) {
              return {statusCode: 400, message: '*Failed to get item_features_list', data: null};
            }

            const vocabGroupSizes = [];
            const grammarGroupSizes = [];

            let vocabGoal = 0;
            let grmmarGoal = 0;
        
            item_group_list.forEach(row => {
              if (row.category_name === 'Vocabulary') {
                vocabGroupSizes.push(row.item_count);
                vocabGoal += row.item_count;
              }else if (row.category_name === 'Grammar') {
                grammarGroupSizes.push(row.item_count);
                grammarGoal += row.item_count;
              }
            });

            const params = {
              dailyStudyTime: daily_study_time,
              daysToExam: days_to_exam,
              vocabGoal: vocabGoal,
              grammarGoal: grmmarGoal,
              vocabGroupSizes: vocabGroupSizes,
              grammarGroupSizes: grammarGroupSizes,
              numGenerations: 200,
              solPerPop: 100
            };

            const args = [
              'ga_script.py',
              params.dailyStudyTime.toString(),
              params.daysToExam.toString(),
              params.vocabGoal.toString(),
              params.grammarGoal.toString(),
              params.vocabGroupSizes.join(','),
              params.grammarGroupSizes.join(','),
              params.numGenerations.toString(),
              params.solPerPop.toString()
            ];

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
                try {
                  const result = JSON.parse(output);

                  const {study_plan, score} = result;

                  const levelToDifficulty = {
                    'N5': 1,
                    'N4': 2,
                    'N3': 3,
                    'N2': 4,
                    'N1': 5
                  };

                  const distinctPos = [...new Set(vocab_features_list.map(item => item.part_of_speech))]

                  const vocab_item_features = vocab_features_list.map(item_feature => ({
                    item_id: item_feature.item_id,
                    daily_study_time: daily_study_time,
                    study_plan: study_plan,
                    days_to_exam: days_to_exam,
                    difficulty: levelToDifficulty[item_feature.level_name] || -1,
                    is_common: item_feature.frequency === 'Common' ? 1 : 0,
                    part_of_speech: item_feature.part_of_speech || 'Unknown',
                    word: item_feature.word
                  }));
              
                } catch (e) {
                  return {statusCode: 400, 
                          message: '*Internal Error. Please try again.', 
                          data: null};

                }
              } else {
                return {statusCode: 400, 
                        message: '*Internal Error. Please try again.', 
                        data: null};
              }
            });
          

    
            return {statusCode: 200, message: 'Verify Email Successfully', data: {email}};
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