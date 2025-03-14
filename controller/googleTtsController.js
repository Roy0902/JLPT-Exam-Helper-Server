import googleTtsService from "../service/googleTtsService.js";


const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

class googleTtsController {
    getTtsService = async (req, res) => {
        const text = req.query.text; 
        const lang = 'ja-JP'; 
        try {
            const response = await googleTtsService.getTtsService(text, lang);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };
}

export default new googleTtsController();
