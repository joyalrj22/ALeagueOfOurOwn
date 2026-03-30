import React, { useState } from 'react';
import { Trophy, Layout, Plus, Check, Loader2, Sparkles, X, ChevronRight } from 'lucide-react';

const LeagueCreator = ({ onCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('match'); // 'match' or 'rank'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Default Match Config
  const [matchConfig, setMatchConfig] = useState({
    pointsPerWin: 3,
    pointsPerDraw: 1,
    pointsPerLoss: 0,
  });

  // Default Rank Config
  const [rankConfig, setRankConfig] = useState([
    { rank: 1, points: 10 },
    { rank: 2, points: 6 },
    { rank: 3, points: 4 },
    { rank: 4, points: 2 },
    { rank: 5, points: 1 },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const scoringConfig = type === 'match' 
      ? { type: 'match', ...matchConfig }
      : { 
          type: 'rank', 
          rankPoints: rankConfig.reduce((acc, curr) => {
            acc[curr.rank] = curr.points;
            return acc;
          }, {})
        };

    try {
      const res = await fetch('/api/league-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, scoringConfig }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create league');
      }

      const newLeague = await res.json();
      setSuccess(newLeague);
      if (onCreated) onCreated(newLeague);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-slate-900/60 border border-blue-500/30 backdrop-blur-xl rounded-3xl p-12 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
          <Check size={40} strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 italic">League Created!</h2>
        <p className="text-slate-400 mb-8 font-medium">Your tournament "{success.name}" is ready for action.</p>
        
        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 mb-8">
          <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2">Invite Code</p>
          <p className="text-4xl font-mono font-black text-blue-400 tracking-tighter">{success.inviteCode}</p>
        </div>

        <button 
          onClick={() => setSuccess(null)}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)]"
        >
          View Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-transparent">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="text-blue-400" size={24} /> Create League
          </h2>
          <p className="text-slate-500 text-sm font-medium">Launch your custom competition in seconds.</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* League Name */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">League Name</label>
          <input 
            type="text"
            required
            placeholder="e.g. Champions League 2026"
            className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 outline-none p-4 rounded-xl text-white font-bold transition-all placeholder:text-slate-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Scoring Type */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Scoring Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('match')}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
                type === 'match' 
                ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <Trophy size={28} />
              <div className="text-center">
                <p className="font-black text-sm uppercase italic">Match-Based</p>
                <p className="text-[10px] font-bold opacity-60">Win/Loss/Draw</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setType('rank')}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
                type === 'rank' 
                ? 'bg-amber-600/10 border-amber-500 text-amber-400' 
                : 'bg-slate-950/30 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <Layout size={28} />
              <div className="text-center">
                <p className="font-black text-sm uppercase italic">Rank-Based</p>
                <p className="text-[10px] font-bold opacity-60">Points per Place</p>
              </div>
            </button>
          </div>
        </div>

        {/* Scoring Config */}
        <div className="bg-slate-950/30 border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-300 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            Scoring Configuration
          </h3>

          {type === 'match' ? (
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase italic">Win</p>
                <input 
                   type="number" 
                   className="w-full bg-slate-900 border border-slate-800 p-3 rounded-lg text-green-400 font-black text-center"
                   value={matchConfig.pointsPerWin}
                   onChange={(e) => setMatchConfig({...matchConfig, pointsPerWin: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase italic">Draw</p>
                <input 
                   type="number" 
                   className="w-full bg-slate-900 border border-slate-800 p-3 rounded-lg text-slate-400 font-black text-center"
                   value={matchConfig.pointsPerDraw}
                   onChange={(e) => setMatchConfig({...matchConfig, pointsPerDraw: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase italic">Loss</p>
                <input 
                   type="number" 
                   className="w-full bg-slate-900 border border-slate-800 p-3 rounded-lg text-red-400 font-black text-center"
                   value={matchConfig.pointsPerLoss}
                   onChange={(e) => setMatchConfig({...matchConfig, pointsPerLoss: parseInt(e.target.value)})}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {rankConfig.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-12 h-10 bg-slate-900 border border-slate-800 flex items-center justify-center rounded-lg font-black text-slate-500 italic">
                    {item.rank}
                  </div>
                  <div className="flex-1">
                     <input 
                        type="range" min="0" max="100" 
                        className="w-full accent-amber-500"
                        value={item.points}
                        onChange={(e) => {
                          const newConfig = [...rankConfig];
                          newConfig[idx].points = parseInt(e.target.value);
                          setRankConfig(newConfig);
                        }}
                     />
                  </div>
                  <div className="w-12 text-right font-black text-amber-400">{item.points}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <button 
          disabled={loading}
          className="group w-full py-5 bg-white hover:bg-blue-50 transition-all text-slate-950 font-black text-lg rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              Launch League <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LeagueCreator;
