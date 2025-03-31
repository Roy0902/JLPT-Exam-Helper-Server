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

  async getVocabularyByItemIDList(item_id_list, connection = pool) {
    if (!item_id_list || item_id_list.length === 0) {
      return [];
    }

    const conditions = item_id_list.map(() => 'item_id = ?').join(' OR ');
    const query = `SELECT * FROM vocabulary_items WHERE ${conditions}`;

    const [rows] = await connection.execute(query, item_id_list);
    return rows;
  }

}

export default new vocabulary_item();