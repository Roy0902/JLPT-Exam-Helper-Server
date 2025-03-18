import pool from '../config/database.js';

class grammar_item {

  async getGrammarBySubtopicName(subtopic_name, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT gi.rule, gi.explanation ' + 
      'FROM subtopics s ' + 
      'INNER JOIN items i ON s.subtopic_id = i.subtopic_id ' + 
      'INNER JOIN grammar_items gi ON i.item_id = gi.item_id ' + 
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
      'SELECT gi.rule, gi.explanation ' + 
      'FROM grammar_items gi ' + 
      'LEFT JOIN items i ON i.item_id = gi.item_id ' + 
      'LEFT JOIN subtopics s ON s.subtopic_id = i.subtopic_id ' + 
      'LEFT JOIN levels l ON l.level_id = s.level_id ' + 
      'WHERE l.level_name = ? ', 
      [level_name]
    );

    return rows;
  }

}

export default new grammar_item();