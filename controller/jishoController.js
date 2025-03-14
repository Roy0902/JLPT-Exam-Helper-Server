import jishoService from "../service/jishoService.js";

const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

class jishoController {

    searchDictionary = async (req, res) => {
        try {
            const keyword = req.query.keyword; 
            const response = await jishoService.searchDictionary(keyword);
            console.log(response)
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };
 
}

export default new jishoController();