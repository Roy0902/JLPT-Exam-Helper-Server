import express from 'express';
import account_controller from '../controller/account_controller.js';

const router = express.Router();

router.post('/sign-up', account_controller.signUp);
router.post('/reset-password', account_controller.resetPassword);
router.post('/sign-in', account_controller.signIn);
router.post('/verify-session-token', account_controller.verifySessionToken);

export default router;