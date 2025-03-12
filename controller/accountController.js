import accountService from "../service/accountService.js";

const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

class accountController {

    signUp = async (req, res) => {
        try {
            const {email, user_name, password} = req.body;
            const response = await accountService.signUp(email, user_name, password);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    resetPassword = async (req, res) => {
        try {
            const {email, password} = req.body;
            const response = await accountService.resetPassword(email, password);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    signIn = async (req, res) => {
        try {
            const {email, password} = req.body;
            const response = await accountService.signIn(email, password);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    verifySessionToken = async (req, res) => {
        try {
            const {token} = req.body;
            const response = await accountService.verifySessionToken(token);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };
}

export default new accountController();