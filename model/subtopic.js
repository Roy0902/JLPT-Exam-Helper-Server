import pool from '../config/database.js';

class subtopic {

  async getSubtopicByCategoryNameAndLevel(category_name, level_name, email, connection = pool) {
    const [rows] = await connection.execute(
      `SELECT s.*,
       CASE 
          WHEN EXISTS (
              SELECT 1 
              FROM user_progress up
              INNER JOIN accounts a ON up.account_id = a.account_id
              WHERE up.subtopic_id = s.subtopic_id 
              AND a.email = ?
              AND up.progress > 0 
          ) THEN TRUE 
          ELSE FALSE  
          END AS is_completed
       FROM subtopics s
       INNER JOIN categories c ON s.category_id = c.category_id
       INNER JOIN levels l ON s.level_id = l.level_id
       WHERE c.category_name = ?  
       AND l.level_name = ? ;  `,      
      [email, category_name, level_name])

    return rows;
  }

  async getSubtopicByLevel(current_level_name, target_level_name, email, connection = pool) {
    const [rows] = await connection.execute(
      `SELECT s.* FROM subtopics s
       JOIN levels l ON s.level_id = l.level_id
       WHERE l.level_id BETWEEN 
          (SELECT level_id FROM levels WHERE level_name = ?)
          AND (SELECT level_id FROM levels WHERE level_name = ?)
       AND s.subtopic_id NOT IN (
          SELECT up.subtopic_id 
          FROM user_progress up 
          JOIN accounts a ON up.account_id = a.account_id 
          WHERE a.email = ? )
        ORDER_BY l.level_id ASC`,      
      [current_level_name, target_level_name, email]);

    return rows;
  }


}

export default new subtopic();