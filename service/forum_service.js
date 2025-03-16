import account from '../model/account.js';
import question from '../model/question.js';
import reply from '../model/reply.js';
import pool from '../config/database.js';
import 'dotenv/config';

class forum_service{
    async postQuestion(question_title, question_description, session_token){
        //Check if email valid
        if (!question_title || !question_description) {
            throw {statusCode: 400, message: '*Incompleted Question.', data: null};
        }

        if (!session_token) {
            throw {statusCode: 400, message: '*Session Token is required.', data: null};
        }


        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const result = await account.getAccountBySessionToken(session_token, connection)
            if(!result){
              await connection.rollback();
              return {statusCode: 403, message: '*Invalid User.', data: null};
            }

            await question.insertQuestion(result, question_title, question_description, connection);
            await connection.commit();
            return {statusCode: 201, message: 'Posted Question.', data: null};
        }catch (error) {
            if (connection) 
              await connection.rollback();
            return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
        } finally {
            if (connection) 
              connection.release();
        }
    };

    async getQuestion(page, limit){
        const offset = (page - 1) * limit;

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const rows = await question.getQuestion(limit, offset, connection)
            if(!rows){
              await connection.rollback();
              return {statusCode: 403, message: '*Failed to get question list.', data: null};
            }
            await connection.commit();
            return {statusCode: 201, message: 'Get Question.', data: rows};
        }catch (error) {
            if (connection) 
              await connection.rollback();
            return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
        } finally {
            if (connection) 
              connection.release();
        }

        
    };

    async getReply(page, limit, question_id){
      const offset = (page - 1) * limit;

      let connection;
      try {
          connection = await pool.getConnection();
          await connection.beginTransaction();

          const rows = await reply.getReply(limit, offset, question_id, connection)
          if(!rows){
            await connection.rollback();
            return {statusCode: 403, message: '*Failed to get reply list.', data: null};
          }
          await connection.commit();
          return {statusCode: 201, message: 'Get reply.', data: rows};
      }catch (error) {
          if (connection) 
            await connection.rollback();
          return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
      } finally {
          if (connection) 
            connection.release();
      }
    };

    async postReply(session_token ,reply_text, question_id){
      //Check if email valid
      if (!reply_text ||!question_id) {
          throw {statusCode: 400, message: '*Incompleted reply.', data: null};
      }

      if (!session_token) {
          throw {statusCode: 400, message: '*Session Token is required.', data: null};
      }

      let connection;
      try {
          connection = await pool.getConnection();
          await connection.beginTransaction();

          const result = await account.getAccountBySessionToken(session_token, connection)
          console.log("Test")
          if(!result){
            await connection.rollback();
            return {statusCode: 403, message: '*Invalid User.', data: null};
          }

          console.log("Test")
          await reply.insertReply(result, reply_text, question_id, connection);

          await connection.commit();
          return {statusCode: 201, message: 'Posted Reply.', data: null};
      }catch (error) {
          if (connection) 
            await connection.rollback();
          return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
      } finally {
          if (connection) 
            connection.release();
      }
  };
}

export default new forum_service();