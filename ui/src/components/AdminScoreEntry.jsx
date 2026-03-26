import React, { useState } from 'react';
import { Send, UserPlus, Trophy, Award } from 'lucide-react';

const AdminScoreEntry = ({ league, members, onSubmit }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [result, setResult] = useState('win');
  const [rank, setRank] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMatchBased = league?.scoringConfig?.type === 'match';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    const entryData = isMatchBased 
      ? { userId: selectedUser, result } 
      : { userId: selectedUser, rank: parseInt(rank) };
    
    await onSubmit(entryData);
    setIsSubmitting(false);
    
    // Reset form
    setSelectedUser('');
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
          <Award size={20} />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Enter Score</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Member</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            required
          >
            <option value="">Select a member...</option>
            {members.map(member => (
              <option key={member.userId} value={member.userId}>{member.name}</option>
            ))}
          </select>
        </div>

        {isMatchBased ? (
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-3 text-center">Result</label>
            <div className="grid grid-cols-3 gap-3">
              {['win', 'draw', 'loss'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResult(r)}
                  className={`
                    py-2 rounded-lg font-bold border transition-all uppercase text-xs tracking-widest
                    ${result === r 
                      ? (r === 'win' ? 'bg-green-500/20 border-green-500/50 text-green-500' : 
                         r === 'draw' ? 'bg-slate-500/20 border-slate-500/50 text-slate-400' : 
                         'bg-red-500/20 border-red-500/50 text-red-500')
                      : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600'}
                  `}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Rank Achieved</label>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                min="1" 
                max="100"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <span className="text-slate-500 whitespace-nowrap">Place</span>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting || !selectedUser}
          className={`
            w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all
            ${isSubmitting || !selectedUser 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:text-blue-900 text-white'}
          `}
        >
          {isSubmitting ? 'Submitting...' : (
            <>
              <Send size={18} />
              Submit Result
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminScoreEntry;
