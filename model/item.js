import pool from '../config/database.js';

class item {

  async getLearningItemBySubtopicID(subtopic_id_list, connection = pool) {
    const placeholders = subtopic_id_list.map(() => '?').join(',');
    const [rows] = await connection.execute(
    `SELECT 
     i.subtopic_id, c.category_name, COUNT(i.item_id) AS item_count FROM items i
     JOIN categories c ON i.category_id = c.category_id
     WHERE i.subtopic_id IN (${placeholders})
     GROUP BY i.subtopic_id, c.category_name;` ,
     subtopic_id_list
    );

    return rows;
  }

  async getVocabularyFeatureBySubtopicID(subtopic_id_list, connection = pool) {
    const placeholders = subtopic_id_list.map(() => '?').join(',');
    const [rows] = await connection.execute(
    `SELECT vi.* , l.level_name, c.category_name, s.name FROM vocabulary_items vi
     JOIN items i on vi.item_id = i.item_id 
     JOIN categories c ON i.category_id = c.category_id
     JOIN subtopics s ON i.subtopic_id = s.subtopic_id
     JOIN levels l ON s.level_id = l.level_id
     WHERE i.subtopic_id IN (${placeholders})` ,
     subtopic_id_list
    );

    return rows;
  }

  async getGrammarFeatureBySubtopicID(subtopic_id_list, connection = pool) {
    const placeholders = subtopic_id_list.map(() => '?').join(',');
    const [rows] = await connection.execute(
    `SELECT gi.* , l.level_name, c.category_name, s.name FROM grammar_items gi
     JOIN items i on gi.item_id = i.item_id 
     JOIN categories c ON i.category_id = c.category_id
     JOIN subtopics s ON i.subtopic_id = s.subtopic_id
     JOIN levels l ON s.level_id = l.level_id
     WHERE i.subtopic_id IN  (${placeholders})` ,
     subtopic_id_list
    );

    return rows;
  }



}

export default new item();