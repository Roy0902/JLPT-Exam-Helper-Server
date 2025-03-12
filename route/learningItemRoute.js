import express from 'express';
import accountController from '../controller/accountController.js';

const router = express.Router();

router.post('/get-user-progress', learningItemController.getUserProgress);

export default router;