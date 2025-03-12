import express from 'express';
import accountController from '../controller/accountController.js';

const router = express.Router();

router.post('/sign-up', accountController.signUp);
router.post('/reset-password', accountController.resetPassword);
router.post('/sign-in', accountController.signIn);
router.post('/verify-session-token', accountController.verifySessionToken);

export default router;