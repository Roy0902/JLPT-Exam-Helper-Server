import express from 'express';
import google_tts_controller from '../controller/google_tts_controller.js';

const router = express.Router();

router.get('/google-tts-service', google_tts_controller.getTtsService);

export default router;