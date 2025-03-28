import express from 'express';
import study_plan_controller from '../controller/study_plan_controller.js';

const router = express.Router();

router.post('/generate-study-plan', study_plan_controller.generateStudyPlan);
router.post('/get-study-plan', study_plan_controller.getStudyPlan);
router.get('/get-jlpt-exam-date', study_plan_controller.getJLPTExamDate);

export default router;