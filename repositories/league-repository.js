const mockData = require("./mockData");

const leagueRepository = {
  getLeagueById: (id) => mockData.leagues.find((l) => l.id === id),
  getEntriesByLeagueId: (leagueId) => mockData.entries.filter((e) => e.leagueId === leagueId),
  getMembersByLeagueId: (leagueId) => mockData.members.filter((m) => m.leagueId === leagueId),
  addEntry: (entry) => {
    const newEntry = {
      id: `e${mockData.entries.length + 1}`,
      ...entry,
      timestamp: new Date().toISOString(),
    };
    mockData.entries.push(newEntry);
    return newEntry;
  },
  getUserById: (userId) => mockData.members.find((m) => m.userId === userId),
};

module.exports = leagueRepository;
