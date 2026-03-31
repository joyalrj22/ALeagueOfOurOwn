const db = require('./db');
const mockData = require('./mockData');

/**
 * Migration script to seed the SQLite database from mockData.js.
 */
function seedDatabase() {
  const insertLeague = db.prepare(`
    INSERT OR IGNORE INTO leagues (id, name, invite_code, admin_id, scoring_config)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMember = db.prepare(`
    INSERT OR IGNORE INTO members (user_id, league_id, role, name)
    VALUES (?, ?, ?, ?)
  `);

  const insertEntry = db.prepare(`
    INSERT OR IGNORE INTO entries (id, league_id, user_id, result, opponent_id, rank, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Transaction for batch insert
  const migration = db.transaction(() => {
    mockData.leagues.forEach(l => {
      insertLeague.run(l.id, l.name, l.inviteCode, l.adminId, JSON.stringify(l.scoringConfig));
    });

    mockData.members.forEach(m => {
      insertMember.run(m.userId, m.leagueId, m.role, m.name);
    });

    mockData.entries.forEach(e => {
      insertEntry.run(e.id, e.leagueId, e.userId, e.result || null, e.opponentId || null, e.rank || null, e.timestamp);
    });
  });

  migration();
  console.log("Migration from mockData.js to SQLite completed successfully.");
}

seedDatabase();
