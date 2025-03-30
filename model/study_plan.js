import pool from '../config/database.js';

class study_plan {

  async getStudyPlanSummary(email, connection = pool) {
    const [rows] = await connection.execute(
      `SELECT SUM(CASE WHEN spi.is_completed = TRUE THEN 1 ELSE 0 END) AS completed_study_plan,
       COUNT(spi.study_plan_item_id) AS total_study_plan, sp.fitness_score FROM study_plan_items spi
       JOIN study_plan sp on sp.study_plan_id = spi.study_plan_id
       JOIN accounts a ON sp.account_id = a.account_id
       WHERE a.email = ? 
       GROUP BY sp.study_plan_id`, 
      [email]
    );

    return rows[0];
  }

  async getStudyPlan(email, connection = pool) {
    const [rows] = await connection.execute(
      `SELECT spi.* FROM study_plan_items spi
       JOIN study_plan sp on spi.study_plan_id = sp.study_plan_id
       JOIN accounts a ON sp.account_id = a.account_id
       WHERE a.email = ? `, 
      [email]
    );

    return rows;
  }

  async deleteExistStudyPlan(account_id, connection = pool) {
    await connection.execute(
      `DELETE sp FROM study_plan sp
       JOIN accounts a ON sp.account_id = a.account_id
       WHERE a.account_id = ? ;` ,
      [account_id]
    );

  }

  async insertStudyPlan(account_id, fitness_score, cbf_result, connection = pool) {

    const [rows] = await connection.execute(
      'INSERT INTO study_plan (account_id, fitness_score) VALUES (?, ?)',
      [account_id, fitness_score]
    );

    for (let dayIndex = 0; dayIndex < cbf_result.length; dayIndex++) {
        const dayItems = cbf_result[dayIndex]; 

        let item_id_string = "";
        for (const itemId of dayItems) {
            item_id_string += itemId +','
        }

        await connection.execute(
          'INSERT INTO study_plan_items (study_plan_id, item_id_string) VALUES (?, ?)',
          [rows.insertId, item_id_string]
      );
    }
  }
}

export default new study_plan();