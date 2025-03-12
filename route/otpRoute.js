import express from 'express';
import otpController from '../controller/otpController.js';

const router = express.Router();

router.post('/get-sign-up-otp', otpController.getSignUpOtp);
router.post('/resend-otp', otpController.resendOtp);
router.post('/get-reset-password-otp', otpController.getResetPasswordOtp);
router.post('/verify-email', otpController.verifyEmail);

export default router;