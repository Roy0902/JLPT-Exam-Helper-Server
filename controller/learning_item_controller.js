import learning_item_service from "../service/learning_item_service.js";

const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

class learning_item_controller {

    getUserProgress = async (req, res) => {
        try {
            const {level, sessionToken} = req.body;
            const response = await learning_item_service.getUserProgressByToken(level, sessionToken);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getSubtopicList = async (req, res) => {
        try {
            const {category_name, level_name, session_token} = req.body; 
            const response = await learning_item_service.
                             getSubtopicByCategoryNameAndLevel(category_name, level_name, session_token);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getCharacterBySubtopicName = async (req, res) => {
        try {
            const {subtopic_name} = req.query; 
            const response = await learning_item_service.getCharacterBySubtopicName(subtopic_name);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getGrammarBySubtopicName = async (req, res) => {
        try {
            const {subtopic_name} = req.query; 
            const response = await learning_item_service.getGrammarBySubtopicName(subtopic_name);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };
    
    getVocabularyBySubtopicName = async (req, res) => {
        try {
            const {subtopic_name} = req.query; 
            const response = await learning_item_service.getVocabularyBySubtopicName(subtopic_name);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getLearningItemBySubtopicName = async (req, res) => {
        try {
            const {subtopic_name} = req.query; 
            const response = await learning_item_service.getLearningItemBySubtopicName(subtopic_name);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getLearningItemByLevelName = async (req, res) => {
        try {
            const {level_name} = req.query; 
            const response = await learning_item_service.getLearningItemByLevel(level_name);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };

    updateUserProgress = async (req, res) => {
        try {
            const {subtopic_name, session_token} = req.body; 
            const response = await learning_item_service.
                             updateUserProgress(subtopic_name, session_token);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getCategoryProgress = async (req, res) => {
        try {
            const {level_name, session_token} = req.body; 
            const response = await learning_item_service.
                             getCategoryProgress(level_name, session_token);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };
 
}

export default new learning_item_controller();