import React, { useEffect, useState } from "react";
import { Layout, LayoutDashboard, Settings, Trophy, LogOut, ChevronRight, Sparkles, Plus } from 'lucide-react';
import Leaderboard from './components/Leaderboard';
import AdminScoreEntry from './components/AdminScoreEntry';
import LeagueCreator from './components/LeagueCreator';

const App = () => {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'league'
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const [leagueData, setLeagueData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock "My Leagues" for the dashboard - initialized with some data
  const [myLeagues, setMyLeagues] = useState([
    { id: 'league-1', name: 'Global FIFA Tournament', type: 'match' },
    { id: 'league-2', name: 'Office Chess League', type: 'rank' }
  ]);

  // We should ideally fetch these from /api/league-handler/leagues (to be implemented)
  // For now, we'll just handle the local refresh after creation.

  const fetchLeagueTable = async (leagueId) => {
    setLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/league-handler/league/${leagueId}/table`);
      if (!res.ok) throw new Error("Failed to fetch league data");
      const data = await res.json();
      setLeagueData(data);
      
      // Fetch members (In a real app, this might be a separate call or part of the above)
      // For MVP, we'll derive them from the table which has user info
      setMembers(data.table.map(row => ({ userId: row.userId, name: row.userName })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueSelect = (leagueId) => {
    setSelectedLeagueId(leagueId);
    setView('league');
    fetchLeagueTable(leagueId);
  };

  const handleLeagueCreated = (newLeague) => {
    setMyLeagues([...myLeagues, { id: newLeague.id, name: newLeague.name, type: newLeague.scoringConfig.type }]);
    // Success view logic is handled inside LeagueCreator, but we could navigate back here
  };

  const handleScoreSubmit = async (entry) => {
    try {
      const res = await fetch(`/.netlify/functions/league-handler/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId: selectedLeagueId, entry })
      });
      
      if (!res.ok) throw new Error("Failed to submit score");
      
      // Refresh the table (Optimistic UI would be better, but refresh is simpler for initial MVP)
      fetchLeagueTable(selectedLeagueId);
    } catch (err) {
      alert("Error submitting score: " + err.message);
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
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                            ))}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">+12 members</span>
                    </div>
                  </button>
                ))}

                {/* Create New League Button */}
                <button
                  onClick={() => setView('create-league')}
                  className="group relative p-6 bg-blue-600/5 border-2 border-dashed border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-600/10 rounded-2xl text-left transition-all flex flex-col items-center justify-center gap-4"
                >
                  <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                    <Plus size={32} strokeWidth={3} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-black text-blue-400 tracking-tight italic">New League</h3>
                    <p className="text-[10px] text-blue-500/60 font-black uppercase tracking-widest">Start a competition</p>
                  </div>
                </button>
              </div>
            </section>
          ) : view === 'create-league' ? (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto">
               <LeagueCreator 
                 onCreated={handleLeagueCreated} 
                 onCancel={() => setView('dashboard')} 
               />
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
                <div className="lg:col-span-2">
                  {leagueData && <Leaderboard league={leagueData.league} table={leagueData.table} />}
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
                                  <div className="flex justify-between font-medium"><span className="text-slate-500">Draw Points</span> <span className="text-slate-300">+{leagueData?.league?.scoringConfig?.pointsPerDraw}</span></div>
                                  <div className="flex justify-between font-medium"><span className="text-slate-500">Loss Points</span> <span className="text-red-400">{leagueData?.league?.scoringConfig?.pointsPerLoss}</span></div>
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
