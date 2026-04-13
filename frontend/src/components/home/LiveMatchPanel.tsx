import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';
import type { Match } from '../../types';

const MOCK_MATCHES: Match[] = [
  {
    id: 1,
    competition: { name: 'Champions League', code: 'CL', emblem: '' },
    stage: 'GROUP_STAGE', group: 'Group A',
    status: 'IN_PLAY', minute: '74',
    homeTeam: { id: 1, name: 'London Titans', shortName: 'London Titans', crest: '' },
    awayTeam: { id: 2, name: 'Berlin Kings', shortName: 'Berlin Kings', crest: '' },
    score: { home: 3, away: 2 },
    stats: { possession: '56% - 44%', xG: '2.4 - 1.8', shotsOnTarget: '8 - 5', winProbability: '72%' },
  }
];

export default function LiveMatchPanel() {
  const { user, openAuthModal } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); setMatches(MOCK_MATCHES); return; }
    api.getLiveMatches()
      .then((res) => {
        let liveList = (res.data.matches || []).filter((m: Match) => ['IN_PLAY', 'LIVE', 'PAUSED'].includes(m.status));
        if (liveList.length === 0) {
          // Fallback if no specific LIVE matches are fetched, grab UPCOMING as well just to show something
          liveList = (res.data.matches || []).slice(0, 5); 
        }
        setMatches(liveList.length > 0 ? liveList : MOCK_MATCHES);
      })
      .catch(() => setMatches(MOCK_MATCHES))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (matches.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % matches.length);
    }, 6000); // changes every 6 seconds
    return () => clearInterval(interval);
  }, [matches.length]);

  const match = matches[currentIndex];
  const canSlide = matches.length > 1;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % matches.length);
  };

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-headline font-black tracking-tighter uppercase italic">Match of the Night</h2>
          <div className="flex items-center gap-4">
            {canSlide && (
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  className="w-10 h-10 rounded-full border border-white/10 bg-black/30 text-white transition-all hover:border-primary/40 hover:text-primary"
                  aria-label="Previous match"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button
                  onClick={goNext}
                  className="w-10 h-10 rounded-full border border-white/10 bg-black/30 text-white transition-all hover:border-primary/40 hover:text-primary"
                  aria-label="Next match"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5 opacity-50">
              {matches.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-secondary' : 'bg-surface-variant'}`} />
              ))}
            </div>
            <div className="flex items-center gap-2 bg-secondary/10 px-4 py-1 rounded-full border border-secondary/30 hidden sm:flex">
              <div className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              <span className="text-secondary text-xs font-bold uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>

        {loading || !match ? (
          <div className="glass-card rounded-2xl p-8 h-48 skeleton" />
        ) : (
          <div className="glass-card rounded-2xl p-8 md:p-12 relative overflow-hidden group shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-surface-container-low transition-all duration-700 ease-in-out">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10 animate-fade-in" key={match.id}>
              {/* Home */}
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-surface-container-highest flex items-center justify-center p-4 border border-outline-variant group-hover:border-primary/50 transition-colors shadow-inner">
                  {match.homeTeam.crest ? (
                     <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-full h-full object-contain" />
                  ) : (
                     <span className="font-headline font-black text-2xl text-primary">{match.homeTeam.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <h3 className="font-headline font-bold text-xl uppercase">{match.homeTeam.name}</h3>
              </div>
              {/* Score */}
              <div className="flex flex-col items-center gap-2">
                <span className="font-label text-[10px] uppercase font-black text-primary tracking-[0.3em] bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mb-2">
                   {match.competition.name || 'Pro League'}
                </span>
                <div className="flex items-center gap-6">
                  <span className="text-6xl md:text-8xl font-headline font-black italic text-glow-primary">{match.score.home ?? '–'}</span>
                  <span className="text-2xl font-headline text-on-surface-variant">:</span>
                  <span className="text-6xl md:text-8xl font-headline font-black italic text-glow-primary">{match.score.away ?? '–'}</span>
                </div>
                <span className="text-on-surface-variant font-label text-sm uppercase tracking-widest mt-2 bg-surface-variant px-4 py-1 rounded-full">
                  {match.minute ? `${match.minute}' Minute` : match.status}
                </span>
              </div>
              {/* Away */}
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-surface-container-highest flex items-center justify-center p-4 border border-outline-variant group-hover:border-primary/50 transition-colors shadow-inner">
                  {match.awayTeam.crest ? (
                     <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-full h-full object-contain" />
                  ) : (
                     <span className="font-headline font-black text-2xl text-secondary">{match.awayTeam.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <h3 className="font-headline font-bold text-xl uppercase">{match.awayTeam.name}</h3>
              </div>
            </div>

            {match.stats && Object.keys(match.stats).length > 0 && (
              <div key={`stats-${match.id}`} className="mt-12 pt-8 border-t border-outline-variant/30 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
                {match.stats.possession && <div className="flex flex-col items-center"><span className="text-on-surface-variant text-xs uppercase mb-1">Possession</span><span className="font-headline font-bold text-primary">{match.stats.possession}</span></div>}
                {match.stats.xG && <div className="flex flex-col items-center"><span className="text-on-surface-variant text-xs uppercase mb-1">Expected Goals</span><span className="font-headline font-bold text-primary">{match.stats.xG}</span></div>}
                {match.stats.shotsOnTarget ? <div className="flex flex-col items-center"><span className="text-on-surface-variant text-xs uppercase mb-1">Shots on Target</span><span className="font-headline font-bold text-primary">{match.stats.shotsOnTarget}</span></div> : <div className="flex flex-col items-center"><span className="text-on-surface-variant text-xs uppercase mb-1">Agg</span><span className="font-headline font-bold text-primary">{match.score.aggregate || '--'}</span></div>}
                {match.stats.winProbability ? <div className="flex flex-col items-center"><span className="text-on-surface-variant text-xs uppercase mb-1">Win Prob</span><span className="font-headline font-bold text-secondary">{match.stats.winProbability}</span></div> : <div className="flex flex-col items-center"><span className="text-on-surface-variant text-xs uppercase mb-1">Status</span><span className="font-headline font-bold text-secondary">{match.status}</span></div>}
              </div>
            )}

            {!user && (
              <div className="mt-6 flex justify-center mt-6 border-t border-white/5 pt-6 animate-fade-in">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-xs text-primary font-bold uppercase tracking-widest hover:underline"
                >
                  Sign in for real-time data →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
