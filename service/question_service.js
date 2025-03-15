import account from '../model/account.js';
import question from '../model/question.js';
import pool from '../config/database.js';
import 'dotenv/config';

class question_service{
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
}

export default new question_service();