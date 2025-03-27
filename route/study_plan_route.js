import express from 'express';
import study_plan_controller from '../controller/study_plan_controller.js';

const router = express.Router();

router.post('/generate-study-plan', study_plan_controller.generateStudyPlan);

export default router;