import study_plan_service from "../service/study_plan_service.js";

const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

class study_plan_controller{

    generateStudyPlan = async (req, res) => {
        try {
            const {current_level, target_level, daily_study_time, 
                   perferences, session_token} = req.body;
            const response = await study_plan_service.
                                   generateStudyPlan(current_level, target_level, daily_study_time,
                                                     perferences, session_token);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };
}

export default new study_plan_controller();