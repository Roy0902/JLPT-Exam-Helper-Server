import pool from '../config/database.js';

class UserModel {
  async createUser(accountId, firstName, lastName, connection = pool) {
    await connection.execute(
      'INSERT INTO users (account_id, first_name, last_name) VALUES (?, ?, ?)',
      [accountId, firstName ?? null, lastName ?? null]
    );
  }
}

export default new UserModel();