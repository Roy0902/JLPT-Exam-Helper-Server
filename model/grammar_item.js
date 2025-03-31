import pool from '../config/database.js';

class grammar_item {

  async getGrammarBySubtopicName(subtopic_name, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT gi.* ' + 
      'FROM grammar_items gi ' + 
      'LEFT JOIN items i ON gi.item_id = i.item_id ' + 
      'LEFT JOIN subtopics s ON i.subtopic_id = s.subtopic_id ' + 
      'WHERE s.name = ? ', 
      [subtopic_name]
    );

    return rows;
  }

  async getGrammarByLevel(level, connection = pool){
    const [rows] = await db.query(
      `SELECT gi.*
       FROM grammar_items gi
       JOIN items i ON gi.item_id = i.item_id
       JOIN subtopics s ON i.subtopic_id = s.subtopic_id
       JOIN levels l ON s.level_id = l.level_id
       WHERE l.level_name = ? `,
      [level]);
    
    return rows
  }

  async getGrammarByLevelName(level_name, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT gi.rule as rule, gi.explanation as explanation ' + 
      'FROM grammar_items gi ' + 
      'LEFT JOIN items i ON i.item_id = gi.item_id ' + 
      'LEFT JOIN subtopics s ON s.subtopic_id = i.subtopic_id ' + 
      'LEFT JOIN levels l ON l.level_id = s.level_id ' + 
      'WHERE l.level_name = ? ', 
      [level_name]
    );

    return rows;
  }

  async getGrammarByItemIDList(item_id_list, connection = pool) {
    if (!item_id_list || item_id_list.length === 0) {
      return [];
    }

    const conditions = item_id_list.map(() => 'item_id = ?').join(' OR ');
    const query = `SELECT * FROM grammar_items WHERE ${conditions}`;

    const [rows] = await connection.execute(query, item_id_list);
    return rows;
  }

}

export default new grammar_item();