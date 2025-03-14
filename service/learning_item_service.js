import pool from '../config/database.js';
import jwt from'jsonwebtoken'
import subtopic from '../model/subtopic.js';
import character_item from '../model/character_item.js'
import grammar_item from '../model/grammar_item.js'
import 'dotenv/config';

class learning_item_service{

    async getUserProgressByToken(level, sessionToken){
       
        // Validate input
        if (!level || !sessionToken) {
          throw {statusCode: 400, message: '*Level and session token are required.', data: null};
        }

        const decoded = jwt.verify(token, secret); 
        const email = decoded.email; 

        if(!email){
            throw {statusCode: 400, message: '*Invalid Session Token.', data: null};
        }

        console.log(email)

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();


            await connection.commit();

            return {statusCode: 201, message: 'Get user progress succcessfully.', data: null}
        } catch (error) {
          if (connection) 
            await connection.rollback();
          return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
        } finally {
          if (connection) 
            connection.release();
        }
    };

    async getSubtopicByCategoryNameAndLevel(category_name, level_name){
       
      // Validate input
      if (!category_name || !level_name) {
        throw {statusCode: 400, message: '*Category name and level name are required.', data: null};
      }

      let connection;
      try {
          connection = await pool.getConnection();
          await connection.beginTransaction();

          const rows = await subtopic.getSubtopicByCategoryNameAndLevel(category_name, level_name, connection)
          if(!rows){
            return {statusCode: 401, message: 'Unknown error.', data: null}
          }
          await connection.commit();

          return {statusCode: 201, message: 'Get user progress succcessfully.', data: rows}
      } catch (error) {
        if (connection) 
          await connection.rollback();
        return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
      } finally {
        if (connection) 
          connection.release();
      }

  };

  async getCharacterBySubtopicName(subtopic_name){
       
    // Validate input
    if (!subtopic_name) {
      throw {statusCode: 400, message: '*Subtopic name is required.', data: null};
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const rows = await character_item.getCharacterBySubtopicName(subtopic_name, connection);
        if(!rows){
          return {statusCode: 401, message: 'Unknown error.', data: null}
        }
        await connection.commit();

        return {statusCode: 201, message: 'Get character item succcessfully.', data: rows}
    } catch (error) {
      if (connection) 
        await connection.rollback();
      return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
    } finally {
      if (connection) 
        connection.release();
    }

  };

  async getGrammarBySubtopicName(subtopic_name){
       
    // Validate input
    if (!subtopic_name) {
      throw {statusCode: 400, message: '*Subtopic name is required.', data: null};
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const rows = await grammar_item.getGrammarBySubtopicName(subtopic_name, connection);
        if(!rows){
          return {statusCode: 401, message: 'Unknown error.', data: null}
        }
        await connection.commit();

        return {statusCode: 201, message: 'Get grammar item succcessfully.', data: rows}
    } catch (error) {
      if (connection) 
        await connection.rollback();
      return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
    } finally {
      if (connection) 
        connection.release();
    }

  };
}

export default new learning_item_service();