import AccountModel from '../model/AccountModel.js';
import UserModel from '../model/UserModel.js';
import OtpModel from '../model/OtpModel.js';
import EmailService from '../service/EmailService.js';
import pool from '../config/database.js';

class AuthController {
  signup = async (req, res) => {
    const { email, firstName, lastName } = req.body;

    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const existingAccount = await AccountModel.getAccountByEmail(email, connection);
      if (existingAccount) {
        throw new Error('Email already registered', { cause: { status: 409 } });
      }

      const accountId = await AccountModel.createAccount(email, connection);
      await UserModel.createUser(accountId, firstName, lastName, connection);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await OtpModel.createOtp(accountId, otp, expiresAt, connection);

      await EmailService.sendOtpEmail(email, otp);

      await connection.commit();
      res.status(201).json({ message: 'Sign-up successful, OTP sent to your email' });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Signup Error:', error);
      res.status(error.cause?.status ?? 500).json({ message: error.message ?? 'Internal server error' });
    } finally {
      if (connection) connection.release();
    }
  };

  verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Valid email and 6-digit OTP are required' });
    }

    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const account = await AccountModel.getAccountByEmail(email, connection);
      if (!account) {
        throw new Error('Account not found', { cause: { status: 404 } });
      }
      if (account.is_verified) {
        throw new Error('Account already verified', { cause: { status: 400 } });
      }

      const otpRecord = await OtpModel.getValidOtp(account.id, otp, connection);
      if (!otpRecord) {
        throw new Error('Invalid or expired OTP', { cause: { status: 400 } });
      }

      await AccountModel.updateVerificationStatus(account.id, true, connection);
      await OtpModel.deleteOtp(otpRecord.id, connection);

      await connection.commit();
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Verification Error:', error);
      res.status(error.cause?.status ?? 500).json({ message: error.message ?? 'Internal server error' });
    } finally {
      if (connection) connection.release();
    }
  };
}

export default new AuthController();