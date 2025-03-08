import pool from '../config/database.js';

class OtpModel {
  async createOtp(accountId, otp, expiresAt, connection = pool) {
    await connection.execute(
      'INSERT INTO otps (account_id, otp, expires_at) VALUES (?, ?, ?)',
      [accountId, otp, expiresAt]
    );
  }

  async getValidOtp(accountId, otp, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT * FROM otps WHERE account_id = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [accountId, otp]
    );
    return rows[0];
  }

  async deleteOtp(otpId, connection = pool) {
    await connection.execute('DELETE FROM otps WHERE id = ?', [otpId]);
  }
}

export default new OtpModel();