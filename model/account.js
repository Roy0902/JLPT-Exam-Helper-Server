import pool from '../config/database.js';

class account {
    async createAccount(email, user_name, password_hash, connection = pool) {
      await connection.execute(
        'INSERT INTO accounts (email, user_name, password_hash) VALUES (?,?,?)',
        [email, user_name, password_hash]
      );
    };
  
    async getAccountByEmail(email, connection = pool) {
      const [rows] = await connection.execute(
        'SELECT * FROM accounts WHERE email = ? ',
        [email]
      );
      return rows[0];
    };

    async getAccountByUserName(user_name, connection = pool) {
      const [rows] = await connection.execute(
        'SELECT * FROM accounts WHERE user_name = ? ',
        [user_name]
      );
      return rows[0];
    };

    async getEmailAndPasswordByEmail(email, connection = pool) {
      const [rows] = await connection.execute(
        'SELECT email, password_hash FROM accounts WHERE email = ? ',
        [email]
      );
      return rows[0];
    };

    async getAccountIDByEmail(email, connection = pool){
      'SELECT account_id FROM accounts WHERE email = ? ',
      [email]
    }


    async updatePasswordByEmail(email, password_hash, connection = pool) {
      await connection.execute(
        'UPDATE accounts SET password_hash = ? WHERE email = ?',
        [password_hash, email]
      );
    };

    async updateLastLoginTime(email,  connection = pool) {
      await connection.execute(
        'UPDATE accounts SET last_login_at = Now()'
      );
    };

  }
  
  export default new account();