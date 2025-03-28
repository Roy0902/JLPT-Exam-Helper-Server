import pool from '../config/database.js';

class question {
  async insertQuestion(account, question_title, question_description, connection = pool) {
    await connection.execute(
        'INSERT INTO questions (account_id, question_title, question_description) ' + 
        'VALUES (?, ?, ?);',
        [account.account_id, question_title, question_description]
    );
  }

  async getQuestion(limit, offset, connection = pool) {
    const [rows] = await connection.execute(
        'SELECT q.* , count(r.reply_id) as reply_number, acc.user_name FROM questions q ' + 
        'LEFT JOIN replies r on r.question_id = q.question_id '+ 
        'LEFT JOIN accounts acc on q.account_id = acc.account_id ' +
        'GROUP BY q.question_id, acc.user_name ' +
        'LIMIT ' + limit + ' OFFSET ' + offset
    );
    return rows
  }
}

export default new question();