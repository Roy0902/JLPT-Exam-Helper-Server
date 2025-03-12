import learningItemService from "../service/learningItemService";

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
 
}

export default new learningItemController();