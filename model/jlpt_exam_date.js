import pool from '../config/database.js';

class jlpt_exam_date {

  async getJLPTExamDate(connection = pool) {
    const [rows] = await connection.execute(
    `SELECT exam_date
     FROM jlpt_exam_date
     WHERE exam_date > CURDATE()
     ORDER BY exam_date ASC;`
    );

    return rows;
  }

}

export default new jlpt_exam_date();




