const mysql = require('mysql2');

const rawPassword = process.env.DB_PASSWORD || process.env.DB_PASS || '';
const password = [
  'your_database_password',
  'your_mysql_root_password',
  'your_secure_secret_key_here',
  'your_mysql_password',
  'defaultpassword'
].includes(rawPassword) ? '' : rawPassword;

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password,
  database: process.env.DB_NAME || 'church_finance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

function convertPlaceholders(sql) {
  // Convert $1, $2... to ? for mysql2
  return sql.replace(/\$\d+/g, '?');
}

async function query(sql, params = []) {
  const sql2 = convertPlaceholders(sql);
  const [rows] = await promisePool.query(sql2, params);
  return { rows };
}

module.exports = {
  query,
  pool,
  promisePool
};
