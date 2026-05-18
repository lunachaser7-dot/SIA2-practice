// backend/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '', // your MySQL password (leave empty if none)
  database: 'church_finance_db',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;