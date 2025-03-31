import study_plan_service from "../service/study_plan_service.js";

const sendResponse = (res, code, message, data) => {
    return res.json({code: code, message: message, data: data });
};

const runningGenerateStudyPlan = new Map();

class study_plan_controller{

    getStudyPlanSummary = async (req, res) => {
        try {
            const {token} = req.body;
            const response = await study_plan_service.getStudyPlanSummary(token);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getStudyPlan = async (req, res) => {
        try {
            const {token} = req.body;
            const response = await study_plan_service.getStudyPlan(token);
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };

    generateStudyPlan = async (req, res) => {
        try {
            const {current_level, target_level, daily_study_time, days_to_exam,
                   target_goal, session_token} = req.body;

            if(runningGenerateStudyPlan.has(session_token)){
                console.log("Multiple calls in short time intervals")
                sendResponse(res, 400, "You have already requested to generate a new plan.", null);
                return;
            }

            runningGenerateStudyPlan.set(session_token, 0)

            const response = await study_plan_service.generateStudyPlan(
                current_level, target_level, daily_study_time, days_to_exam,
                target_goal, session_token
            );

            console.log(response)
            runningGenerateStudyPlan.delete(session_token)

            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }finally{
            
        }
    };

    getJLPTExamDate = async (req, res) => {
        try {
            const response = await study_plan_service.getJLPTExamDate()    
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };

    getStudyPlanItem = async (req, res) => {
        try {
            const {item_id_list} = req.body;
            const response = await study_plan_service.getStudyPlanItem(item_id_list);
            console.log(response)
            sendResponse(res, response.statusCode, response.message, response.data);
        }catch(error) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Internal server error';
            console.log(message)
            return sendResponse(res, statusCode, message, null);   
        }
    };

    updateStudyPlan = async (req, res) => {
        try {
            const {session_token, study_plan_item_id} = req.body;
            const response = await study_plan_service.updateStudyPlan(session_token, study_plan_item_id);
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

export default new study_plan_controller();