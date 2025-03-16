import express from 'express';
import forum_controller from '../controller/forum_controller.js';

const router = express.Router();

router.post('/post-question', forum_controller.postQuestion);
router.get('/get-question', forum_controller.getQuestion);
router.get('/get-reply', forum_controller.getReply);
router.post('/post-reply', forum_controller.postReply);

export default router;