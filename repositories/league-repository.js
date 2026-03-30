const db = require("./db");

const leagueRepository = {
  getLeagueById: async (id) => {
    const row = await db.get("SELECT * FROM leagues WHERE id = ?", [id]);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      inviteCode: row.invite_code,
      adminId: row.admin_id,
      scoringConfig: JSON.parse(row.scoring_config)
    };
  },

  getEntriesByLeagueId: async (leagueId) => {
    const rows = await db.query("SELECT * FROM entries WHERE league_id = ?", [leagueId]);
    return rows.map(row => ({
      id: row.id,
      leagueId: row.league_id,
      userId: row.user_id,
      result: row.result,
      opponentId: row.opponent_id,
      rank: row.rank_val, // Use the universal rank_val
      timestamp: row.timestamp
    }));
  },

  getMembersByLeagueId: async (leagueId) => {
    const rows = await db.query("SELECT * FROM members WHERE league_id = ?", [leagueId]);
    return rows.map(row => ({
      userId: row.user_id,
      leagueId: row.league_id,
      role: row.role,
      name: row.name
    }));
  },

  addEntry: async (entry) => {
    const id = `e${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    await db.query(`
      INSERT INTO entries (id, league_id, user_id, result, opponent_id, rank_val, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      entry.leagueId,
      entry.userId,
      entry.result || null,
      entry.opponentId || null,
      entry.rank || null,
      timestamp
    ]);

    return { id, ...entry, timestamp };
  },

  getUserById: async (userId) => {
    const row = await db.get("SELECT * FROM members WHERE user_id = ? LIMIT 1", [userId]);
    if (!row) return null;
    return {
      userId: row.user_id,
      leagueId: row.league_id,
      role: row.role,
      name: row.name
    };
  },

  createLeague: async (leagueData) => {
    const id = `league-${Date.now()}`;
    await db.query(`
      INSERT INTO leagues (id, name, invite_code, admin_id, scoring_config)
      VALUES (?, ?, ?, ?, ?)
    `, [
      id,
      leagueData.name,
      leagueData.inviteCode,
      leagueData.adminId,
      JSON.stringify(leagueData.scoringConfig)
    ]);

    return { id, ...leagueData };
  },

  addMember: async (memberData) => {
    await db.query(`
      INSERT INTO members (user_id, league_id, role, name)
      VALUES (?, ?, ?, ?)
    `, [
      memberData.userId,
      memberData.leagueId,
      memberData.role,
      memberData.name
    ]);

    return memberData;
  },
};

module.exports = leagueRepository;
