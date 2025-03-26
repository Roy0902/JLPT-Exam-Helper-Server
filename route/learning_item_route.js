import express from 'express';
import learning_item_controller from '../controller/learning_item_controller.js';

const router = express.Router();

router.post('/get-user-progress', learning_item_controller.getUserProgress);
router.post('/get-subtopic-list', learning_item_controller.getSubtopicList);
router.post('/update-user-progress', learning_item_controller.updateUserProgress);
router.post('/get-category-progress', learning_item_controller.getCategoryProgress);
router.get('/get-character-item-list', learning_item_controller.getCharacterBySubtopicName);
router.get('/get-grammar-item-list', learning_item_controller.getGrammarBySubtopicName);
router.get('/get-vocabulary-item-list', learning_item_controller.getVocabularyBySubtopicName);
router.get('/get-learning-item-by-level', learning_item_controller.getLearningItemByLevelName);
router.get('/get-learning-item-by-subtopic-name', learning_item_controller.getLearningItemBySubtopicName);
router.get('/get-user-progress', learning_item_controller.getUserProgress);

export default router;