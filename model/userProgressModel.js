class userProgressModel {
    async getUserProgressByEmail(email,  connection = pool) {
        const [rows] = await connection.execute(
            'Select count(*) from  where token = ? and is_revoked = 0',
            [session_tokens]
          );
    }
  
    async getEmailByToken(session_tokens, connection = pool) {
      const [rows] = await connection.execute(
        'Select email from session_tokens where token = ? and is_revoked = 0',
        [session_tokens]
      );
  
      return rows[0];
    }
  }