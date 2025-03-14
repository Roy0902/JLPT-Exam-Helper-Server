import express from 'express';
import jishoController from '../controller/jishoController.js';

const router = express.Router();

router.get('/search-dictionary', jishoController.searchDictionary);

export default router;