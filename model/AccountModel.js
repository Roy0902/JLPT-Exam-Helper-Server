import pool from '../config/database.js';

class AccountModel {
    async createAccount(email, connection = pool) {
      const [result] = await connection.execute(
        'INSERT INTO accounts (email) VALUES (?)',
        [email]
      );
      return result.insertId;
    }
  
    async getAccountByEmail(email, connection = pool) {
      const [rows] = await connection.execute(
        'SELECT * FROM accounts WHERE email = ? AND is_active = TRUE',
        [email]
      );
      return rows[0];
    }
  
    async updateVerificationStatus(accountId, isVerified, connection = pool) {
      await connection.execute(
        'UPDATE accounts SET is_verified = ?, updated_at = NOW() WHERE id = ?',
        [isVerified, accountId]
      );
    }
  }
  
  export default new AccountModel();