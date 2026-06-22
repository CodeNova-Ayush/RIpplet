// ============================================================================
// MySQL Connection Pool Configuration
// ============================================================================
// Uses mysql2 with promise wrapper for async/await support.
// All queries use parameterized placeholders (?) to prevent SQL injection.
// ============================================================================
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'grocery_user',
  password: process.env.DB_PASSWORD || 'grocery_pass',
  database: process.env.DB_NAME || 'grocery_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Return dates as strings rather than JS Date objects
  dateStrings: true,
});

module.exports = pool;
