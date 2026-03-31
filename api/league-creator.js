const leagueCreatorService = require("../services/league-creator-service");

exports.handler = async (event, context) => {
  const { httpMethod, body } = event;

  if (httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const data = JSON.parse(body);
    const { name, scoringConfig } = data;

    if (!name || !scoringConfig) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: name and scoringConfig" }),
      };
    }

    // Mock Authentication: Assume user-1 is the creator
    const adminId = "user-1";
    const league = await leagueCreatorService.createLeague(name, scoringConfig, adminId);

    return {
      statusCode: 201,
      body: JSON.stringify(league),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
