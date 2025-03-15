import express from 'express';
import question_controller from '../controller/question_controller.js';

const router = express.Router();

router.post('/post-question', question_controller.postQuestion);
router.get('/get-question', question_controller.getQuestion);
router.get('/get-question', question_controller.getQuestion);

export default router;