import pool from '../config/database.js';
import jwt from'jsonwebtoken'
import 'dotenv/config';

class learningItemService{

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



            let password_hash = null;
            if (password) {
              password_hash = await bcrypt.hash(password, 10); 
            }

            await accountModel.createAccount(email, user_name, password_hash, connection);
            await connection.commit();

            return {statusCode: 201, message: 'Sign Up Success.', data: null}
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

export default new learningItemService();