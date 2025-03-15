import jisho_service from "../service/jisho_service.js";

const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

class jisho_controller {

    searchDictionary = async (req, res) => {
        try {
            const {keyword} = req.query; 
            const response = await jisho_service.searchDictionary(keyword);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };
 
}

export default new jisho_controller();