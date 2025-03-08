import express from 'express';
import AuthController from '../controller/AuthController.js';

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/verify-otp', AuthController.verifyOtp);

export default router;