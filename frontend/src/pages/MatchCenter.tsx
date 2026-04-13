import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import type { Match } from '../types';
import MatchCard from '../components/matches/MatchCard';
import LeagueFilter from '../components/matches/LeagueFilter';
import NewsTicker from '../components/matches/NewsTicker';
import { PageLoader } from '../components/ui/LoadingSpinner';

type Tab = 'LIVE' | 'UPCOMING' | 'FINISHED';
type League = 'PL' | 'CL' | 'PD' | 'BL1' | 'FL1' | 'SA';

const STATUS_MAP: Record<Tab, string[]> = {
  LIVE:     ['IN_PLAY', 'LIVE', 'PAUSED'],
  UPCOMING: ['SCHEDULED', 'TIMED'],
  FINISHED: ['FINISHED'],
};

function normalizeMatch(match: Partial<Match>): Match {
  return {
    id: match.id ?? Date.now(),
    competition: {
      name: match.competition?.name ?? 'Unknown Competition',
      code: match.competition?.code ?? 'UNK',
      emblem: match.competition?.emblem ?? '',
    },
    stage: match.stage ?? '',
    group: match.group ?? null,
    status: (match.status as Match['status']) ?? 'SCHEDULED',
    minute: match.minute ?? null,
    utcDate: match.utcDate,
    homeTeam: {
      id: match.homeTeam?.id ?? 0,
      name: match.homeTeam?.name ?? 'Home Team',
      shortName: match.homeTeam?.shortName ?? match.homeTeam?.name ?? 'HOME',
      crest: match.homeTeam?.crest ?? '',
    },
    awayTeam: {
      id: match.awayTeam?.id ?? 0,
      name: match.awayTeam?.name ?? 'Away Team',
      shortName: match.awayTeam?.shortName ?? match.awayTeam?.name ?? 'AWAY',
      crest: match.awayTeam?.crest ?? '',
    },
    score: {
      home: match.score?.home ?? null,
      away: match.score?.away ?? null,
      aggregate: match.score?.aggregate,
    },
    stats: match.stats ?? {},
  };
}

export default function MatchCenter() {
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('LIVE');
  const [activeLeague, setActiveLeague] = useState<League>('CL');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // AbortController prevents stale responses from overwriting newer state
    // (also fixes React StrictMode double-invocation race conditions)
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    api.getMatches(activeLeague)
      .then((res) => {
        if (controller.signal.aborted) return;
        // Backend returns { matches: [...] }  — handle both shapes defensively
        const raw = res.data?.matches ?? (Array.isArray(res.data) ? res.data : []);
        setMatches(Array.isArray(raw) ? raw.map(normalizeMatch) : []);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError('Could not reach the match server. Is the backend running?');
        setMatches([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [user, activeLeague]);

  const filtered = matches.filter(m => STATUS_MAP[activeTab].includes(m.status));
  const tabCount = (tab: Tab) => matches.filter(m => STATUS_MAP[tab].includes(m.status)).length;

  return (
    <div className="pb-8">
      {/* ── Hero ── */}
      <section className="relative w-full h-[300px] flex items-end px-6 md:px-12 py-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#2ff801]" />
            <span className="font-headline text-secondary text-sm tracking-[0.2em] uppercase font-bold">Live Stream Active</span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9] italic">
            Match <span className="text-primary-container">Center</span>
          </h1>
          <p className="mt-4 font-body text-on-surface-variant max-w-md text-sm">
            Real-time data from the global grid. Every tackle, goal, and tactical shift.
          </p>
        </div>
      </section>

      <NewsTicker />

      {/* ── Filters ── */}
      <section className="max-w-7xl mx-auto px-6 mt-6 relative z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-container/80 backdrop-blur-xl p-6 rounded-xl shadow-2xl border-t border-white/5">
          {/* Tab switcher with live counts */}
          <div className="flex p-1 bg-surface-container-lowest rounded-lg w-fit gap-1">
            {(['LIVE', 'UPCOMING', 'FINISHED'] as Tab[]).map(tab => {
              const count = tabCount(tab);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-md font-headline text-xs uppercase tracking-widest transition-all font-bold flex items-center gap-1.5 ${
                    activeTab === tab
                      ? tab === 'LIVE'
                        ? 'bg-secondary/20 text-secondary shadow-[0_0_15px_rgba(47,248,1,0.2)]'
                        : 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,210,255,0.3)]'
                      : 'text-zinc-500 hover:text-on-surface'
                  }`}
                >
                  {tab === 'LIVE' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  )}
                  {tab}
                  {count > 0 && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      activeTab === tab ? 'bg-white/20' : 'bg-white/10 text-zinc-400'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <LeagueFilter active={activeLeague} onChange={(l) => setActiveLeague(l as League)} />
        </div>
      </section>

      {/* ── Match Grid ── */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        {!user ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-primary/20">
            <span className="material-symbols-outlined text-5xl text-primary mb-4 block">lock</span>
            <h3 className="font-headline text-2xl font-black uppercase italic mb-2">Sign In to View Live Data</h3>
            <p className="text-on-surface-variant mb-6">Access real-time match scores, stats, and live streams.</p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-8 py-4 bg-primary text-on-primary-container font-headline font-black uppercase tracking-tighter rounded-xl hover:shadow-[0_0_25px_rgba(0,210,255,0.4)] transition-all"
            >
              Sign In
            </button>
          </div>
        ) : loading ? (
          <PageLoader />
        ) : error ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-red-500/20">
            <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block">wifi_off</span>
            <p className="font-headline text-xl uppercase text-red-400 mb-2">{error}</p>
            <p className="text-zinc-500 text-sm mb-6">
              Make sure the backend is running on port 3001 with <code className="text-primary bg-primary/10 px-1 rounded">node server.js</code>
            </p>
            <button
              onClick={() => setActiveLeague(l => l)} // re-trigger the effect
              className="px-6 py-2 border border-primary/30 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/10 transition-all"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">sports_soccer</span>
            <p className="font-headline text-xl uppercase">No {activeTab.toLowerCase()} matches</p>
            <p className="text-sm mt-2 text-zinc-600">
              {activeTab === 'LIVE'
                ? 'No live matches right now — check UPCOMING for scheduled fixtures.'
                : 'Try a different league or check back later.'}
            </p>
            {activeTab === 'LIVE' && (
              <button
                onClick={() => setActiveTab('UPCOMING')}
                className="mt-6 px-6 py-2 border border-primary/30 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/10 transition-all"
              >
                View Upcoming
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
