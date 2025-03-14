import express from 'express';
import googleTtsController from '../controller/googleTtsController.js';

const router = express.Router();

router.get('/google-tts-service', googleTtsController.getTtsService);

export default router;