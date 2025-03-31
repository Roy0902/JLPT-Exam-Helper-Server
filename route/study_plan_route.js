import express from 'express';
import study_plan_controller from '../controller/study_plan_controller.js';

const router = express.Router();

router.post('/generate-study-plan', study_plan_controller.generateStudyPlan);
router.post('/get-study-plan-summary', study_plan_controller.getStudyPlanSummary);
router.post('/get-study-plan', study_plan_controller.getStudyPlan);
router.post('/get-learning-item-by-item-id', study_plan_controller.getStudyPlanItem);
router.post('/update-study-plan-progress', study_plan_controller.updateStudyPlan);
router.get('/get-jlpt-exam-date', study_plan_controller.getJLPTExamDate);

export default router;