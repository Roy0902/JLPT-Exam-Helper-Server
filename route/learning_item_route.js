import express from 'express';
import learning_item_controller from '../controller/learning_item_controller.js';

const router = express.Router();

router.post('/get-user-progress', learning_item_controller.getUserProgress);
router.get('/get-subtopic-list', learning_item_controller.getSubtopicByCategoryNameAndLevel);
router.get('/get-character-item-list', learning_item_controller.getCharacterBySubtopicName);
router.get('/get-grammar-item-list', learning_item_controller.getGrammarBySubtopicName);
router.get('/get-learning-item-by-level', learning_item_controller.getLearningItemByLevelName);

export default router;