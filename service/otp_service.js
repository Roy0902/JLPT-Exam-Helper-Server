import account from '../model/account.js';
import otp from '../model/otp.js';
import email_service from '../service/email_service.js';
import pool from '../config/database.js';

class otp_service{
    async getSignUpOtp(email){
        //Check if email valid
        if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            throw {statusCode: 400, message: '*Invalid email format.', data: null};
        }

        let connection
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            //Check if email exists
            const existingAccount = await account.getAccountByEmail(email, connection);
            if (existingAccount) {
                await connection.rollback();
                return {statusCode: 403, message: '*Email already registered.', data: null};
            }

            // 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); 
            const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000 + 10 * 60 * 1000); 

            await otp.createOtp(email, otpCode, expiresAt, connection);

            await email_service.sendOtpEmail(email, otpCode);

            await connection.commit();
            return {statusCode: 201, message: 'OTP sent to your email', data: {email}};
        } catch (error) {
            if (connection) 
                await connection.rollback();
            return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
        } finally {
            if(connection)
                connection.release()
        }
    };

    async resendOtp(email){
        if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            throw {statusCode: 400, message: '*Invalid email format.', data: null};
        }
    
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
    
            const otp_code = Math.floor(100000 + Math.random() * 900000).toString(); 
            const expiresAt = new Date(Date.now() +8 * 60 * 60 * 1000 + 10 * 60 * 1000); 
    
            await otp.createOtp(email, otp_code, expiresAt, connection);
            await email_service.sendOtpEmail(email, otp_code);
    
            await connection.commit();
            return {statusCode: 201, message: 'New OTP sent to your email', data: {email}};
        } catch (error) {
            if (connection) 
              await connection.rollback();
            return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
        } finally {
            connection.release();
        };
    };

    async getResetPasswordOtp(email){
        //Check if email valid
        if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            throw {statusCode: 400, message: '*Invalid email format.', data: null};
        }
        
        let connection
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            //Check if email exists
            const existingAccount = await account.getAccountByEmail(email, connection);
            if (!existingAccount) {
                await connection.rollback();
                return {statusCode: 409, 
                        message: '*The account does not registered. Please Enter a different email.', 
                        data: null};
            }
    
            // 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); 
            const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000 + 10 * 60 * 1000); 
    
            await otp.createOtp(email, otpCode, expiresAt, connection);
            await email_service.sendOtpEmail(email, otpCode);
    
            await connection.commit();
            return {statusCode: 201, message: 'OTP sent to your email', data: {email}};
        } catch (error) {
            if (connection) 
                await connection.rollback();
            return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null };
        } finally {
            if(connection)
                connection.release()
        }
    };

    async verifyEmail(email, otp_code){
        //Check if email valid
        if (!email || !/[a-zA-Z0-9_!#$%&’*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/.test(email)) {
            throw {statusCode: 400, message: '*Invalid email format.', data: null};
        }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const otpRecord = await otp.getValidOtp(email, otp_code, connection);
            //Invalid otp_code
            if (!otpRecord) {
                return {statusCode: 403, message: '*Invalid or expired OTP', data: null};
            }

            await otp.deactivateUsedOtp(otpRecord.otp_id, connection);
            await connection.commit();
            return {statusCode: 200, message: 'Verify Email Successfully', data: {email}};
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

export default new otp_service();