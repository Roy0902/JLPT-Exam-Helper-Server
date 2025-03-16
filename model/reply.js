import pool from '../config/database.js';

class reply {
  async insertReply(account, reply_text, question_id, connection = pool) {
    await connection.execute(
        'INSERT INTO replies (account_id, reply, question_id) ' + 
        'VALUES (?, ?, ?);',
        [account.account_id, reply_text, question_id]
    );
  }

  async getReply(limit, offset, question_id, connection = pool) {
    const [rows] = await connection.execute(
        'SELECT r.* , acc.user_name FROM replies r ' + 
        'LEFT JOIN questions q on r.question_id = q.question_id '+ 
        'LEFT JOIN accounts acc on r.account_id = acc.account_id ' +
        'WHERE q.question_id = ' + question_id + " " + 
        'GROUP BY r.reply_id, acc.user_name ' +
        'LIMIT ' + limit + ' OFFSET ' + offset
    );
    console.log('success')
    return rows
  }
}

export default new reply();