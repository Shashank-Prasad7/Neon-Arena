import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import type { WorldCupData, Group } from '../types';
import { PageLoader } from '../components/ui/LoadingSpinner';

function FlagImg({ code, name, size = 'w-8 h-8' }: { code: string; name: string; size?: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt={name}
      className={`${size} object-cover rounded-sm`}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

function GroupTable({ group }: { group: Group }) {
  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden border border-white/5">
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
        <h3 className="font-black uppercase tracking-tighter italic text-lg">{group.name}</h3>
      </div>
      <table className="w-full text-left">
        <thead className="bg-black/20 text-zinc-500 text-[10px] uppercase font-black tracking-widest">
          <tr>
            <th className="px-4 py-3">Pos / Team</th>
            <th className="px-3 py-3 text-center">P</th>
            <th className="px-3 py-3 text-center">W</th>
            <th className="px-3 py-3 text-center">D</th>
            <th className="px-3 py-3 text-center">L</th>
            <th className="px-4 py-3 text-right">PTS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {group.teams.map((team, i) => (
            <tr key={team.name} className={`hover:bg-primary/5 transition-colors ${!team.qualified && i >= 2 ? 'opacity-60' : ''}`}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`font-black italic text-sm ${i === 0 ? 'text-secondary' : i === 1 ? 'text-primary' : 'text-zinc-600'}`}>{i + 1}</span>
                  <FlagImg code={team.code} name={team.name} size="w-6 h-4" />
                  <span className="font-bold uppercase tracking-tight text-sm">{team.name}</span>
                </div>
              </td>
              <td className="px-3 py-3 text-center font-medium text-zinc-400 text-sm">{team.P}</td>
              <td className="px-3 py-3 text-center font-medium text-zinc-400 text-sm">{team.W}</td>
              <td className="px-3 py-3 text-center font-medium text-zinc-400 text-sm">{team.D}</td>
              <td className="px-3 py-3 text-center font-medium text-zinc-400 text-sm">{team.L}</td>
              <td className={`px-4 py-3 text-right font-black text-lg ${i === 0 ? 'text-secondary' : 'text-white'}`}>{team.Pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WorldCupHub() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(0);
  const [isBracketOpen, setIsBracketOpen] = useState(false);
  const [currentFeaturedIdx, setCurrentFeaturedIdx] = useState(0);

  useEffect(() => {
    api.getWorldCup()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  // Interval for featured matches slider
  useEffect(() => {
    if (!data || data.featuredMatches.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentFeaturedIdx((prev) => (prev + 1) % data.featuredMatches.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [data]);

  if (loading) return <PageLoader />;
  if (!data) return <div className="text-center py-20 text-on-surface-variant">Failed to load World Cup data.</div>;

  const { featuredMatches, groups, fixtures, nations } = data;
  const fm = featuredMatches[currentFeaturedIdx];
  const canSlideFeatured = featuredMatches.length > 1;

  const goPrevFeatured = () => {
    setCurrentFeaturedIdx((prev) => (prev - 1 + featuredMatches.length) % featuredMatches.length);
  };

  const goNextFeatured = () => {
    setCurrentFeaturedIdx((prev) => (prev + 1) % featuredMatches.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-32 space-y-20">
      {/* Hero */}
      <section className="relative h-[500px] flex flex-col justify-end overflow-hidden rounded-xl bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(114,220,255,0.15) 0%, transparent 70%)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="relative z-10 p-8 md:p-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary font-headline text-xs font-bold uppercase tracking-widest">{data.stage}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] italic">
            FIFA WORLD<br /><span className="text-primary drop-shadow-[0_0_15px_rgba(114,220,255,0.4)]">CUP 2026</span>
          </h1>
          <p className="max-w-xl text-zinc-400 font-body font-medium text-lg leading-relaxed">
            Experience the pinnacle of football in high-definition data. Every pulse, every goal, every permutation.
          </p>
          <div className="pt-4 flex gap-4 flex-wrap">
             {/* Dynamic Watch Live based on center HUD match */}
            <Link 
              to={`/simulation?home=${encodeURIComponent(fm.homeTeam.name)}&away=${encodeURIComponent(fm.awayTeam.name)}&homeCode=${encodeURIComponent(fm.homeTeam.code)}&awayCode=${encodeURIComponent(fm.awayTeam.code)}&isWorldCup=true`} 
              className="px-8 py-4 bg-primary text-on-primary-container font-black uppercase tracking-tighter rounded-lg hover:shadow-[0_0_25px_rgba(0,210,255,0.5)] transition-all active:scale-95 text-center"
            >
              Watch {fm.homeTeam.name} vs {fm.awayTeam.name}
            </Link>
            <Link to="/worldcup/matches" className="px-8 py-4 bg-surface-container-high border border-outline-variant text-white font-black uppercase tracking-tighter rounded-lg hover:bg-surface-variant transition-all text-center">
              Match Center
            </Link>
          </div>
        </div>
      </section>

      {/* Live Match HUD Slider + Permutations */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-xl p-8 border border-primary/10 relative overflow-hidden group min-h-[400px]">
          <div className="flex justify-between items-center mb-8 relative z-20">
            <div className="flex items-center gap-2">
              <span className="text-primary font-black uppercase tracking-widest text-[10px]">Live Now</span>
              {canSlideFeatured && (
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={goPrevFeatured}
                    className="w-9 h-9 rounded-full border border-white/10 bg-black/30 text-white transition-all hover:border-primary/40 hover:text-primary"
                    aria-label="Previous live match"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <button
                    onClick={goNextFeatured}
                    className="w-9 h-9 rounded-full border border-white/10 bg-black/30 text-white transition-all hover:border-primary/40 hover:text-primary"
                    aria-label="Next live match"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              )}
              <div className="flex gap-1">
                {featuredMatches.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentFeaturedIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentFeaturedIdx ? 'bg-primary w-4' : 'bg-white/20'}`}
                  />
                ))}
              </div>
            </div>
            <span className="text-zinc-600 font-black italic text-xs uppercase tracking-tighter select-none">Live Multicast Pipeline</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 transition-all duration-700 animate-fade-in" key={fm.homeTeam.name}>
            {/* Home */}
            <div className="flex flex-col items-center gap-4 hover:scale-105 transition-transform duration-500">
              <div className="w-24 h-24 rounded-full bg-surface-container-highest p-2 border-2 border-primary shadow-[0_0_20px_rgba(0,210,255,0.2)] overflow-hidden flex items-center justify-center">
                <FlagImg code={fm.homeTeam.code} name={fm.homeTeam.name} size="w-full h-full" />
              </div>
              <span className="text-2xl font-bold uppercase tracking-tighter italic">{fm.homeTeam.name}</span>
            </div>
            {/* Score */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-6xl font-black font-headline flex items-center gap-4">
                <span className="text-white">{fm.homeScore}</span>
                <span className="text-zinc-700 text-4xl">:</span>
                <span className="text-secondary text-glow-secondary">{fm.awayScore}</span>
              </div>
              <span className="px-4 py-1 bg-zinc-900 rounded-full text-zinc-500 text-xs font-bold uppercase tracking-widest">{fm.minute}' Minute</span>
            </div>
            {/* Away */}
            <div className="flex flex-col items-center gap-4 hover:scale-105 transition-transform duration-500">
              <div className="w-24 h-24 rounded-full bg-surface-container-highest p-2 border-2 border-zinc-800 overflow-hidden flex items-center justify-center">
                <FlagImg code={fm.awayTeam.code} name={fm.awayTeam.name} size="w-full h-full" />
              </div>
              <span className="text-2xl font-bold uppercase tracking-tighter italic">{fm.awayTeam.name}</span>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 animate-fade-in" key={`stats-${fm.homeTeam.name}`}>
            {Object.entries(fm.stats).map(([key, val]) => {
              const labels: Record<string, string> = { liveWinPct: 'Live Win %', expectedGoals: 'Expected Goals', groupRank: 'Group Rank', knockoutProb: 'Knockout Prob.' };
              return (
                <div key={key} className="bg-black/40 p-4 rounded-lg border border-white/5">
                  <span className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">{labels[key] || key}</span>
                  <span className="text-primary text-2xl font-black italic">{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Permutations */}
        <div className="bg-surface-container-low rounded-xl p-6 border border-white/5 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tighter flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">swap_horiz</span>
              Live Tracking
            </h3>
            <div className="space-y-4" key={`perm-${fm.homeTeam.name}`}>
              {fm.permutations.map((p, i) => {
                const border = p.type === 'secondary' ? 'border-secondary' : p.type === 'primary' ? 'border-primary' : 'border-zinc-700';
                return (
                  <div key={i} className={`p-4 bg-zinc-900/50 rounded-lg border-l-4 ${border} animate-fade-in`}>
                    <p className="text-sm font-body text-zinc-300 leading-relaxed">{p.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
             <Link 
                to={`/simulation?home=${encodeURIComponent(fm.homeTeam.name)}&away=${encodeURIComponent(fm.awayTeam.name)}&homeCode=${encodeURIComponent(fm.homeTeam.code)}&awayCode=${encodeURIComponent(fm.awayTeam.code)}&isWorldCup=true`} 
                className="w-full py-3 bg-secondary/10 text-secondary border border-secondary/20 rounded font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-secondary/20 transition-all"
             >
                <span className="material-symbols-outlined text-sm">play_circle</span>
                Watch {fm.homeTeam.name} vs {fm.awayTeam.name} Feed
             </Link>
             <button onClick={() => setIsBracketOpen(true)} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 rounded hover:bg-primary/10 transition-colors">
               View Full Bracket
             </button>
          </div>
        </div>
      </section>

      {/* Group Standings */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
          {groups.map((g, i) => (
            <button
              key={g.name}
              onClick={() => setActiveGroup(i)}
              className={`flex-none px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                activeGroup === i
                  ? 'bg-primary text-on-primary-container'
                  : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
        <GroupTable group={groups[activeGroup]} />
      </section>

      {/* Fixtures */}
      <section className="space-y-6">
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">Upcoming Fixtures</h2>
        <div className="bg-surface-container-low rounded-xl p-6 border border-white/5 relative">
          <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
            {fixtures.map((f, i) => (
              <div key={i} className={`relative pl-12 ${i > 2 ? 'opacity-60' : ''}`}>
                <div className={`absolute left-0 top-1 w-10 h-10 rounded-full bg-zinc-950 border-2 ${i === 0 ? 'border-primary' : 'border-zinc-800'} flex items-center justify-center z-10`}>
                  <span className={`material-symbols-outlined text-sm ${i === 0 ? 'text-primary' : 'text-zinc-500'}`}>event</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{f.date} • {f.time}</span>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <FlagImg code={f.homeCode} name={f.homeTeam} size="w-5 h-3" />
                      <span className="font-bold uppercase tracking-tight">{f.homeTeam}</span>
                    </div>
                    <span className="text-zinc-700 font-black text-sm">VS</span>
                    <div className="flex items-center gap-2">
                      <FlagImg code={f.awayCode} name={f.awayTeam} size="w-5 h-3" />
                      <span className="font-bold uppercase tracking-tight">{f.awayTeam}</span>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 mt-1">{f.venue} • {f.group}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nations Grid */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">Nations Arena</h2>
            <p className="text-zinc-500 font-body mt-1">Click to reveal tactical squads and heatmaps.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {nations.map((nation) => (
            <Link
              key={nation.name}
              to={`/tactics?view=country&team=${encodeURIComponent(nation.name)}`}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer hover:shadow-[0_0_30px_rgba(114,220,255,0.2)] transition-all duration-500 bg-surface-container-low border border-outline-variant/20"
            >
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <FlagImg code={nation.code} name={nation.name} size="w-full h-auto" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary block">{nation.group}</span>
                <h4 className="text-lg font-black uppercase tracking-tight italic">{nation.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bracket Modal */}
      {isBracketOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-container-highest border border-outline-variant rounded-2xl w-full max-w-4xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsBracketOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <h2 className="text-3xl font-black italic uppercase mb-8 text-center text-glow-primary text-primary">Knockout Stage Bracket</h2>
            
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Round of 16 */}
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-low border border-white/10 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2"><FlagImg code="br" name="Brazil" size="w-4 h-3"/> Brazil</span><span>2</span></div>
                  <div className="flex justify-between items-center text-zinc-500"><span className="font-bold flex items-center gap-2"><FlagImg code="kr" name="South Korea" size="w-4 h-3"/> South Korea</span><span>0</span></div>
                </div>
                <div className="p-4 bg-surface-container-low border border-white/10 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-center text-zinc-500"><span className="font-bold flex items-center gap-2"><FlagImg code="jp" name="Japan" size="w-4 h-3"/> Japan</span><span>1 (1)</span></div>
                  <div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2"><FlagImg code="hr" name="Croatia" size="w-4 h-3"/> Croatia</span><span>1 (3)</span></div>
                </div>
              </div>
              
              {/* Quarter-Finals */}
              <div className="space-y-12">
                <div className="p-4 bg-surface-container-low border-2 border-primary/30 rounded-lg flex flex-col gap-2 relative">
                  <div className="absolute top-1/2 -left-4 w-4 h-0.5 bg-white/20"></div>
                  <div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2"><FlagImg code="br" name="Brazil" size="w-4 h-3"/> Brazil</span><span>1</span></div>
                  <div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2 text-primary"><FlagImg code="hr" name="Croatia" size="w-4 h-3"/> Croatia</span><span className="text-primary italic">1 (4)</span></div>
                </div>
              </div>
              
              {/* Semi-Finals / Final */}
              <div className="space-y-4 flex flex-col justify-center h-full">
                <div className="p-4 bg-surface-container border-2 border-secondary/50 rounded-lg flex flex-col gap-2 shadow-[0_0_20px_rgba(47,248,1,0.2)]">
                  <div className="text-[10px] uppercase text-secondary font-black tracking-widest mb-1 text-center">Semi-Final Matchup</div>
                  <div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2"><FlagImg code="ar" name="Argentina" size="w-4 h-3"/> Argentina</span><span>3</span></div>
                  <div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2"><FlagImg code="hr" name="Croatia" size="w-4 h-3"/> Croatia</span><span>0</span></div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-zinc-500 uppercase tracking-widest mt-8 font-black">* Mock Bracket Simulation Data</p>
          </div>
        </div>
      )}
    </div>
  );
}
