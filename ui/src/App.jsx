import React, { useEffect, useState } from "react";
import { Layout, LayoutDashboard, Settings, Trophy, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import Leaderboard from './components/Leaderboard';
import AdminScoreEntry from './components/AdminScoreEntry';
import mockData from '../../repositories/mockData';

const buildTableFromMock = (leagueId) => {
  const league = mockData.leagues.find((l) => l.id === leagueId);
  if (!league) return null;

  const entries = mockData.entries.filter((e) => e.leagueId === leagueId);
  const leagueMembers = mockData.members.filter((m) => m.leagueId === leagueId);
  const { scoringConfig } = league;

  const userStats = {};
  leagueMembers.forEach((member) => {
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

  if (scoringConfig.type === 'match') {
    entries.forEach((entry) => {
      const stats = userStats[entry.userId];
      if (!stats) return;
      stats.played += 1;
      if (entry.result === 'win') {
        stats.wins += 1;
        stats.points += scoringConfig.pointsPerWin ?? 3;
      } else if (entry.result === 'loss') {
        stats.losses += 1;
        stats.points += scoringConfig.pointsPerLoss ?? 0;
      } else if (entry.result === 'draw') {
        stats.draws += 1;
        stats.points += scoringConfig.pointsPerDraw ?? 1;
      }
    });
  } else if (scoringConfig.type === 'rank') {
    entries.forEach((entry) => {
      const stats = userStats[entry.userId];
      if (!stats) return;
      stats.played += 1;
      const reward = scoringConfig.rankPoints[entry.rank] || 0;
      stats.points += reward;
    });
  }

  const table = Object.values(userStats).sort((a, b) => b.points - a.points);
  table.forEach((row, index) => {
    row.rank = index + 1;
  });

  return { league, table, entries };
};

const buildMatchHistory = (entries = [], members = []) => {
  const memberName = (id) => members.find((m) => m.userId === id)?.name || id;
  const matches = [];
  for (let i = 0; i < entries.length; i += 2) {
    const a = entries[i];
    const b = entries[i + 1];
    if (!a) continue;
    if (b && a.opponentId === b.userId) {
      matches.push({
        id: a.id,
        timestamp: a.timestamp,
        p1: { name: memberName(a.userId), result: a.result, faction: a.faction },
        p2: { name: memberName(b.userId), result: b.result, faction: b.faction },
      });
    } else {
      matches.push({
        id: a.id,
        timestamp: a.timestamp,
        p1: { name: memberName(a.userId), result: a.result, faction: a.faction },
        p2: a.opponentId ? { name: memberName(a.opponentId), result: a.result === 'win' ? 'loss' : a.result === 'loss' ? 'win' : 'draw' } : null,
      });
      if (b) i -= 1;
    }
  }
  return matches.reverse();
};

const App = () => {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'league'
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const [leagueData, setLeagueData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Derive dashboard leagues from hardcoded mockData
  const myLeagues = mockData.leagues.map((l) => ({
    id: l.id,
    name: l.name,
    type: l.scoringConfig.type,
    members: mockData.members.filter((m) => m.leagueId === l.id),
  }));

  const fetchLeagueTable = async (leagueId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/.netlify/functions/league-handler/league/${leagueId}/table`);
      if (!res.ok) throw new Error("Failed to fetch league data");
      const data = await res.json();
      setLeagueData(data);
      setMembers(data.table.map(row => ({ userId: row.userId, name: row.userName })));
    } catch (err) {
      // Fall back to hardcoded mock database if backend/DB is unavailable
      const fallbackData = buildTableFromMock(leagueId);
      if (fallbackData) {
        setLeagueData(fallbackData);
        setMembers(fallbackData.table.map(row => ({ userId: row.userId, name: row.userName })));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueSelect = (leagueId) => {
    setSelectedLeagueId(leagueId);
    setView('league');
    fetchLeagueTable(leagueId);
  };

  const handleScoreSubmit = async (entryOrEntries) => {
    const entries = Array.isArray(entryOrEntries) ? entryOrEntries : [entryOrEntries];
    try {
      for (const entry of entries) {
        const res = await fetch(`/.netlify/functions/league-handler/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leagueId: selectedLeagueId, entry })
        });
        
        if (!res.ok) throw new Error("Failed to submit score");
      }
      
      // Refresh the table (Optimistic UI would be better, but refresh is simpler for initial MVP)
      fetchLeagueTable(selectedLeagueId);
    } catch (err) {
      // Fall back to updating hardcoded in-memory mockData so UI testing still works without a DB server
      entries.forEach((entry) => {
        mockData.entries.push({
          id: `e${mockData.entries.length + 1}`,
          leagueId: selectedLeagueId,
          timestamp: entry.timestamp || new Date().toISOString(),
          ...entry,
        });
      });
      const fallbackData = buildTableFromMock(selectedLeagueId);
      if (fallbackData) {
        setLeagueData(fallbackData);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Sidebar / Nav */}
      <nav className="fixed top-0 left-0 h-full w-20 flex flex-col items-center py-8 bg-slate-900/50 border-r border-slate-800/50 backdrop-blur-md z-50">
        <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] mb-12">
          <Sparkles className="text-white" size={24} />
        </div>
        
        <div className="flex flex-col gap-8">
          <button 
            onClick={() => setView('dashboard')}
            className={`p-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <LayoutDashboard size={24} />
          </button>
          <button className="p-3 rounded-xl text-slate-500 hover:text-slate-200 transition-all">
            <Trophy size={24} />
          </button>
          <button className="p-3 rounded-xl text-slate-500 hover:text-slate-200 transition-all">
            <Settings size={24} />
          </button>
        </div>

        <div className="mt-auto">
          <button className="p-3 rounded-xl text-slate-500 hover:text-red-400 transition-all">
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12">
          {view === 'dashboard' ? (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <header className="mb-12">
                <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
                  A League Of Our Own
                </h1>
                <p className="text-slate-500 font-medium">Generic League Management Engine powered by Netlify Functions.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myLeagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => handleLeagueSelect(league.id)}
                    className="group relative p-6 bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 rounded-2xl text-left transition-all hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg ${league.type === 'match' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {league.type === 'match' ? <Trophy size={20} /> : <Layout size={20} />}
                      </div>
                      <ChevronRight className="text-slate-700 group-hover:text-blue-500 transition-colors" size={20} />
                    </div>
                    <h3 className="text-xl font-bold mb-1 text-slate-100 group-hover:text-blue-400 transition-colors">{league.name}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{league.type} scoring enabled</p>
                    
                    <div className="mt-6 flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {league.members.slice(0, 3).map((m) => (
                                <div key={m.userId} title={m.name} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                  {m.name.slice(0, 2).toUpperCase()}
                                </div>
                            ))}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{league.members.length} members</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button 
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors mb-8 font-bold text-sm tracking-wide uppercase"
              >
                <ChevronRight className="rotate-180" size={16} />
                Back to Dashboard
              </button>

              <header className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black tracking-widest uppercase border border-blue-500/20 rounded-full">ACTIVE LEAGUE</span>
                    {loading && <span className="text-xs text-blue-400 animate-pulse">Syncing data...</span>}
                </div>
                <h1 className="text-4xl font-black tracking-tighter mb-2 text-white">
                  {leagueData?.league?.name || "Loading League..."}
                </h1>
                <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                    <div className="flex items-center gap-1.5"><Trophy size={14} /> {leagueData?.league?.scoringConfig?.type} Engine</div>
                    <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                    <div>Invite Code: <span className="text-slate-300 font-mono">{leagueData?.league?.inviteCode}</span></div>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {leagueData && <Leaderboard league={leagueData.league} table={leagueData.table} />}

                  {leagueData?.league?.scoringConfig?.type === 'match' && leagueData?.entries?.length > 0 && (
                    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
                      <div className="p-4 border-b border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-200">Match History</h3>
                        {leagueData?.league?.scoringConfig?.factions && (
                          <div className="flex items-center gap-3 text-xs font-bold">
                            {leagueData.league.scoringConfig.factions.map((faction) => {
                              const wins = leagueData.entries.filter(
                                (e) => e.faction === faction && e.result === 'win'
                              ).length;
                              return (
                                <span
                                  key={faction}
                                  className={`px-2.5 py-1 rounded-full border ${
                                    faction === 'USSR'
                                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                                      : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                  }`}
                                >
                                  {faction}: {wins} {wins === 1 ? 'win' : 'wins'}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="divide-y divide-slate-800/50">
                        {buildMatchHistory(leagueData.entries, members).map((match) => (
                          <div key={match.id} className="px-5 py-3.5 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={match.p1.result === 'win' ? 'font-bold text-green-400' : 'text-slate-300'}>
                                {match.p1.name}
                              </span>
                              {match.p1.faction && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  match.p1.faction === 'USSR' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                                }`}>
                                  {match.p1.faction}
                                </span>
                              )}
                              <span className="text-slate-600 text-xs uppercase font-bold">vs</span>
                              <span className={match.p2?.result === 'win' ? 'font-bold text-green-400' : 'text-slate-300'}>
                                {match.p2?.name}
                              </span>
                              {match.p2?.faction && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  match.p2.faction === 'USSR' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                                }`}>
                                  {match.p2.faction}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                {match.p1.result === 'draw'
                                  ? 'Draw'
                                  : `${match.p1.result === 'win' ? match.p1.name : match.p2?.name} Won`}
                              </span>
                              {match.timestamp && (
                                <span className="text-[11px] text-slate-500">
                                  {new Date(match.timestamp).toLocaleDateString('en-GB', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <AdminScoreEntry 
                    league={leagueData?.league} 
                    members={members} 
                    onSubmit={handleScoreSubmit} 
                  />
                  
                  <div className="mt-8 p-6 bg-slate-900/30 border border-slate-800 rounded-xl">
                      <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-300">
                          <Settings size={16} /> League Config
                      </h4>
                      <div className="space-y-3 text-sm">
                          {leagueData?.league?.scoringConfig?.type === 'match' ? (
                              <>
                                  <div className="flex justify-between font-medium"><span className="text-slate-500">Win Points</span> <span className="text-green-400">+{leagueData?.league?.scoringConfig?.pointsPerWin}</span></div>
                                  {leagueData?.league?.scoringConfig?.allowDraws !== false && leagueData?.league?.scoringConfig?.pointsPerDraw != null && (
                                    <div className="flex justify-between font-medium"><span className="text-slate-500">Draw Points</span> <span className="text-slate-300">+{leagueData?.league?.scoringConfig?.pointsPerDraw}</span></div>
                                  )}
                                  <div className="flex justify-between font-medium"><span className="text-slate-500">Loss Points</span> <span className="text-red-400">{leagueData?.league?.scoringConfig?.pointsPerLoss}</span></div>
                                  {leagueData?.league?.scoringConfig?.factions && (
                                    <div className="flex justify-between font-medium"><span className="text-slate-500">Factions</span> <span className="text-slate-300">{leagueData.league.scoringConfig.factions.join(' vs ')}</span></div>
                                  )}
                              </>
                          ) : (
                              Object.entries(leagueData?.league?.scoringConfig?.rankPoints || {}).map(([rank, pts]) => (
                                  <div key={rank} className="flex justify-between font-medium">
                                      <span className="text-slate-500">{rank === '1' ? '1st' : rank === '2' ? '2nd' : rank === '3' ? '3rd' : rank+'th'} Place</span> 
                                      <span className="text-blue-400">+{pts}</span>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
