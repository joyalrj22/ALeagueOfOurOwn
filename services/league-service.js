const leagueRepository = require("../repositories/league-repository");

const leagueService = {
  calculateTable: async (leagueId) => {
    const league = await leagueRepository.getLeagueById(leagueId);
    if (!league) throw new Error("League not found");

    const entries = await leagueRepository.getEntriesByLeagueId(leagueId);
    const members = await leagueRepository.getMembersByLeagueId(leagueId);
    const { scoringConfig } = league;

    const userStats = {};

    // Initialize stats for all members
    members.forEach((member) => {
      userStats[member.userId] = {
        userId: member.userId,
        userName: member.name,
        points: 0,
        played: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        rankPoints: 0,
      };
    });

    // Calculate based on league type
    if (scoringConfig.type === "match") {
      entries.forEach((entry) => {
        const stats = userStats[entry.userId];
        if (!stats) return;

        stats.played += 1;
        if (entry.result === "win") {
          stats.wins += 1;
          stats.points += (scoringConfig.pointsPerWin || 3);
        } else if (entry.result === "loss") {
          stats.losses += 1;
          stats.points += (scoringConfig.pointsPerLoss || 0);
        } else if (entry.result === "draw") {
          stats.draws += 1;
          stats.points += (scoringConfig.pointsPerDraw || 1);
        }
      });
    } else if (scoringConfig.type === "rank") {
      entries.forEach((entry) => {
        const stats = userStats[entry.userId];
        if (!stats) return;

        stats.played += 1;
        const reward = scoringConfig.rankPoints[entry.rank] || 0;
        stats.points += reward;
      });
    }

    // Convert to array and sort
    const table = Object.values(userStats).sort((a, b) => b.points - a.points);
    
    // Add ranking
    table.forEach((row, index) => {
      row.rank = index + 1;
    });

    return table;
  },

  submitScore: async (leagueId, entryData) => {
    const league = await leagueRepository.getLeagueById(leagueId);
    if (!league) throw new Error("League not found");

    // For match type, we usually want to record both sides.
    // However, for simplicity in this MVP, we'll just record what the admin sends.
    const entry = await leagueRepository.addEntry({
      leagueId,
      ...entryData,
    });

    return entry;
  },
};

module.exports = leagueService;
