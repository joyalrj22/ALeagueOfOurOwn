const leagueService = require("../services/league-service");
const leagueRepository = require("../repositories/league-repository");

exports.handler = async (event, context) => {
  const { path, httpMethod, body } = event;
  
  // Basic routing logic
  // URL format: /.netlify/functions/league-handler/league/:id/table
  // URL format: /.netlify/functions/league-handler/score
  
  try {
    if (path.includes("/table")) {
      // Extract league ID from path
      const parts = path.split("/");
      const tableIndex = parts.indexOf("table");
      const leagueId = parts[tableIndex - 1];
      
      const league = await leagueRepository.getLeagueById(leagueId);
      const table = await leagueService.calculateTable(leagueId);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ league, table }),
      };
    }

    if (path.includes("/score") && httpMethod === "POST") {
      const data = JSON.parse(body);
      const { leagueId, entry } = data;
      
      const newEntry = await leagueService.submitScore(leagueId, entry);
      
      return {
        statusCode: 201,
        body: JSON.stringify(newEntry),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Route not found" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
