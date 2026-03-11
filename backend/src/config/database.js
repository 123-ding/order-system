const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'maritime_logistics',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('Database connection established successfully');
    conn.release();
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
}

testConnection();

module.exports = pool;
