class user_progress {
    async getCategoryProgress(level_name, email,  connection = pool) {
        const [rows] = await connection.execute(
              `SELECT c.category_name,
                COUNT(DISTINCT s.subtopic_id) AS total_subtopics,
                COUNT(up.user_progress_id) AS completed_subtopics
              FROM subtopics s
              INNER JOIN categories c ON s.category_id = c.category_id
              INNER JOIN levels l ON s.level_id = l.level_id
              LEFT JOIN (
                  user_progress up
                  INNER JOIN accounts a ON up.account_id = a.account_id AND a.email = ?
              ) ON up.subtopic_id = s.subtopic_id
              WHERE l.level_name = ?
              GROUP BY c.category_name;`,
              [email, level_name]);

        return rows;
    }

    async updateUserProgress(subtopic_name, email, connection = pool) {
      const [rows] = await connection.execute(
          `INSERT INTO user_progress (account_id, subtopic_id, progress)
           VALUES ((SELECT account_id FROM accounts WHERE email = ?),
              (SELECT subtopic_id FROM subtopics WHERE name = ?),
              1 )`, 
          [email, subtopic_name]
        );

      return rows;
    }

}


export default new user_progress();