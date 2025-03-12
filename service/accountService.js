import accountModel from '../model/accountModel.js';
import sessionTokenModel from '../model/sessionTokenModel.js';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import jwt from'jsonwebtoken'
import 'dotenv/config';
import { now } from 'sequelize/lib/utils';

class accountService{

    async signUp(email, user_name, password){
       
        // Validate input
        if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
          throw {statusCode: 400, message: '*Invalid email format.', data: null};
      }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const existingAccount = await accountModel.getAccountByUserName(user_name, connection);

            if (existingAccount) {
              await connection.rollback();
              return {statusCode: 400, message: '*User Name already exists', data: null};
            }

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

    async resetPassword(email, password){
        // Validate inputs
        if (!email || !password) {
          throw {statusCode: 400, message: '*Email and new password are required.'};
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
          throw {statusCode: 400, message: '*Invalid email format.', data: null};
        }
    
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const account = await accountModel.getAccountByEmail(email, connection);
            if (!account) {
            await connection.rollback();
              return {statusCode: 403, message: '*Account not found.', data: null};
            }

            // Hash new password
            const password_hash = await bcrypt.hash(password, 10);
            accountModel.updatePasswordByEmail(email, password_hash)
            await connection.commit();

            return {statusCode: 201, message: 'Password changed successfully.', data: null};
        } catch (error) {
            if (connection) 
              await connection.rollback();
            return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
        } finally {
            if (connection) 
              connection.release();
        }
    };

    async signIn(email, password){
      // Validate inputs
      if (!email || !password) {
        throw {statusCode: 400, message: 'Email and new password are required.'};
      }

      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        throw {statusCode: 400, message: 'Invalid email format.'};
      }
  
      let connection;
      try {
          connection = await pool.getConnection();
          await connection.beginTransaction();

          const account = await accountModel.getEmailAndPasswordByEmail(email, connection);
          if(!account){
            await connection.rollback();
            return {statusCode: 403, message: 'Account does not exist.', data: null};
          }


          const isMatch = await bcrypt.compare(password, account.password_hash);
          if (!isMatch) {
            return { statusCode: 403, message: 'Incorrect email or password', data: null};
          }

          // Generate JWT token
          const token = jwt.sign(
            {email: account.email},
            process.env.JWT_SECRET
          );

          await sessionTokenModel.insertToken(email, token, connection);
          await accountModel.updateLastLoginTime(email, connection);
          await connection.commit();

          return {statusCode: 200, message: 'Sign In Successfully.', data: {token}};
      } catch (error) {
          if (connection) 
            await connection.rollback();
          return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
      } finally {
          if (connection) 
            connection.release();
      }
  };

  async verifySessionToken(token){
    // Validate inputs
    if (!token) {
      throw {statusCode: 400, message: 'Token are required.'};
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const sessionToken = await sessionTokenModel.getEmailByToken(token, connection);
        if(!sessionToken){
          await connection.rollback();
          return {statusCode: 403, message: 'The session token was expired.', data: null};
        }

        await connection.commit();
        return {statusCode: 200, message: 'Valid Token.', data: {token}};
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

export default new accountService();