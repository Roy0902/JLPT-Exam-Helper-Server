import pool from '../config/database.js';

class vocabulary_item{
  async getVocabularyBySubtopicName(subtopic_name, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT vi.* ' + 
      'FROM vocabulary_items vi ' + 
      'LEFT JOIN items i ON vi.item_id = i.item_id ' + 
      'LEFT JOIN subtopics s ON i.subtopic_id = s.subtopic_id ' + 
      'WHERE s.name = ? ', 
      [subtopic_name]
    );

    return rows;
  }

  async getVocabularyByLevelName(level_name, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT vi.* ' + 
      'FROM vocabulary_items vi ' + 
      'LEFT JOIN items i ON vi.item_id = i.item_id ' + 
      'LEFT JOIN subtopics s ON s.subtopic_id = i.subtopic_id ' + 
      'LEFT JOIN levels l ON l.level_id = s.level_id ' + 
      'WHERE l.level_name = ? ', 
      [level_name]
    );

    return rows;
  }

}

export default new vocabulary_item();