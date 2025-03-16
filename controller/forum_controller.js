import forum_service from "../service/forum_service.js";

const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

class forum_controller {

    postQuestion = async (req, res) => {
        try {
            const {session_token, question_title, question_description} = req.body;
            const response = await forum_service.postQuestion(question_title, question_description, session_token);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getQuestion = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const response = await forum_service.getQuestion(page, limit);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getReply = async (req, res) => {
        try {
            const {page, limit, question_id} = req.query;
            const response = await forum_service.getReply(page, limit, question_id);
            console.log(response)
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };

    postReply = async (req, res) => {
        try {
            const {session_token ,reply_text, question_id} = req.body;
            const response = await forum_service.postReply(session_token ,reply_text, question_id);
            console.log(response)
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };


}

export default new forum_controller();