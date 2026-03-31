const mysql = require('mysql2/promise');

let pool;

/**
 * Initialize the connection pool specifically for TiDB Cloud / MySQL.
 * SSL is enabled by default to satisfy TiDB Cloud requirements.
 */
function initPool() {
  if (!process.env.DATABASE_URL) {
    console.warn("Database: DATABASE_URL is not defined. Connection will fail.");
    return;
  }

  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true, // TiDB Cloud requires this for security
    },
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // Max idle connections, the pool will resize
    idleTimeout: 60000, // Idle connections timeout in milliseconds
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

  console.log("Database: Initialized TiDB Cloud/MySQL connection pool with SSL.");
}

/**
 * Universal query runner for MySQL/TiDB.
 */
async function query(sql, params = []) {
  if (!pool) initPool();

  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error("Database Query Error:", err.message);
    throw err;
  }
}

/**
 * Get a single row from the database.
 */
async function get(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Ensure the base schema exists.
 * Note: In production, it's better to use migrations, but for MVP we auto-init.
 */
async function setupDatabase() {
  const schema = [
    `CREATE TABLE IF NOT EXISTS leagues (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      invite_code VARCHAR(10) UNIQUE NOT NULL,
      admin_id VARCHAR(255) NOT NULL,
      scoring_config TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS members (
      user_id VARCHAR(255) NOT NULL,
      league_id VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'member',
      name VARCHAR(255),
      PRIMARY KEY (user_id, league_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS entries (
      id VARCHAR(255) PRIMARY KEY,
      league_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      result VARCHAR(50),
      opponent_id VARCHAR(255),
      rank_val INT,
      timestamp VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];

  if (!pool) initPool();
  if (!pool) return; // Skip if no connection string

  for (const sql of schema) {
    await query(sql);
  }
}

// Auto-run schema setup if we have a connection
if (process.env.DATABASE_URL) {
  setupDatabase().catch(err => console.error("Database Initialization failed:", err));
}

module.exports = {
  query,
  get,
  dbType: 'mysql'
};
