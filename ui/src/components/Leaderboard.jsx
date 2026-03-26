import React from 'react';
import { Trophy, Users, TrendingUp } from 'lucide-react';

const Leaderboard = ({ league, table }) => {
  if (!table || table.length === 0) return <div className="text-gray-400">No data available yet.</div>;

  const isMatchBased = league?.scoringConfig?.type === 'match';

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2 text-blue-400">
          <Trophy size={18} />
          Current Leaderboard
        </h3>
        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
          {league?.scoringConfig?.type} scoring
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 text-slate-400 font-medium">
            <tr>
              <th className="px-5 py-3 w-16">Rank</th>
              <th className="px-5 py-3">Member</th>
              <th className="px-5 py-3 text-center">Played</th>
              {isMatchBased && (
                <>
                  <th className="px-5 py-3 text-center">W/D/L</th>
                </>
              )}
              <th className="px-5 py-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {table.map((row, idx) => (
              <tr key={row.userId} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-4">
                  <span className={`
                    flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                    ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 
                      idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/50' :
                      idx === 2 ? 'bg-amber-700/20 text-amber-700 border border-amber-700/50' :
                      'bg-slate-800 text-slate-400'}
                  `}>
                    {row.rank}
                  </span>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-200">{row.userName}</td>
                <td className="px-5 py-4 text-center text-slate-400">{row.played}</td>
                {isMatchBased && (
                  <td className="px-5 py-4 text-center">
                    <div className="flex justify-center gap-1.5 text-xs">
                      <span className="text-green-500">{row.wins}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-slate-400">{row.draws}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-red-500">{row.losses}</span>
                    </div>
                  </td>
                )}
                <td className="px-5 py-4 text-right">
                  <span className="font-bold text-blue-400 text-lg">{row.points}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
