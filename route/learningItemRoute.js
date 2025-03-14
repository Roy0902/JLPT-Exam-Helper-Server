import express from 'express';
import learningItemController from '../controller/learningItemController.js';

const router = express.Router();

router.post('/get-user-progress', learningItemController.getUserProgress);
router.get('/get-subtopic-list', learningItemController.getSubtopicByCategoryNameAndLevel);
router.get('/get-character-item-list', learningItemController.getCharacterBySubtopicName);
router.get('/get-grammar-item-list', learningItemController.getGrammarBySubtopicName);

export default router;