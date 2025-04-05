import pool from '../config/database.js';

class session_token {
  async insertToken(email, session_tokens, connection = pool) {
    await connection.execute(
      'INSERT INTO session_tokens (email, token) VALUES (?, ?)',
      [email, session_tokens]
    );
  }

  async getEmailByToken(session_tokens, connection = pool) {
    const [rows] = await connection.execute(
      'Select email from session_tokens where token = ? and is_revoked = 0',
      [session_tokens]
    );

    return rows[0];
  }

  async deactivateSessionToken(session_token, connection = pool) {
    await connection.execute(
      'UPDATE session_tokens set is_revoked = 1 where token = ? ',
      [session_token]
    );
  }
}

export default new session_token();