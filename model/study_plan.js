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

}

export default new study_plan();