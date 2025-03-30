import account_service from "../service/account_service.js";

const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

class account_controller {

    signUp = async (req, res) => {
        try {
            const {email, user_name, password} = req.body;
            const response = await account_service.signUp(email, user_name, password);
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
            const response = await account_service.resetPassword(email, password);
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
            const response = await account_service.signIn(email, password);
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
            const response = await account_service.verifySessionToken(token);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    updateFirebaseToken = async (req, res) => {
        try {
            const {session_token, firebase_token} = req.body;
            const response = await account_service.updateFirebaseToken(session_token, firebase_token);
            console.log(response)
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };
}

export default new account_controller();