import otpService from "../service/otpService.js";

const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

class otpController {

    getSignUpOtp = async (req, res) => {
        try {
            const {email} = req.body;
            const response = await otpService.getSignUpOtp(email);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    resendOtp = async (req, res) => {
        try {
            const {email} = req.body;
            const response = await otpService.resendOtp(email);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getResetPasswordOtp = async (req, res) => {
        try {
            const {email} = req.body;
            const response = await otpService.getResetPasswordOtp(email);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    verifyEmail = async (req, res) => {
        try {
            const  {email, otp_code} = req.body;
            const response = await otpService.verifyEmail(email, otp_code);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };
};

export default new otpController();