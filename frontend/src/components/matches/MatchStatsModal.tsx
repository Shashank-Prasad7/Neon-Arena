import { useState, useEffect } from 'react';
import type { Match } from '../../types';
import { Link } from 'react-router-dom';

interface Props {
  match: Match;
  onClose: () => void;
}

type ModalTab = 'STATS' | 'TIMELINE' | 'RATINGS';

// Seeded pseudo-random — deterministic per match
function seeded(seed: number, idx: number, max: number) {
  return ((seed * 1664525 + idx * 1013904223) >>> 0) % max;
}

function buildStats(match: Match) {
  const s = match.id;
  const hg = match.score.home ?? 0;
  const ag = match.score.away ?? 0;

  const homePoss = Math.max(32, Math.min(68, 50 + (hg - ag) * 4 + seeded(s, 1, 12) - 6));

  return {
    possession: { home: homePoss, away: 100 - homePoss },
    shots: { home: hg * 3 + seeded(s, 2, 8) + 6, away: ag * 3 + seeded(s, 3, 8) + 5 },
    shotsOnTarget: { home: hg * 2 + seeded(s, 4, 3) + 1, away: ag * 2 + seeded(s, 5, 3) + 1 },
    corners: { home: seeded(s, 6, 7) + 2, away: seeded(s, 7, 7) + 2 },
    fouls: { home: seeded(s, 8, 8) + 7, away: seeded(s, 9, 8) + 7 },
    yellowCards: { home: seeded(s, 10, 3), away: seeded(s, 11, 3) },
    passes: { home: 320 + seeded(s, 12, 180), away: 280 + seeded(s, 13, 180) },
    offsides: { home: seeded(s, 14, 5), away: seeded(s, 15, 5) },
    xG: {
      home: ((hg * 0.65 + seeded(s, 16, 15) / 10 + 0.3)).toFixed(1),
      away: ((ag * 0.65 + seeded(s, 17, 15) / 10 + 0.3)).toFixed(1),
    },
    saves: { home: ag * 2 + seeded(s, 18, 3) + 1, away: hg * 2 + seeded(s, 19, 3) + 1 },
  };
}

const PLAYER_NAMES = [
  ['Silva', 'Fernandes', 'Ramos', 'Müller', 'Modric', 'Benzema', 'Kane', 'Salah', 'De Bruyne', 'Lewandowski', 'Neymar'],
  ['Torres', 'García', 'Hernandez', 'Kroos', 'Eriksen', 'Vardy', 'Grealish', 'Rashford', 'Mount', 'Saka', 'Foden'],
];

function buildRatings(match: Match) {
  const s = match.id;
  const hg = match.score.home ?? 0;
  const ag = match.score.away ?? 0;

  const makeTeam = (teamSeed: number, goalsFor: number, goalsAgainst: number, isHome: boolean) => {
    return Array.from({ length: 11 }, (_, i) => {
      const nameSet = isHome ? 0 : 1;
      const name = PLAYER_NAMES[nameSet][seeded(s + teamSeed, i, PLAYER_NAMES[nameSet].length)];
      const base = 6.0;
      const boost = goalsFor > goalsAgainst ? 0.6 : goalsFor < goalsAgainst ? -0.4 : 0.1;
      const rand = (seeded(s + teamSeed, i * 7, 20) - 10) / 10;
      const rating = Math.max(5.0, Math.min(9.9, base + boost + rand));
      const positions = ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'AM', 'RW', 'LW', 'ST'];
      return { name, rating: rating.toFixed(1), pos: positions[i] };
    });
  };

  return {
    home: makeTeam(1, hg, ag, true),
    away: makeTeam(100, ag, hg, false),
  };
}

function buildTimeline(match: Match) {
  const s = match.id;
  const hg = match.score.home ?? 0;
  const ag = match.score.away ?? 0;
  const events: { min: number; type: 'goal' | 'card' | 'var'; team: 'home' | 'away'; label: string }[] = [];

  let hLeft = hg;
  let aLeft = ag;

  const goalMinutes = Array.from({ length: hg + ag }, (_, i) =>
    Math.min(90, seeded(s, i * 3 + 50, 83) + 6)
  ).sort((a, b) => a - b);

  goalMinutes.forEach((min, i) => {
    const useHome = hLeft > aLeft || (hLeft > 0 && seeded(s, i * 11, 2) === 0);
    if (useHome && hLeft > 0) {
      hLeft--;
      events.push({ min, type: 'goal', team: 'home', label: `${match.homeTeam.shortName || match.homeTeam.name} score!` });
    } else if (aLeft > 0) {
      aLeft--;
      events.push({ min, type: 'goal', team: 'away', label: `${match.awayTeam.shortName || match.awayTeam.name} score!` });
    }
  });

  const cards = seeded(s, 200, 4);
  for (let i = 0; i < cards; i++) {
    events.push({
      min: seeded(s, i * 17 + 300, 82) + 8,
      type: 'card',
      team: seeded(s, i * 5 + 400, 2) === 0 ? 'home' : 'away',
      label: 'Yellow card',
    });
  }

  if (seeded(s, 500, 4) === 0) {
    events.push({ min: seeded(s, 501, 40) + 20, type: 'var', team: 'home', label: 'VAR Review' });
  }

  return events.sort((a, b) => a.min - b.min);
}

// Stat bar row
function StatBar({ label, home, away, isPercent = false }: { label: string; home: number; away: number; isPercent?: boolean }) {
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  const awayPct = 100 - homePct;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm font-black">
        <span className="text-white">{isPercent ? `${home}%` : home}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
        <span className="text-white">{isPercent ? `${away}%` : away}</span>
      </div>
      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
        <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${homePct}%` }} />
        <div className="h-full bg-secondary/80 transition-all duration-700 ease-out" style={{ width: `${awayPct}%` }} />
      </div>
    </div>
  );
}

export default function MatchStatsModal({ match, onClose }: Props) {
  const [tab, setTab] = useState<ModalTab>('STATS');
  const isFinished = match.status === 'FINISHED';
  const isUpcoming = ['SCHEDULED', 'TIMED'].includes(match.status);
  const safeMatch: Match = {
    ...match,
    score: {
      home: match.score?.home ?? null,
      away: match.score?.away ?? null,
      aggregate: match.score?.aggregate,
    },
    stats: match.stats ?? {},
  };
  const stats = buildStats(safeMatch);
  const ratings = buildRatings(safeMatch);
  const timeline = buildTimeline(safeMatch);

  // Lock body scroll while modal is mounted — prevents the page width
  // jumping when the scrollbar appears/disappears (the flicker)
  useEffect(() => {
    const prev = document.body.style.overflow;
    const prevPR = document.body.style.paddingRight;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    // Compensate for the scrollbar width so content doesn't shift
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = prevPR;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="bg-[#0d0d12] border border-white/8 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_80px_rgba(0,210,255,0.08)] flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal header ── */}
        <div className="px-6 pt-6 pb-0 bg-zinc-900/50 border-b border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary block mb-1">
                {isUpcoming ? 'Pre-Match Preview' : isFinished ? 'Match Analysis' : 'Live Analysis'}
              </span>
              <h2 className="text-xl font-headline font-black italic uppercase tracking-tighter">
                {match.homeTeam.shortName || match.homeTeam.name}
                <span className="text-primary mx-2">vs</span>
                {match.awayTeam.shortName || match.awayTeam.name}
              </h2>
              {isFinished && match.score.home !== null && (
                <p className="text-zinc-500 text-sm mt-1 font-bold">
                  Final Score: {match.score.home} — {match.score.away}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Tab bar — only for finished matches */}
          {isFinished && (
            <div className="flex gap-1 -mb-px">
              {(['STATS', 'TIMELINE', 'RATINGS'] as ModalTab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-t-lg border-t border-x transition-all ${
                    tab === t
                      ? 'bg-[#0d0d12] border-white/10 text-primary'
                      : 'border-transparent text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="overflow-y-auto hide-scrollbar flex-1">

          {/* ── STATS tab (also used for upcoming / live) ── */}
          {(!isFinished || tab === 'STATS') && (
            <div className="p-6 space-y-5">
              {/* Crests + score summary */}
              <div className="flex items-center justify-between gap-4 p-4 bg-zinc-900/60 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  {match.homeTeam.crest
                    ? <img src={match.homeTeam.crest} alt="" className="w-10 h-10 object-contain" />
                    : <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary text-xs">{match.homeTeam.name.slice(0, 2)}</div>
                  }
                  <span className="font-headline font-black uppercase text-sm">{match.homeTeam.shortName || match.homeTeam.name}</span>
                </div>
                {isFinished && match.score.home !== null ? (
                  <div className="text-3xl font-black text-white font-headline">
                    {match.score.home}<span className="text-zinc-600 mx-1">–</span>{match.score.away}
                  </div>
                ) : (
                  <span className="text-zinc-500 font-black text-sm uppercase tracking-widest">vs</span>
                )}
                <div className="flex items-center gap-3">
                  <span className="font-headline font-black uppercase text-sm">{match.awayTeam.shortName || match.awayTeam.name}</span>
                  {match.awayTeam.crest
                    ? <img src={match.awayTeam.crest} alt="" className="w-10 h-10 object-contain" />
                    : <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-black text-secondary text-xs">{match.awayTeam.name.slice(0, 2)}</div>
                  }
                </div>
              </div>

              {isUpcoming ? (
                <>
                  <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">info</span>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Pre-match view only. Live stats and expected-goals projections are hidden until the match actually starts.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Link
                      to={`/tactics?view=club&team=${encodeURIComponent(match.homeTeam.name)}`}
                      className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-4 hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">View Team Setup</span>
                      <span className="text-sm font-bold text-white mt-2 block">{match.homeTeam.name}</span>
                    </Link>
                    <Link
                      to={`/tactics?view=club&team=${encodeURIComponent(match.awayTeam.name)}`}
                      className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-4 hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">View Team Setup</span>
                      <span className="text-sm font-bold text-white mt-2 block">{match.awayTeam.name}</span>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <StatBar label="Possession" home={stats.possession.home} away={stats.possession.away} isPercent />
                  <div className="grid grid-cols-3 items-center gap-2">
                    <span className="text-2xl font-black text-primary text-left">{stats.xG.home}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Expected Goals</span>
                    <span className="text-2xl font-black text-secondary text-right">{stats.xG.away}</span>
                  </div>
                  <StatBar label="Total Shots" home={stats.shots.home} away={stats.shots.away} />
                  <StatBar label="Shots on Target" home={stats.shotsOnTarget.home} away={stats.shotsOnTarget.away} />
                  <StatBar label="Corners" home={stats.corners.home} away={stats.corners.away} />
                  <StatBar label="Fouls" home={stats.fouls.home} away={stats.fouls.away} />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/60 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                      <span className="text-yellow-400 font-black text-lg">{stats.yellowCards.home}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Yellow Cards</span>
                      <span className="text-yellow-400 font-black text-lg">{stats.yellowCards.away}</span>
                    </div>
                    <div className="bg-zinc-900/60 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                      <span className="text-white font-black text-lg">{stats.offsides.home}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Offsides</span>
                      <span className="text-white font-black text-lg">{stats.offsides.away}</span>
                    </div>
                  </div>
                  <StatBar label="Total Passes" home={stats.passes.home} away={stats.passes.away} />
                  <StatBar label="Saves" home={stats.saves.home} away={stats.saves.away} />
                </>
              )}
            </div>
          )}

          {/* ── TIMELINE tab ── */}
          {isFinished && tab === 'TIMELINE' && (
            <div className="p-6">
              <h3 className="font-headline font-black italic uppercase text-sm text-zinc-400 mb-6 tracking-widest">Match Timeline</h3>

              {/* 90-min visual bar */}
              <div className="relative mb-10">
                <div className="h-3 bg-zinc-800 rounded-full w-full relative overflow-visible">
                  {/* HT marker */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-zinc-600 -translate-x-0.5" />
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">HT</span>
                  <span className="absolute -bottom-5 left-0 text-[9px] font-black text-zinc-600 uppercase tracking-widest">0'</span>
                  <span className="absolute -bottom-5 right-0 text-[9px] font-black text-zinc-600 uppercase tracking-widest">90'</span>

                  {/* Events on bar */}
                  {timeline.map((ev, i) => (
                    <div
                      key={i}
                      className="absolute -top-1 -translate-x-1/2"
                      style={{ left: `${(ev.min / 90) * 100}%` }}
                    >
                      {ev.type === 'goal' ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-lg ${ev.team === 'home' ? 'bg-primary text-black' : 'bg-secondary text-black'}`}>
                          ⚽
                        </div>
                      ) : ev.type === 'card' ? (
                        <div className={`w-3.5 h-5 rounded-sm ${ev.team === 'home' ? 'bg-yellow-400' : 'bg-yellow-400'} shadow`} />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center text-[9px] text-white font-black">V</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Event list */}
              <div className="space-y-3 mt-4">
                {timeline.length === 0 && (
                  <p className="text-zinc-600 text-sm italic text-center py-8">No key events recorded</p>
                )}
                {timeline.map((ev, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-3 rounded-xl border ${
                      ev.type === 'goal'
                        ? ev.team === 'home'
                          ? 'bg-primary/8 border-primary/20'
                          : 'bg-secondary/8 border-secondary/20'
                        : ev.type === 'card'
                        ? 'bg-yellow-400/8 border-yellow-400/20'
                        : 'bg-zinc-800/60 border-white/5'
                    }`}
                  >
                    <span className={`w-10 text-right font-black text-sm shrink-0 ${ev.team === 'home' ? 'text-primary' : 'text-secondary'}`}>
                      {ev.min}'
                    </span>
                    <span className="material-symbols-outlined text-lg shrink-0 text-zinc-400">
                      {ev.type === 'goal' ? 'sports_score' : ev.type === 'card' ? 'style' : 'sports_whistle'}
                    </span>
                    <span className="flex-1 text-sm font-medium text-zinc-200">{ev.label}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      ev.team === 'home' ? 'text-primary bg-primary/10' : 'text-secondary bg-secondary/10'
                    }`}>
                      {ev.team === 'home'
                        ? (match.homeTeam.shortName || match.homeTeam.name).slice(0, 3)
                        : (match.awayTeam.shortName || match.awayTeam.name).slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RATINGS tab ── */}
          {isFinished && tab === 'RATINGS' && (
            <div className="p-6">
              <h3 className="font-headline font-black italic uppercase text-sm text-zinc-400 mb-6 tracking-widest">Player Ratings</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Home team */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {match.homeTeam.crest
                      ? <img src={match.homeTeam.crest} alt="" className="w-6 h-6 object-contain" />
                      : null}
                    <span className="font-headline font-black uppercase text-xs tracking-widest text-primary">
                      {match.homeTeam.shortName || match.homeTeam.name}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {ratings.home.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-600 w-7 text-right">{p.pos}</span>
                        <div className="flex-1 bg-zinc-800/80 rounded-lg overflow-hidden h-7 flex items-center relative">
                          <div
                            className="h-full bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg transition-all duration-500"
                            style={{ width: `${((parseFloat(p.rating) - 4) / 6) * 100}%` }}
                          />
                          <span className="absolute left-2 text-[11px] font-black text-white truncate max-w-[70px]">{p.name}</span>
                        </div>
                        <span className={`text-xs font-black w-8 text-right ${
                          parseFloat(p.rating) >= 8 ? 'text-secondary' :
                          parseFloat(p.rating) >= 7 ? 'text-primary' :
                          parseFloat(p.rating) >= 6 ? 'text-white' :
                          'text-zinc-500'
                        }`}>{p.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Away team */}
                <div>
                  <div className="flex items-center gap-2 mb-4 justify-end">
                    <span className="font-headline font-black uppercase text-xs tracking-widest text-secondary">
                      {match.awayTeam.shortName || match.awayTeam.name}
                    </span>
                    {match.awayTeam.crest
                      ? <img src={match.awayTeam.crest} alt="" className="w-6 h-6 object-contain" />
                      : null}
                  </div>
                  <div className="space-y-2">
                    {ratings.away.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`text-xs font-black w-8 text-left ${
                          parseFloat(p.rating) >= 8 ? 'text-secondary' :
                          parseFloat(p.rating) >= 7 ? 'text-primary' :
                          parseFloat(p.rating) >= 6 ? 'text-white' :
                          'text-zinc-500'
                        }`}>{p.rating}</span>
                        <div className="flex-1 bg-zinc-800/80 rounded-lg overflow-hidden h-7 flex items-center relative">
                          <div
                            className="h-full bg-gradient-to-l from-secondary/20 to-secondary/5 rounded-lg transition-all duration-500 ml-auto"
                            style={{ width: `${((parseFloat(p.rating) - 4) / 6) * 100}%` }}
                          />
                          <span className="absolute right-2 text-[11px] font-black text-white truncate max-w-[70px]">{p.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-zinc-600 w-7">{p.pos}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MOTM */}
              {(() => {
                const allPlayers = [...ratings.home.map(p => ({ ...p, team: 'home' as const })), ...ratings.away.map(p => ({ ...p, team: 'away' as const }))];
                const motm = allPlayers.reduce((best, cur) => parseFloat(cur.rating) > parseFloat(best.rating) ? cur : best);
                return (
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/5 border border-primary/20 rounded-xl flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl text-primary">emoji_events</span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Man of the Match</span>
                      <span className="font-headline font-black italic uppercase text-xl text-white">{motm.name}</span>
                      <span className="ml-2 text-primary font-black">{motm.rating}</span>
                    </div>
                    <div className="ml-auto">
                      {motm.team === 'home'
                        ? (match.homeTeam.crest ? <img src={match.homeTeam.crest} alt="" className="w-10 h-10 object-contain" /> : null)
                        : (match.awayTeam.crest ? <img src={match.awayTeam.crest} alt="" className="w-10 h-10 object-contain" /> : null)
                      }
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 bg-zinc-900/50 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
