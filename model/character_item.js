import pool from '../config/database.js';

class character_item {

  async getCharacterBySubtopicName(subtopic_name, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT hki.japanese_character, hki.pronunciation ' + 
      'FROM subtopics s ' + 
      'INNER JOIN items i ON s.subtopic_id = i.subtopic_id ' + 
      'INNER JOIN hiragana_katakana_items hki ON i.item_id = hki.item_id ' + 
      'WHERE s.name = ? ', 
      [subtopic_name]
    );

    return rows;
  }

  async getCharacterByLevelName(level_name, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT hki.japanese_character, hki.pronunciation ' + 
      'FROM hiragana_katakana_items hki ' + 
      'LEFT JOIN items i ON hki.item_id = i.item_id ' + 
      'LEFT JOIN subtopics s ON s.subtopic_id = i.subtopic_id ' + 
      'LEFT JOIN levels l ON l.level_id = s.level_id ' + 
      'WHERE l.level_name = ? ', 
      [level_name]
    );

    return rows;
  }
}

export default new character_item();