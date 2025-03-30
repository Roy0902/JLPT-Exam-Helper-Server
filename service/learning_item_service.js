import pool from '../config/database.js';
import jwt from'jsonwebtoken'
import subtopic from '../model/subtopic.js';
import character_item from '../model/character_item.js'
import user_progress from '../model/user_progress.js';
import grammar_item from '../model/grammar_item.js'
import 'dotenv/config';
import vocabulary_item from '../model/vocabulary_item.js';

class learning_item_service{

    async getUserProgressByToken(level, sessionToken){
       
        // Validate input
        if (!level || !sessionToken) {
          throw {statusCode: 400, message: '*Level and session token are required.', data: null};
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET); 
        const email = decoded.email; 

        if(!email){
            throw {statusCode: 400, message: '*Invalid Session Token.', data: null};
        }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const rows = user_progress.getUserProgressByEmail(email);

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

    async getSubtopicByCategoryNameAndLevel(category_name, level_name, session_token){
       
      // Validate input
      if (!category_name || !level_name) {
        throw {statusCode: 400, message: '*Category name and level name are required.', data: null};
      }

      if (!session_token) {
        throw {statusCode: 400, message: '*Session Token is required.', data: null};
      }

      const decoded = jwt.verify(session_token, process.env.JWT_SECRET); 
      const email = decoded.email; 

      if(!email){
          throw {statusCode: 400, message: '*Invalid Session Token.', data: null};
      }

      let connection;
      try {
          connection = await pool.getConnection();
          await connection.beginTransaction();

          const rows = await subtopic.getSubtopicByCategoryNameAndLevel(category_name, level_name, email, connection)
          if(!rows){
            return {statusCode: 401, message: 'Unknown error.', data: null}
          }
          await connection.commit();

          return {statusCode: 201, message: 'Get subtopic list succcessfully.', data: rows}
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

  async getVocabularyBySubtopicName(subtopic_name){
       
    // Validate input
    if (!subtopic_name) {
      throw {statusCode: 400, message: '*Subtopic name is required.', data: null};
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const rows = await vocabulary_item.getVocabularyBySubtopicName(subtopic_name, connection);
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

  async getLearningItemByLevel(level_name){
    // Validate input
    if (!level_name) {
      throw {statusCode: 400, message: '*Level name are required.', data: null};
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let characterList = await character_item.getCharacterByLevelName(level_name, connection)
        if(!characterList){
          characterList = null;
        }

        let grammarList;
        if(level_name !== 'Beginner'){
           grammarList = await grammar_item.getGrammarByLevelName(level_name, connection)
        }
        
        if(!grammarList){
          grammarList = null;
        }
        await connection.commit();
        return {statusCode: 201, 
                message: 'Get learning item succcessfully.', 
                data:{'characterList': characterList, 'grammarList': grammarList}}
    } catch (error) {
      if (connection) 
        await connection.rollback();
      return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
    } finally {
      if (connection) 
        connection.release();
    }

  };

  async getLearningItemBySubtopicName(subtopic_name){
    // Validate input
    if (!subtopic_name) {
      throw {statusCode: 400, message: '*Subtopic name are required.', data: null};
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let characterList = await character_item.getCharacterBySubtopicName(subtopic_name, connection)
        if(!characterList || characterList.length === 0){
          characterList = null;
        }

        let grammarList = await grammar_item.getGrammarBySubtopicName(subtopic_name, connection)
        
        if(!grammarList || grammarList.length === 0){
          grammarList = null;
        }

        let vocabularyList = await vocabulary_item.getVocabularyBySubtopicName(subtopic_name, connection)
        if(!vocabularyList || vocabularyList.length === 0){
          vocabularyList = null;
        }

        await connection.commit();
        return {statusCode: 201, 
                message: 'Get learning item succcessfully.', 
                data:{'characterList': characterList, 'grammarList': grammarList, 'vocabularyList': vocabularyList}}
    } catch (error) {
      if (connection) 
        await connection.rollback();
      return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
    } finally {
      if (connection) 
        connection.release();
    }

  };

  async updateUserProgress(subtopic_name, session_token){
    if (!subtopic_name) {
      throw {statusCode: 400, message: '*Subtopic name is required.', data: null};
    }

    if (!session_token) {
      throw {statusCode: 400, message: '*Session Token is required.', data: null};
    }

    const decoded = jwt.verify(session_token, process.env.JWT_SECRET); 
    const email = decoded.email; 

    if(!email){
      throw {statusCode: 400, message: '*Invalid Session Token.', data: null};
    } 

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const rows = await user_progress.updateUserProgress(subtopic_name, email, connection)
        if(!rows){
          return {statusCode: 401, message: 'Unknown error.', data: null}
        }
        await connection.commit();

        return {statusCode: 201, message: 'Update progress sucessfully.', data: null}
    } catch (error) {
      if (connection) 
        await connection.rollback();
      return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
    } finally {
      if (connection) 
        connection.release();
    }
  }

  async getCategoryProgress(level_name, session_token){
    if (!level_name) {
      throw {statusCode: 400, message: '*Level name is required.', data: null};
    }

    if (!session_token) {
      throw {statusCode: 400, message: '*Session Token is required.', data: null};
    }

    const decoded = jwt.verify(session_token, process.env.JWT_SECRET); 
    const email = decoded.email; 

    if(!email){
      throw {statusCode: 400, message: '*Invalid Session Token.', data: null};
    } 

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const rows = await user_progress.getCategoryProgress(level_name, email, connection)
        if(!rows){
          return {statusCode: 401, message: 'Unknown error.', data: null}
        }
        await connection.commit();

        return {statusCode: 201, message: 'Get category sucessfully.', data: rows}
    } catch (error) {
      if (connection) 
        await connection.rollback();
      return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
    } finally {
      if (connection) 
        connection.release();
    }
  }
}

export default new learning_item_service();