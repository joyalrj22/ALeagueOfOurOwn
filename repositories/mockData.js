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
    {
      id: "league-3",
      name: "Twilight Struggle",
      inviteCode: "COLDWAR",
      adminId: "user-lewis",
      scoringConfig: {
        type: "match",
        allowDraws: false,
        factions: ["USSR", "USA"],
        pointsPerWin: 3,
        pointsPerLoss: 0,
      },
    },
  ],
  members: [
    // League 1 members (Global FIFA Tournament)
    { userId: "user-1", leagueId: "league-1", role: "admin", name: "Alice" },
    { userId: "user-2", leagueId: "league-1", role: "member", name: "Bob" },
    { userId: "user-3", leagueId: "league-1", role: "member", name: "Charlie" },
    { userId: "user-4", leagueId: "league-1", role: "member", name: "Diana" },
    { userId: "user-5", leagueId: "league-1", role: "member", name: "Ethan" },
    { userId: "user-6", leagueId: "league-1", role: "member", name: "Fiona" },

    // League 2 members (Office Chess League)
    { userId: "user-2", leagueId: "league-2", role: "admin", name: "Bob" },
    { userId: "user-4", leagueId: "league-2", role: "member", name: "Diana" },
    { userId: "user-1", leagueId: "league-2", role: "member", name: "Alice" },
    { userId: "user-7", leagueId: "league-2", role: "member", name: "George" },
    { userId: "user-8", leagueId: "league-2", role: "member", name: "Hannah" },

    // League 3 members (Twilight Struggle)
    { userId: "user-lewis", leagueId: "league-3", role: "admin", name: "Lewis" },
    { userId: "user-james", leagueId: "league-3", role: "member", name: "James" },
  ],
  entries: [
    // Initial entries for League 1 (Match based - two entries per match)
    // Match 1: Alice beat Bob
    { id: "e1", leagueId: "league-1", userId: "user-1", result: "win", opponentId: "user-2", timestamp: "2026-03-20T10:00:00.000Z" },
    { id: "e2", leagueId: "league-1", userId: "user-2", result: "loss", opponentId: "user-1", timestamp: "2026-03-20T10:00:00.000Z" },
    // Match 2: Alice drew with Charlie
    { id: "e3", leagueId: "league-1", userId: "user-1", result: "draw", opponentId: "user-3", timestamp: "2026-03-21T14:30:00.000Z" },
    { id: "e4", leagueId: "league-1", userId: "user-3", result: "draw", opponentId: "user-1", timestamp: "2026-03-21T14:30:00.000Z" },
    // Match 3: Diana beat Ethan
    { id: "e5", leagueId: "league-1", userId: "user-4", result: "win", opponentId: "user-5", timestamp: "2026-03-22T16:00:00.000Z" },
    { id: "e6", leagueId: "league-1", userId: "user-5", result: "loss", opponentId: "user-4", timestamp: "2026-03-22T16:00:00.000Z" },
    // Match 4: Alice beat Diana
    { id: "e7", leagueId: "league-1", userId: "user-1", result: "win", opponentId: "user-4", timestamp: "2026-03-23T11:15:00.000Z" },
    { id: "e8", leagueId: "league-1", userId: "user-4", result: "loss", opponentId: "user-1", timestamp: "2026-03-23T11:15:00.000Z" },
    // Match 5: Charlie beat Fiona
    { id: "e9", leagueId: "league-1", userId: "user-3", result: "win", opponentId: "user-6", timestamp: "2026-03-24T17:45:00.000Z" },
    { id: "e10", leagueId: "league-1", userId: "user-6", result: "loss", opponentId: "user-3", timestamp: "2026-03-24T17:45:00.000Z" },
    // Match 6: Bob beat Ethan
    { id: "e11", leagueId: "league-1", userId: "user-2", result: "win", opponentId: "user-5", timestamp: "2026-03-25T13:00:00.000Z" },
    { id: "e12", leagueId: "league-1", userId: "user-5", result: "loss", opponentId: "user-2", timestamp: "2026-03-25T13:00:00.000Z" },
    // Match 7: Diana drew with Fiona
    { id: "e13", leagueId: "league-1", userId: "user-4", result: "draw", opponentId: "user-6", timestamp: "2026-03-26T09:30:00.000Z" },
    { id: "e14", leagueId: "league-1", userId: "user-6", result: "draw", opponentId: "user-4", timestamp: "2026-03-26T09:30:00.000Z" },

    // Initial entries for League 2 (Rank based)
    // Round 1
    { id: "e15", leagueId: "league-2", userId: "user-2", rank: 1, timestamp: "2026-03-20T18:00:00.000Z" },
    { id: "e16", leagueId: "league-2", userId: "user-4", rank: 2, timestamp: "2026-03-20T18:00:00.000Z" },
    { id: "e17", leagueId: "league-2", userId: "user-1", rank: 3, timestamp: "2026-03-20T18:00:00.000Z" },
    { id: "e18", leagueId: "league-2", userId: "user-7", rank: 4, timestamp: "2026-03-20T18:00:00.000Z" },
    { id: "e19", leagueId: "league-2", userId: "user-8", rank: 5, timestamp: "2026-03-20T18:00:00.000Z" },
    // Round 2
    { id: "e20", leagueId: "league-2", userId: "user-1", rank: 1, timestamp: "2026-03-24T18:00:00.000Z" },
    { id: "e21", leagueId: "league-2", userId: "user-2", rank: 2, timestamp: "2026-03-24T18:00:00.000Z" },
    { id: "e22", leagueId: "league-2", userId: "user-7", rank: 3, timestamp: "2026-03-24T18:00:00.000Z" },
    { id: "e23", leagueId: "league-2", userId: "user-4", rank: 4, timestamp: "2026-03-24T18:00:00.000Z" },
    { id: "e24", leagueId: "league-2", userId: "user-8", rank: 5, timestamp: "2026-03-24T18:00:00.000Z" },

    // Initial entries for League 3 (Twilight Struggle - Match based, USSR vs USA)
    // Match 1: Lewis (USSR) beat James (USA) on Sun 27 Sep 2026
    { id: "e25", leagueId: "league-3", userId: "user-lewis", result: "win", faction: "USSR", opponentId: "user-james", timestamp: "2026-09-27T14:00:00.000Z" },
    { id: "e26", leagueId: "league-3", userId: "user-james", result: "loss", faction: "USA", opponentId: "user-lewis", timestamp: "2026-09-27T14:00:00.000Z" },
    // Match 2: James (USSR) beat Lewis (USA) on Sun 27 Sep 2026
    { id: "e27", leagueId: "league-3", userId: "user-james", result: "win", faction: "USSR", opponentId: "user-lewis", timestamp: "2026-09-27T18:00:00.000Z" },
    { id: "e28", leagueId: "league-3", userId: "user-lewis", result: "loss", faction: "USA", opponentId: "user-james", timestamp: "2026-09-27T18:00:00.000Z" },
    // Match 3: Lewis (USSR) beat James (USA) on 15 Nov 2026
    { id: "e29", leagueId: "league-3", userId: "user-lewis", result: "win", faction: "USSR", opponentId: "user-james", timestamp: "2026-11-15T19:00:00.000Z" },
    { id: "e30", leagueId: "league-3", userId: "user-james", result: "loss", faction: "USA", opponentId: "user-lewis", timestamp: "2026-11-15T19:00:00.000Z" },
  ],
};

module.exports = mockData;
