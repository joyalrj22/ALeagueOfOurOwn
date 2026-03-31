const leagueRepository = require("../repositories/league-repository");

const leagueCreatorService = {
  /**
   * Create a new league and set up the admin.
   * @param {string} name - Name of the league
   * @param {object} scoringConfig - Scoring structure (match or rank)
   * @param {string} adminId - ID of the creator
   * @returns {object} The created league
   */
  createLeague: async (name, scoringConfig, adminId) => {
    if (!name || !scoringConfig) {
      throw new Error("Missing league name or scoring configuration.");
    }

    // Simple Alphanumeric Invite Code Generator (Example: FIFA-12)
    const generateInviteCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const inviteCode = generateInviteCode();

    const league = await leagueRepository.createLeague({
      name,
      inviteCode,
      adminId,
      scoringConfig,
    });

    // Add creator as the first member and ADMIN
    await leagueRepository.addMember({
      userId: adminId,
      leagueId: league.id,
      role: "admin",
      name: "Admin User", // Placeholder until we have actual profile context
    });

    return league;
  },
};

module.exports = leagueCreatorService;
