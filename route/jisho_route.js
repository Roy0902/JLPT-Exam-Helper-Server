import express from 'express';
import jisho_controller from '../controller/jisho_controller.js';

const router = express.Router();

router.get('/search-dictionary', jisho_controller.searchDictionary);

export default router;