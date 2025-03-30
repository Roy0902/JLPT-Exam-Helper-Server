import pool from '../config/database.js';

class study_plan {

  async getStudyPlan(email, connection = pool) {
    const [rows] = await connection.execute(
      `SELECT SUM(CASE WHEN dsp.is_completed = TRUE THEN 1 ELSE 0 END) AS completed_study_plan,
       COUNT(dsp.daily_plan_id) AS total_study_plan FROM daily_study_plans dsp
       JOIN accounts a ON dsp.account_id = a.account_id
       WHERE a.email = ? ;`, 
      [email]
    );

    return rows[0];
  }

  async insertStudyPlan(account_id, cbf_result, connection = pool) {

    for (let dayIndex = 0; dayIndex < cbf_result.length; dayIndex++) {
        const dayItems = cbf_result[dayIndex]; 
        const planOrder = dayIndex + 1; 

      
      const [planResult] = await connection.execute(
          'INSERT INTO daily_study_plans (account_id, plan_order) VALUES (?, ?)',
          [account_id, planOrder]
      );

      const dailyPlanId = planResult.insertId;

      // Insert each item into daily_study_plan_items
      for (const itemId of dayItems) {
          await connection.execute(
              'INSERT INTO daily_study_plan_items (daily_plan_id, item_id) VALUES (?, ?)',
              [dailyPlanId, itemId]
          );
      }
    }
  }
}

export default new study_plan();