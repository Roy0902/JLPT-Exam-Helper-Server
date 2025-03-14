import express from 'express';
import otp_controller from '../controller/otp_controller.js';

const router = express.Router();

router.post('/get-sign-up-otp', otp_controller.getSignUpOtp);
router.post('/resend-otp', otp_controller.resendOtp);
router.post('/get-reset-password-otp', otp_controller.getResetPasswordOtp);
router.post('/verify-email', otp_controller.verifyEmail);

export default router;