const path = require('path');

let db;
let dbType = 'sqlite';

/**
 * Initialize the database connection based on environment.
 */
function initDB() {
  if (process.env.DATABASE_URL) {
    // Remote MySQL Connection
    const mysql = require('mysql2/promise');
    dbType = 'mysql';
    // The db object will be a pool for better performance in serverless
    db = mysql.createPool(process.env.DATABASE_URL);
    console.log("Database: Initialized Remote MySQL connection pool.");
  } else if (process.env.NETLIFY || process.env.NODE_ENV === 'production') {
    // Staging fallback to In-Memory SQLite to avoid read-only errors
    const Database = require('better-sqlite3');
    dbType = 'sqlite-memory';
    db = new Database(':memory:');
    console.log("Database: Falling back to In-Memory SQLite for Serverless environment.");
  } else {
    // Local SQLite File
    const Database = require('better-sqlite3');
    const dbPath = path.join(__dirname, '../league.db');
    dbType = 'sqlite';
    db = new Database(dbPath);
    console.log(`Database: Connected to local SQLite file at ${dbPath}`);
  }
}

/**
 * Universal query runner to handle differences between better-sqlite3 and mysql2.
 */
async function query(sql, params = []) {
  if (!db) initDB();

  if (dbType === 'mysql') {
    const [rows] = await db.execute(sql, params);
    return rows;
  } else {
    // SQLite (File or Memory)
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(params);
    } else {
      return stmt.run(params);
    }
  }
}

/**
 * Get a single row.
 */
async function get(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Initialize the schema (Universal syntax for SQLite and MySQL).
 */
async function setupDatabase() {
  const schema = [
    `CREATE TABLE IF NOT EXISTS leagues (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      invite_code VARCHAR(255) UNIQUE NOT NULL,
      admin_id VARCHAR(255) NOT NULL,
      scoring_config TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS members (
      user_id VARCHAR(255) NOT NULL,
      league_id VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'member',
      name VARCHAR(255),
      PRIMARY KEY (user_id, league_id)
    )`,
    `CREATE TABLE IF NOT EXISTS entries (
      id VARCHAR(255) PRIMARY KEY,
      league_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      result VARCHAR(50),
      opponent_id VARCHAR(255),
      rank_val INT, -- renamed from 'rank' to avoid reserved keyword issues in some dialects
      timestamp VARCHAR(100) NOT NULL
    )`
  ];

  for (const sql of schema) {
    await query(sql);
  }
}

// Initial setup
setupDatabase().catch(err => console.error("Database Setup Error:", err));

module.exports = {
  query,
  get,
  dbType // Export type for dialect-specific logic if needed
};
