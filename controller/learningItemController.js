import learningItemService from "../service/learningItemService.js";

const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

class learningItemController {

    getUserProgress = async (req, res) => {
        try {
            const {level, sessionToken} = req.body;
            const response = await learningItemService.getUserProgressByToken(level, sessionToken);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getSubtopicByCategoryNameAndLevel = async (req, res) => {
        try {
            const category_name = req.query.category_name; 
            const level_name = req.query.level_name;
            const response = await learningItemService.getSubtopicByCategoryNameAndLevel(category_name, level_name);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getCharacterBySubtopicName = async (req, res) => {
        try {
            const subtopic_name = req.query.subtopic_name; 
            const response = await learningItemService.getCharacterBySubtopicName(subtopic_name);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getGrammarBySubtopicName = async (req, res) => {
        try {
            const subtopic_name = req.query.subtopic_name; 
            const response = await learningItemService.getGrammarBySubtopicName(subtopic_name);
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

export default new learningItemController();