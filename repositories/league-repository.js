const db = require("./db");

const leagueRepository = {
  getLeagueById: (id) => {
    const row = db.prepare("SELECT * FROM leagues WHERE id = ?").get(id);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      inviteCode: row.invite_code,
      adminId: row.admin_id,
      scoringConfig: JSON.parse(row.scoring_config)
    };
  },

  getEntriesByLeagueId: (leagueId) => {
    return db.prepare("SELECT * FROM entries WHERE league_id = ?").all(leagueId).map(row => ({
      id: row.id,
      leagueId: row.league_id,
      userId: row.user_id,
      result: row.result,
      opponentId: row.opponent_id,
      rank: row.rank,
      timestamp: row.timestamp
    }));
  },

  getMembersByLeagueId: (leagueId) => {
    return db.prepare("SELECT * FROM members WHERE league_id = ?").all(leagueId).map(row => ({
      userId: row.user_id,
      leagueId: row.league_id,
      role: row.role,
      name: row.name
    }));
  },

  addEntry: (entry) => {
    const id = `e${Date.now()}`; // More reliable ID generation than array length
    const timestamp = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO entries (id, league_id, user_id, result, opponent_id, rank, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      entry.leagueId,
      entry.userId,
      entry.result || null,
      entry.opponentId || null,
      entry.rank || null,
      timestamp
    );

    return { id, ...entry, timestamp };
  },

  getUserById: (userId) => {
    const row = db.prepare("SELECT * FROM members WHERE user_id = ? LIMIT 1").get(userId);
    if (!row) return null;
    return {
      userId: row.user_id,
      leagueId: row.league_id,
      role: row.role,
      name: row.name
    };
  },

  createLeague: (leagueData) => {
    const id = `league-${Date.now()}`;
    db.prepare(`
      INSERT INTO leagues (id, name, invite_code, admin_id, scoring_config)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      id,
      leagueData.name,
      leagueData.inviteCode,
      leagueData.adminId,
      JSON.stringify(leagueData.scoringConfig)
    );

    return { id, ...leagueData };
  },

  addMember: (memberData) => {
    db.prepare(`
      INSERT INTO members (user_id, league_id, role, name)
      VALUES (?, ?, ?, ?)
    `).run(
      memberData.userId,
      memberData.leagueId,
      memberData.role,
      memberData.name
    );

    return memberData;
  },
};

module.exports = leagueRepository;
