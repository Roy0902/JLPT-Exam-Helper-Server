import {Connector} from '@google-cloud/cloud-sql-connector';
import {Pool} from 'mysql2';
import 'dotenv/config';

const connector = new Connector();

const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME, 
    authType: 'IAM', 
});

const pool = new Pool({
            ...clientOpts,
            user: process.env.DB_USER, 
            password: process.env.DB_PASSWORD, 
            database: process.env.DB_NAME, 
});

pool.query('SELECT NOW() AS now', (err, result) => {
  if (err) {
      console.error('Error connecting to the database:', err);
  } else {
      console.log('Connected to the database:', result.rows[0]);
  }
});

process.on('SIGINT', () => {
  pool.end();
  connector.close();
});

export default pool;