import { useState } from 'react';
import type { Match } from '../../types';
import { Link } from 'react-router-dom';
import MatchStatsModal from './MatchStatsModal';

interface Props { match: Match }

function formatTime(utcDate?: string) {
  if (!utcDate) return '';
  return new Date(utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(utcDate?: string) {
  if (!utcDate) return '';
  return new Date(utcDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function MatchCard({ match }: Props) {
  const isLive = ['IN_PLAY', 'LIVE', 'PAUSED'].includes(match.status);
  const isFinished = match.status === 'FINISHED';
  const [showStats, setShowStats] = useState(false);
  const matchStats = match.stats ?? {};
  const homeTacticsLink = `/tactics?view=club&team=${encodeURIComponent(match.homeTeam.name)}`;
  const awayTacticsLink = `/tactics?view=club&team=${encodeURIComponent(match.awayTeam.name)}`;

  return (
    <div className={`glass-card rounded-[1.8rem] p-6 relative overflow-hidden group border-l-2 transition-all hover:scale-[1.01] ${isLive ? 'border-secondary shadow-[0_30px_60px_-36px_rgba(47,248,1,0.28)]' : isFinished ? 'border-outline-variant' : 'border-primary/30 shadow-[0_30px_60px_-36px_rgba(114,220,255,0.16)]'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(114,220,255,0.08),transparent_34%)] pointer-events-none" />
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col">
          <span className="font-headline text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">
            {match.competition.name} {match.group ? `• ${match.group}` : ''}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {isLive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-label text-xs font-bold text-secondary uppercase">{match.minute}' LIVE</span>
              </>
            ) : isFinished ? (
              <span className="font-label text-xs font-bold text-on-surface-variant uppercase">Full Time</span>
            ) : (
              <span className="font-label text-xs font-bold text-primary uppercase">
                {match.utcDate ? `${formatDate(match.utcDate)} • ${formatTime(match.utcDate)}` : 'Upcoming'}
              </span>
            )}
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${isLive ? 'bg-secondary/10 text-secondary border border-secondary/20' : isFinished ? 'bg-surface-container text-on-surface-variant border border-outline-variant/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
          {isLive ? 'LIVE' : isFinished ? 'FT' : 'Soon'}
        </span>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link to={homeTacticsLink} className="flex flex-col items-center flex-1 text-center group/team">
          <div className="w-16 h-16 md:w-20 md:h-20 mb-3 bg-surface-container rounded-full p-2 border border-white/5 shadow-inner flex items-center justify-center">
            {match.homeTeam.crest ? (
              <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-full h-full object-contain" />
            ) : (
              <span className="font-headline font-black text-lg text-primary">{match.homeTeam.name.slice(0, 2)}</span>
            )}
          </div>
          <span className="font-headline text-base font-bold uppercase tracking-tight group-hover/team:text-primary transition-colors">{match.homeTeam.shortName || match.homeTeam.name}</span>
        </Link>

        <div className="flex flex-col items-center">
          {match.score.home !== null ? (
            <div className="flex items-baseline gap-4">
              <span className="font-headline text-5xl md:text-6xl font-black text-white">{match.score.home}</span>
              <span className="font-headline text-2xl text-on-surface-variant opacity-30">:</span>
              <span className="font-headline text-5xl md:text-6xl font-black text-white">{match.score.away}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-headline text-3xl font-black text-on-surface-variant">VS</span>
            </div>
          )}
          {match.score.aggregate && (
            <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{match.score.aggregate}</span>
          )}
        </div>

        <Link to={awayTacticsLink} className="flex flex-col items-center flex-1 text-center group/team">
          <div className="w-16 h-16 md:w-20 md:h-20 mb-3 bg-surface-container rounded-full p-2 border border-white/5 shadow-inner flex items-center justify-center">
            {match.awayTeam.crest ? (
              <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-full h-full object-contain" />
            ) : (
              <span className="font-headline font-black text-lg text-secondary">{match.awayTeam.name.slice(0, 2)}</span>
            )}
          </div>
          <span className="font-headline text-base font-bold uppercase tracking-tight group-hover/team:text-primary transition-colors">{match.awayTeam.shortName || match.awayTeam.name}</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        {matchStats.possession || matchStats.xG ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full border border-white/5">
              <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                {matchStats.xG ? `xG ${matchStats.xG}` : `Poss. ${matchStats.possession}`}
              </span>
            </div>
          </div>
        ) : (
          <div />
        )}
        {isLive ? (
          <Link
            to={`/simulation?home=${encodeURIComponent(match.homeTeam.name)}&away=${encodeURIComponent(match.awayTeam.name)}&homeCode=${match.homeTeam.crest ? encodeURIComponent(match.homeTeam.crest) : ''}&awayCode=${match.awayTeam.crest ? encodeURIComponent(match.awayTeam.crest) : ''}&knockout=${match.competition.code === 'CL' ? 'true' : 'false'}`}
            className="px-5 py-2 rounded-full font-headline text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 hover:scale-105 bg-secondary text-black shadow-[0_0_18px_rgba(47,248,1,0.35)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span className="material-symbols-outlined text-sm">play_circle</span>
            Watch Live
          </Link>
        ) : isFinished ? (
          <button
            onClick={() => setShowStats(true)}
            className="px-5 py-2 rounded-full font-headline text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 hover:scale-105 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
          >
            <span className="material-symbols-outlined text-sm">query_stats</span>
            Full Analysis
          </button>
        ) : (
          <button
            onClick={() => setShowStats(true)}
            className="px-5 py-2 rounded-full font-headline text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 hover:scale-105 border border-white/10 text-zinc-300 hover:border-primary/30 hover:text-primary"
          >
            <span className="material-symbols-outlined text-sm">preview</span>
            Pre-match
          </button>
        )}
      </div>

      {showStats && <MatchStatsModal match={match} onClose={() => setShowStats(false)} />}

      {/* Atmospheric glow */}
      {isLive && <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-secondary/10 blur-[60px] pointer-events-none" />}
      {isFinished && <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-primary/5 blur-[50px] pointer-events-none" />}
    </div>
  );
}
