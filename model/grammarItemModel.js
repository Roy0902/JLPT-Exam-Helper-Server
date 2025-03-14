import pool from '../config/database.js';

class grammarItemModel {

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
}

export default new grammarItemModel();