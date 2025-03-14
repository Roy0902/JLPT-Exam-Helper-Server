import pool from '../config/database.js';

class otpModel {
  async createOtp(email, otp, expiresAt, connection = pool) {
    await connection.execute(
      'INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );
  }

  async getValidOtp(email, otp, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT * FROM otps WHERE email = ? AND otp_code = ? AND expires_at > NOW() and is_used = 0 ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );
    return rows[0] || null;
  }

  async deactivateUsedOtp(otpId, connection = pool) {
    await connection.execute('UPDATE otps set is_used = 1 WHERE otp_id = ?', [otpId]);
  }
}

export default new otpModel();