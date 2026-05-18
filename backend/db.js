const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
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
