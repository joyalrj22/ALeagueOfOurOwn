// Singleton for the session to mimic a database
const mockData = {
  leagues: [
    {
      id: "league-1",
      name: "Global FIFA Tournament",
      inviteCode: "FIFA2026",
      adminId: "user-1",
      scoringConfig: {
        type: "match", // Win/Loss points
        pointsPerWin: 3,
        pointsPerDraw: 1,
        pointsPerLoss: 0,
      },
    },
    {
      id: "league-2",
      name: "Office Chess League",
      inviteCode: "CHESS101",
      adminId: "user-2",
      scoringConfig: {
        type: "rank", // Points based on ranking in an event
        rankPoints: {
          1: 10,
          2: 6,
          3: 4,
          4: 2,
          5: 1,
        },
      },
    },
  ],
  members: [
    { userId: "user-1", leagueId: "league-1", role: "admin", name: "Alice" },
    { userId: "user-2", leagueId: "league-1", role: "member", name: "Bob" },
    { userId: "user-3", leagueId: "league-1", role: "member", name: "Charlie" },
    { userId: "user-2", leagueId: "league-2", role: "admin", name: "Bob" },
    { userId: "user-4", leagueId: "league-2", role: "member", name: "David" },
  ],
  entries: [
    // Initial entries for League 1 (Match based)
    { id: "e1", leagueId: "league-1", userId: "user-1", result: "win", opponentId: "user-2", timestamp: new Date().toISOString() },
    { id: "e2", leagueId: "league-1", userId: "user-2", result: "loss", opponentId: "user-1", timestamp: new Date().toISOString() },
    { id: "e3", leagueId: "league-1", userId: "user-1", result: "draw", opponentId: "user-3", timestamp: new Date().toISOString() },
    { id: "e4", leagueId: "league-1", userId: "user-3", result: "draw", opponentId: "user-1", timestamp: new Date().toISOString() },
    
    // Initial entries for League 2 (Rank based)
    { id: "e5", leagueId: "league-2", userId: "user-2", rank: 1, timestamp: new Date().toISOString() },
    { id: "e6", leagueId: "league-2", userId: "user-4", rank: 2, timestamp: new Date().toISOString() },
  ],
};

module.exports = mockData;
