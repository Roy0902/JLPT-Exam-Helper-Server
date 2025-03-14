import google_tts_service from "../service/google_tts_service.js";


const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

class google_tts_controller {
    getTtsService = async (req, res) => {
        const {text} = req.query; 
        const lang = 'ja-JP'; 
        try {
            const response = await google_tts_service.getTtsService(text, lang);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };
}

export default new google_tts_controller