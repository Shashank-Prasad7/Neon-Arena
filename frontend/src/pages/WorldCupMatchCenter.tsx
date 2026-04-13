import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import type { WorldCupData } from '../types';
import { PageLoader } from '../components/ui/LoadingSpinner';

type Tab = 'LIVE' | 'UPCOMING' | 'FINISHED';
type WorldCupMatchCard = {
  id: string;
  homeTeam: string;
  homeCode: string;
  awayTeam: string;
  awayCode: string;
  homeScore: number | null;
  awayScore: number | null;
  stage: string;
  minute: string;
  venue?: string;
  live?: boolean;
};

const FINISHED_MATCHES: WorldCupMatchCard[] = [
  { id: 'wc-f-1', homeTeam: 'Netherlands', homeCode: 'nl', awayTeam: 'Senegal', awayCode: 'sn', homeScore: 2, awayScore: 0, stage: 'Group A', minute: 'FT', venue: 'Al Thumama Stadium' },
  { id: 'wc-f-2', homeTeam: 'Ecuador', homeCode: 'ec', awayTeam: 'Qatar', awayCode: 'qa', homeScore: 1, awayScore: 0, stage: 'Group A', minute: 'FT', venue: 'Lusail Stadium' },
  { id: 'wc-f-3', homeTeam: 'Senegal', homeCode: 'sn', awayTeam: 'Qatar', awayCode: 'qa', homeScore: 3, awayScore: 1, stage: 'Group A', minute: 'FT', venue: 'Education City Stadium' },
  { id: 'wc-f-4', homeTeam: 'England', homeCode: 'gb-eng', awayTeam: 'USA', awayCode: 'us', homeScore: 2, awayScore: 1, stage: 'Group B', minute: 'FT', venue: 'Al Bayt Stadium' },
  { id: 'wc-f-5', homeTeam: 'Iran', homeCode: 'ir', awayTeam: 'Wales', awayCode: 'gb-wls', homeScore: 1, awayScore: 0, stage: 'Group B', minute: 'FT', venue: 'Ahmed bin Ali Stadium' },
  { id: 'wc-f-6', homeTeam: 'England', homeCode: 'gb-eng', awayTeam: 'Iran', awayCode: 'ir', homeScore: 3, awayScore: 0, stage: 'Group B', minute: 'FT', venue: 'Khalifa International Stadium' },
  { id: 'wc-f-7', homeTeam: 'Argentina', homeCode: 'ar', awayTeam: 'Mexico', awayCode: 'mx', homeScore: 2, awayScore: 0, stage: 'Group C', minute: 'FT', venue: 'Stadium 974' },
  { id: 'wc-f-8', homeTeam: 'Poland', homeCode: 'pl', awayTeam: 'Saudi Arabia', awayCode: 'sa', homeScore: 2, awayScore: 1, stage: 'Group C', minute: 'FT', venue: 'Education City Stadium' },
  { id: 'wc-f-9', homeTeam: 'Argentina', homeCode: 'ar', awayTeam: 'Poland', awayCode: 'pl', homeScore: 3, awayScore: 1, stage: 'Group C', minute: 'FT', venue: 'Lusail Stadium' },
  { id: 'wc-f-10', homeTeam: 'France', homeCode: 'fr', awayTeam: 'Australia', awayCode: 'au', homeScore: 2, awayScore: 0, stage: 'Group D', minute: 'FT', venue: 'Al Janoub Stadium' },
  { id: 'wc-f-11', homeTeam: 'Denmark', homeCode: 'dk', awayTeam: 'Tunisia', awayCode: 'tn', homeScore: 1, awayScore: 1, stage: 'Group D', minute: 'FT', venue: 'Education City Stadium' },
  { id: 'wc-f-12', homeTeam: 'France', homeCode: 'fr', awayTeam: 'Denmark', awayCode: 'dk', homeScore: 2, awayScore: 1, stage: 'Group D', minute: 'FT', venue: 'Al Bayt Stadium' },
  { id: 'wc-f-13', homeTeam: 'Spain', homeCode: 'es', awayTeam: 'Japan', awayCode: 'jp', homeScore: 1, awayScore: 0, stage: 'Group E', minute: 'FT', venue: 'Khalifa International Stadium' },
  { id: 'wc-f-14', homeTeam: 'Germany', homeCode: 'de', awayTeam: 'Costa Rica', awayCode: 'cr', homeScore: 2, awayScore: 0, stage: 'Group E', minute: 'FT', venue: 'Al Bayt Stadium' },
  { id: 'wc-f-15', homeTeam: 'Spain', homeCode: 'es', awayTeam: 'Germany', awayCode: 'de', homeScore: 2, awayScore: 1, stage: 'Group E', minute: 'FT', venue: 'Al Bayt Stadium' },
  { id: 'wc-f-16', homeTeam: 'Morocco', homeCode: 'ma', awayTeam: 'Belgium', awayCode: 'be', homeScore: 2, awayScore: 1, stage: 'Group F', minute: 'FT', venue: 'Al Thumama Stadium' },
  { id: 'wc-f-17', homeTeam: 'Croatia', homeCode: 'hr', awayTeam: 'Canada', awayCode: 'ca', homeScore: 2, awayScore: 0, stage: 'Group F', minute: 'FT', venue: 'Khalifa International Stadium' },
  { id: 'wc-f-18', homeTeam: 'Morocco', homeCode: 'ma', awayTeam: 'Croatia', awayCode: 'hr', homeScore: 1, awayScore: 0, stage: 'Group F', minute: 'FT', venue: 'Ahmed bin Ali Stadium' },
  { id: 'wc-f-19', homeTeam: 'Brazil', homeCode: 'br', awayTeam: 'Switzerland', awayCode: 'ch', homeScore: 2, awayScore: 0, stage: 'Group G', minute: 'FT', venue: 'Stadium 974' },
  { id: 'wc-f-20', homeTeam: 'Serbia', homeCode: 'rs', awayTeam: 'Cameroon', awayCode: 'cm', homeScore: 1, awayScore: 1, stage: 'Group G', minute: 'FT', venue: 'Al Janoub Stadium' },
  { id: 'wc-f-21', homeTeam: 'Brazil', homeCode: 'br', awayTeam: 'Cameroon', awayCode: 'cm', homeScore: 2, awayScore: 1, stage: 'Group G', minute: 'FT', venue: 'Lusail Stadium' },
  { id: 'wc-f-22', homeTeam: 'Portugal', homeCode: 'pt', awayTeam: 'Uruguay', awayCode: 'uy', homeScore: 2, awayScore: 1, stage: 'Group H', minute: 'FT', venue: 'Lusail Stadium' },
  { id: 'wc-f-23', homeTeam: 'South Korea', homeCode: 'kr', awayTeam: 'Ghana', awayCode: 'gh', homeScore: 1, awayScore: 0, stage: 'Group H', minute: 'FT', venue: 'Education City Stadium' },
  { id: 'wc-f-24', homeTeam: 'Portugal', homeCode: 'pt', awayTeam: 'Ghana', awayCode: 'gh', homeScore: 3, awayScore: 1, stage: 'Group H', minute: 'FT', venue: 'Stadium 974' },
];

function Flag({ code, name }: { code: string; name: string }) {
  return <img src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`} alt={name} className="w-14 h-10 object-cover rounded-md shadow-md" />;
}

export default function WorldCupMatchCenter() {
  const [activeTab, setActiveTab] = useState<Tab>('LIVE');
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWorldCup()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = useMemo<WorldCupMatchCard[]>(() => {
    if (!data) return [];

    if (activeTab === 'LIVE') {
      return data.featuredMatches.map((match, index) => ({
        id: `live-${index}`,
        homeTeam: match.homeTeam.name,
        homeCode: match.homeTeam.code,
        awayTeam: match.awayTeam.name,
        awayCode: match.awayTeam.code,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        stage: data.stage,
        minute: `${match.minute}'`,
        live: true,
      }));
    }

    if (activeTab === 'UPCOMING') {
      return data.fixtures.map((fixture, index) => ({
        id: `upcoming-${index}`,
        homeTeam: fixture.homeTeam,
        homeCode: fixture.homeCode,
        awayTeam: fixture.awayTeam,
        awayCode: fixture.awayCode,
        homeScore: null,
        awayScore: null,
        stage: fixture.group,
        minute: `${fixture.date} • ${fixture.time}`,
        venue: fixture.venue,
        live: false,
      }));
    }

    return FINISHED_MATCHES;
  }, [activeTab, data]);

  if (loading) return <PageLoader />;
  if (!data) return <div className="py-24 text-center text-zinc-500">Failed to load World Cup Match Center.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-32 space-y-10">
      <section className="glass-card rounded-3xl p-8 md:p-12 border border-white/5">
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Countries Only</span>
        <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
          World Cup <span className="text-primary">Match Center</span>
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          A dedicated World Cup control room for nations only. Live games, upcoming fixtures, and finished results stay separate from the club match center.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {(['LIVE', 'UPCOMING', 'FINISHED'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-primary text-black shadow-[0_0_24px_rgba(114,220,255,0.24)]'
                  : 'border border-white/10 text-zinc-400 hover:text-white hover:border-primary/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map((match) => (
          <div key={match.id} className="glass-card rounded-3xl p-6 border border-white/5 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-primary">{match.stage}</div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{match.minute}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activeTab === 'LIVE' ? 'bg-secondary/15 text-secondary' : 'bg-white/5 text-zinc-400'}`}>
                {activeTab === 'LIVE' ? 'Live' : activeTab === 'UPCOMING' ? 'Scheduled' : 'Finished'}
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <Link to={`/tactics?view=country&team=${encodeURIComponent(match.homeTeam)}`} className="flex items-center gap-3 min-w-0 hover:text-primary transition-colors">
                <Flag code={match.homeCode} name={match.homeTeam} />
                <span className="font-black uppercase tracking-tight truncate">{match.homeTeam}</span>
              </Link>

              <div className="text-center">
                <div className="text-4xl font-black font-headline italic">
                  {match.homeScore ?? '-'}
                  <span className="mx-2 text-primary">:</span>
                  {match.awayScore ?? '-'}
                </div>
                {match.venue && <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{match.venue}</div>}
              </div>

              <Link to={`/tactics?view=country&team=${encodeURIComponent(match.awayTeam)}`} className="flex items-center justify-end gap-3 min-w-0 hover:text-primary transition-colors">
                <span className="font-black uppercase tracking-tight truncate">{match.awayTeam}</span>
                <Flag code={match.awayCode} name={match.awayTeam} />
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/simulation?home=${encodeURIComponent(match.homeTeam)}&away=${encodeURIComponent(match.awayTeam)}&homeCode=${encodeURIComponent(match.homeCode)}&awayCode=${encodeURIComponent(match.awayCode)}&isWorldCup=true&knockout=false`}
                className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-colors"
              >
                Open Match Feed
              </Link>
              <Link
                to={`/tactics?view=country&team=${encodeURIComponent(match.homeTeam)}`}
                className="px-4 py-2 rounded-full border border-white/10 text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:border-primary/20 hover:text-white transition-colors"
              >
                View {match.homeTeam}
              </Link>
              <Link
                to={`/tactics?view=country&team=${encodeURIComponent(match.awayTeam)}`}
                className="px-4 py-2 rounded-full border border-white/10 text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:border-primary/20 hover:text-white transition-colors"
              >
                View {match.awayTeam}
              </Link>
              {activeTab === 'FINISHED' && (
                <Link
                  to={`/simulation?home=${encodeURIComponent(match.homeTeam)}&away=${encodeURIComponent(match.awayTeam)}&homeCode=${encodeURIComponent(match.homeCode)}&awayCode=${encodeURIComponent(match.awayCode)}&isWorldCup=true&analysis=true&knockout=false`}
                  className="px-4 py-2 rounded-full border border-secondary/20 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest hover:bg-secondary/20 transition-colors"
                >
                  View Analysis
                </Link>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
