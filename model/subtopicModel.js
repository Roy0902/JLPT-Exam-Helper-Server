import pool from '../config/database.js';

class subtopicModel {

  async getSubtopicByCategoryNameAndLevel(category_name, level_name, connection = pool) {
    const [rows] = await connection.execute(
      'SELECT s.name FROM subtopics s ' + 
      'INNER JOIN categories c ON s.category_id = c.category_id ' + 
      'INNER JOIN levels l ON s.level_id = l.level_id ' + 
      'WHERE category_name = ? ' + 
      'AND level_name = ? ', 
      [category_name, level_name]
    );

    return rows;
  }
}

export default new subtopicModel();