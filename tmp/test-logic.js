const leagueService = require("../services/league-service");
const mockData = require("../repositories/mockData");

try {
  console.log("Testing League 1 (Match based):");
  const table1 = leagueService.calculateTable("league-1");
  console.table(table1);

  console.log("\nTesting League 2 (Rank based):");
  const table2 = leagueService.calculateTable("league-2");
  console.table(table2);

  console.log("\nSubmitting new score for League 1...");
  leagueService.submitScore("league-1", { userId: "user-2", result: "win", opponentId: "user-1" });
  
  const updatedTable1 = leagueService.calculateTable("league-1");
  console.log("Updated Table 1:");
  console.table(updatedTable1);

} catch (err) {
  console.error(err);
}
