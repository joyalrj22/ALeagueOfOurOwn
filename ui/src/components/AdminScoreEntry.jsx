import React, { useEffect, useState } from 'react';
import { Send, UserPlus, Trophy, Award } from 'lucide-react';

const AdminScoreEntry = ({ league, members, onSubmit }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUser1, setSelectedUser1] = useState('');
  const [selectedUser2, setSelectedUser2] = useState('');
  const [p1Faction, setP1Faction] = useState('');
  const [p2Faction, setP2Faction] = useState('');
  const [matchResult, setMatchResult] = useState('player1');
  const [matchDate, setMatchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rank, setRank] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMatchBased = league?.scoringConfig?.type === 'match';
  const factions = league?.scoringConfig?.factions || null;
  const allowDraws =
    league?.scoringConfig?.allowDraws !== false &&
    league?.scoringConfig?.pointsPerDraw !== null &&
    league?.scoringConfig?.pointsPerDraw !== undefined;

  useEffect(() => {
    if (factions && factions.length >= 2) {
      setP1Faction(factions[0]);
      setP2Faction(factions[1]);
    } else {
      setP1Faction('');
      setP2Faction('');
    }
  }, [league?.id]);

  const handleP1FactionChange = (value) => {
    setP1Faction(value);
    if (factions && factions.length === 2) {
      setP2Faction(value === factions[0] ? factions[1] : factions[0]);
    }
  };

  const handleP2FactionChange = (value) => {
    setP2Faction(value);
    if (factions && factions.length === 2) {
      setP1Faction(value === factions[0] ? factions[1] : factions[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    if (isMatchBased) {
      if (!selectedUser1 || !selectedUser2) {
        setIsSubmitting(false);
        return;
      }
      
      const p1Result = matchResult === 'player1' ? 'win' : matchResult === 'draw' ? 'draw' : 'loss';
      const p2Result = matchResult === 'player2' ? 'win' : matchResult === 'draw' ? 'draw' : 'loss';
      
      const timestamp = matchDate ? new Date(`${matchDate}T12:00:00.000Z`).toISOString() : new Date().toISOString();
      const p1Entry = { userId: selectedUser1, result: p1Result, opponentId: selectedUser2, timestamp };
      const p2Entry = { userId: selectedUser2, result: p2Result, opponentId: selectedUser1, timestamp };
      if (factions) {
        p1Entry.faction = p1Faction;
        p2Entry.faction = p2Faction;
      }

      await onSubmit([p1Entry, p2Entry]);
      
      setSelectedUser1('');
      setSelectedUser2('');
      setMatchResult('player1');
      setMatchDate(new Date().toISOString().split('T')[0]);
      if (factions && factions.length >= 2) {
        setP1Faction(factions[0]);
        setP2Faction(factions[1]);
      }
    } else {
      if (!selectedUser) {
        setIsSubmitting(false);
        return;
      }
      
      await onSubmit({ userId: selectedUser, rank: parseInt(rank) });
      setSelectedUser('');
      setRank(1);
    }
    
    setIsSubmitting(false);
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
        {isMatchBased ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Player 1</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                  value={selectedUser1}
                  onChange={(e) => setSelectedUser1(e.target.value)}
                  required
                >
                  <option value="">Select a member...</option>
                  {members.map(member => (
                    <option key={member.userId} value={member.userId} disabled={member.userId === selectedUser2}>{member.name}</option>
                  ))}
                </select>
                {factions && (
                  <select
                    aria-label="Player 1 Faction"
                    className="mt-2 w-full bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-300 focus:ring-2 focus:ring-blue-500/50 outline-none"
                    value={p1Faction}
                    onChange={(e) => handleP1FactionChange(e.target.value)}
                  >
                    {factions.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Player 2</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                  value={selectedUser2}
                  onChange={(e) => setSelectedUser2(e.target.value)}
                  required
                >
                  <option value="">Select a member...</option>
                  {members.map(member => (
                    <option key={member.userId} value={member.userId} disabled={member.userId === selectedUser1}>{member.name}</option>
                  ))}
                </select>
                {factions && (
                  <select
                    aria-label="Player 2 Faction"
                    className="mt-2 w-full bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-300 focus:ring-2 focus:ring-blue-500/50 outline-none"
                    value={p2Faction}
                    onChange={(e) => handleP2FactionChange(e.target.value)}
                  >
                    {factions.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Date Played</label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3 text-center">Result</label>
              <div className={`grid ${allowDraws ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                <button
                  type="button"
                  onClick={() => setMatchResult('player1')}
                  className={`
                    py-2 rounded-lg font-bold border transition-all uppercase text-xs tracking-widest
                    ${matchResult === 'player1' 
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-500' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600'}
                  `}
                >
                  P1 Won
                </button>
                {allowDraws && (
                  <button
                    type="button"
                    onClick={() => setMatchResult('draw')}
                    className={`
                      py-2 rounded-lg font-bold border transition-all uppercase text-xs tracking-widest
                      ${matchResult === 'draw' 
                        ? 'bg-slate-500/20 border-slate-500/50 text-slate-400' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600'}
                    `}
                  >
                    Draw
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMatchResult('player2')}
                  className={`
                    py-2 rounded-lg font-bold border transition-all uppercase text-xs tracking-widest
                    ${matchResult === 'player2' 
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-500' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600'}
                  `}
                >
                  P2 Won
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting || (isMatchBased ? (!selectedUser1 || !selectedUser2) : !selectedUser)}
          className={`
            w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all
            ${(isSubmitting || (isMatchBased ? (!selectedUser1 || !selectedUser2) : !selectedUser)) 
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
