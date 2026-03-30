const Database = require('better-sqlite3');
const path = require('path');

// Database relative to the repo root
const dbPath = path.join(__dirname, '../league.db');
const db = new Database(dbPath);

/**
 * Initialize the schema for the league application.
 */
function setupDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leagues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      invite_code TEXT UNIQUE NOT NULL,
      admin_id TEXT NOT NULL,
      scoring_config TEXT NOT NULL -- Store as JSON string
    );

    CREATE TABLE IF NOT EXISTS members (
      user_id TEXT NOT NULL,
      league_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      name TEXT,
      PRIMARY KEY (user_id, league_id),
      FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      league_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      result TEXT, -- 'win', 'loss', 'draw' for match-based
      opponent_id TEXT,
      rank INTEGER, -- for rank-based
      timestamp TEXT NOT NULL,
      FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id, league_id) REFERENCES members(user_id, league_id)
    );
  `);
}

// Ensure database is set up on initial load
setupDatabase();

module.exports = db;
