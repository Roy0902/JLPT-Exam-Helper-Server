import pool from '../config/database.js';

class characterItemModel {

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
}

export default new characterItemModel();