import pool from '../config/database.js';

class character_item {

  async getCharacterBySubtopicName(subtopic_name, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT hki.* ' + 
      'FROM hiragana_katakana_items hki ' + 
      'LEFT JOIN items i ON hki.item_id = i.item_id ' + 
      'LEFT JOIN subtopics s ON i.subtopic_id = s.subtopic_id ' + 
      'WHERE s.name = ? ', 
      [subtopic_name]
    );

    return rows;
  }

  async getCharacterByLevelName(level_name, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT hki.* ' + 
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