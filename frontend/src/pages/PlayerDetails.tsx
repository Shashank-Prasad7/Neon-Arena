import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../services/api';
import type { Player } from '../types';
import { PageLoader } from '../components/ui/LoadingSpinner';

function getPreferredFoot(player: Player) {
  const source = `${player.name} ${player.shortName}`.toLowerCase();
  return /marco|lucas|kai|salah|lionel|angel|rafael/.test(source) ? 'Left' : 'Right';
}

function buildCareerHighlights(player: Player) {
  if (player.careerHighlights.length > 0) {
    return player.careerHighlights;
  }

  const appearances = `${player.seasonStats.matches}+ senior appearances for ${player.club}`;
  const contributionTotal = player.seasonStats.goals + player.seasonStats.assists;
  const creativeMetric = player.position === 'Goalkeeper'
    ? `${player.seasonStats.tackles} defensive interventions this campaign`
    : `${contributionTotal} goal contributions in all competitions`;
  const standoutTrait = [
    `Rated ${player.rating} overall with elite ${player.stats.pace} pace and ${player.stats.dribbling} dribbling`,
    `${player.seasonStats.passAccuracy}% pass accuracy while leading ${player.club}'s build-up phases`,
    `${player.nationality} international trusted in high-pressure fixtures`,
    `${player.number} shirt holder and regular starter at ${player.club}`,
  ];

  return [
    appearances,
    creativeMetric,
    ...standoutTrait,
  ];
}

function buildMediaItems(player: Player) {
  return [
    {
      label: 'Match Winner',
      title: 'Incredible Solo Performance',
      img: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=900&fit=crop',
      type: 'video' as const,
    },
    {
      label: 'Feature Story',
      title: `${player.shortName} driving ${player.club} forward`,
      img: player.image || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=900&fit=crop',
      type: 'image' as const,
    },
    {
      label: 'Season Review',
      title: `All ${player.seasonStats.goals} Goals`,
      img: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=900&fit=crop',
      type: 'video' as const,
    },
  ];
}

function HexRadar({ stats }: { stats: Player['stats'] }) {
  const cx = 140, cy = 140, r = 100;
  const labels = ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical'];
  const values = [stats.pace, stats.shooting, stats.passing, stats.dribbling, stats.defending, stats.physical];

  function polarToXY(angle: number, radius: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const gridLevels = [20, 40, 60, 80, 100];
  const angles = [0, 60, 120, 180, 240, 300];

  const dataPoints = values.map((v, i) => polarToXY(angles[i], (v / 100) * r));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-[320px] mx-auto">
      {/* Grid hexagons */}
      {gridLevels.map((level) => {
        const pts = angles.map((a) => {
          const p = polarToXY(a, (level / 100) * r);
          return `${p.x},${p.y}`;
        });
        return (
          <polygon
            key={level}
            points={pts.join(' ')}
            fill="none"
            stroke="rgba(114,220,255,0.15)"
            strokeWidth="1"
          />
        );
      })}
      {/* Axis lines */}
      {angles.map((angle, i) => {
        const end = polarToXY(angle, r);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(114,220,255,0.1)" strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <path d={dataPath} fill="rgba(114,220,255,0.15)" stroke="#72dcff" strokeWidth="2" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#72dcff" />
      ))}
      {/* Labels */}
      {labels.map((label, i) => {
        const labelPos = polarToXY(angles[i], r + 22);
        return (
          <g key={i}>
            <text x={labelPos.x} y={labelPos.y - 4} textAnchor="middle" fill="#adaaab" fontSize="9" fontFamily="Manrope" fontWeight="700" letterSpacing="1">
              {label.toUpperCase()}
            </text>
            <text x={labelPos.x} y={labelPos.y + 10} textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="Space Grotesk" fontWeight="900">
              {values[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function PlayerDetails() {
  const { id } = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'highlights' | 'market' | 'media'>('highlights');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getPlayer(id)
      .then((res) => setPlayer(res.data.player))
      .catch(() => setPlayer(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!player) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-on-surface-variant">
      <span className="material-symbols-outlined text-5xl mb-4">person_off</span>
      <p className="font-headline text-xl uppercase">Player not found</p>
      <Link to="/players" className="mt-4 text-primary hover:underline">Back to Players</Link>
    </div>
  );

  const maxFormScore = Math.max(...player.recentForm.map((f) => f.score));
  const careerHighlights = buildCareerHighlights(player);
  const mediaItems = buildMediaItems(player);
  const preferredFoot = getPreferredFoot(player);

  return (
    <div className="min-h-screen pb-32">
      {/* Hero */}
      <section className="relative w-full h-[560px] md:h-[620px] flex items-end overflow-hidden">
        {/* ── Layered backgrounds ── */}
        <div className="absolute inset-0 z-0">
          {/* Base dark */}
          <div className="absolute inset-0 bg-[#07070a]" />

          {/* Stadium / pitch texture at very low opacity */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&fit=crop)` }}
          />

          {/* Country flag as large watermark — top-right, heavily blurred */}
          <div
            className="absolute -right-16 -top-8 w-[520px] h-[380px] bg-no-repeat bg-cover opacity-[0.12] blur-2xl"
            style={{
              backgroundImage: `url(https://flagcdn.com/w1280/${player.nationalityCode.toLowerCase()}.png)`,
            }}
          />

          {/* Player photo — right side, fades into background */}
          {player.image && (
            <div className="absolute right-0 bottom-0 h-full w-[55%] md:w-[48%]">
              <img
                src={player.image}
                alt={player.name}
                className="absolute right-0 bottom-0 h-full w-full object-cover object-top"
                style={{ maskImage: 'linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)' }}
              />
              {/* Darken the image slightly */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#07070a] via-[#07070a]/60 to-transparent" />
            </div>
          )}

          {/* Ghost club name typography */}
          <div className="absolute bottom-4 right-4 md:right-8 font-headline font-black italic uppercase text-[80px] md:text-[130px] leading-none text-white/[0.04] select-none pointer-events-none whitespace-nowrap tracking-tighter">
            {player.club.split(' ').slice(-1)[0]}
          </div>

          {/* Primary color glow bottom-left */}
          <div className="absolute -left-20 bottom-0 w-80 h-64 bg-primary/10 blur-[80px]" />

          {/* Strong gradient from bottom to make text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07070a] via-[#07070a]/50 to-transparent" />
        </div>

        {/* ── Foreground content ── */}
        <div className="relative z-10 container mx-auto px-6 pb-12 w-full">
          {/* Back link */}
          <Link
            to="/players"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary font-headline text-xs font-black uppercase tracking-widest transition-colors mb-8"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            All Players
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="flex flex-col gap-3 max-w-xl">
            {/* Badges row */}
            <div className="flex items-center gap-3 flex-wrap">
              {player.badge && (
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase border border-secondary/20 shadow-[0_0_10px_rgba(47,248,1,0.2)]">
                  {player.badge}
                </span>
              )}
              <span className="text-zinc-500 font-headline text-sm uppercase tracking-widest font-black">#{player.number}</span>
              <span className="px-2.5 py-0.5 bg-white/5 border border-white/8 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {player.position}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-5xl md:text-7xl font-black italic uppercase font-headline tracking-tighter leading-[0.92] text-glow-primary">
              {player.name.split(' ').map((word, i, arr) => (
                <span key={i} className={i === arr.length - 1 ? 'text-primary block' : 'text-white block'}>
                  {word}
                </span>
              ))}
            </h1>

            {/* Rating pill */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <span className="material-symbols-outlined text-primary text-sm">star</span>
                <span className="text-primary font-black font-headline text-lg">{player.rating}</span>
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">OVR</span>
              </div>
              {/* Live season stats chips */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-secondary/10 border border-secondary/15 rounded-full">
                <span className="text-secondary font-black text-sm">{player.seasonStats.goals}</span>
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">G</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/8 rounded-full">
                <span className="text-white font-black text-sm">{player.seasonStats.assists}</span>
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">A</span>
              </div>
            </div>

            {/* Metadata strip */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <img
                  src={`https://flagcdn.com/w40/${player.nationalityCode.toLowerCase()}.png`}
                  alt={player.nationality}
                  className="h-5 rounded-sm shadow"
                />
                <span className="text-sm font-bold font-headline text-white uppercase">{player.nationality}</span>
              </div>
              <div className="w-px h-6 bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-zinc-500 text-base">business</span>
                <span className="text-sm font-bold font-headline text-white uppercase">{player.club}</span>
              </div>
              <div className="w-px h-6 bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-zinc-500 text-base">cake</span>
                <span className="text-sm font-bold font-headline text-white">{player.age} yrs</span>
              </div>
            </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl lg:w-[520px]">
              <div className="rounded-2xl border border-primary/20 bg-black/45 backdrop-blur-xl p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary">Attack Pulse</div>
                <div className="mt-3 text-3xl font-headline font-black italic text-white">{player.seasonStats.goals + player.seasonStats.assists}</div>
                <div className="mt-1 text-xs text-zinc-400">Combined goals and assists this season</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-secondary">Minutes Engine</div>
                <div className="mt-3 text-3xl font-headline font-black italic text-white">{Math.round(player.seasonStats.minutesPlayed / 90)}</div>
                <div className="mt-1 text-xs text-zinc-400">Full-match equivalents played</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Signal</div>
                <div className="mt-3 text-lg font-headline font-black italic text-white">{player.club}</div>
                <div className="mt-1 text-xs text-zinc-400">{player.nationality} international profile card</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hex Radar */}
          <div className="lg:col-span-5 glass-card rounded-xl p-8 border-t border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-xl uppercase tracking-widest italic flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full" />
                Core Attributes
              </h3>
              <div className="text-4xl font-black font-headline italic text-primary text-glow-primary">{player.rating}</div>
            </div>
            <HexRadar stats={player.stats} />
          </div>

          {/* Right column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Recent Form */}
            <div className="glass-card rounded-xl p-8 border-t border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-bold text-xl uppercase tracking-widest italic flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full" />
                  Recent Form
                </h3>
                <div className="flex items-center gap-2 text-secondary font-bold font-headline text-sm">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span className="text-glow-secondary">Trending High</span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {player.recentForm.map((form, i) => {
                  const heightPct = Math.round((form.score / maxFormScore) * 100);
                  return (
                    <div key={i} className="space-y-3">
                      <div className="h-28 bg-zinc-900 rounded-lg relative overflow-hidden flex flex-col justify-end p-2 group cursor-default">
                        <div
                          className="absolute inset-x-0 bottom-0 bg-secondary/30 group-hover:bg-secondary/50 transition-all"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="relative z-10 text-xs font-black text-white text-center">{form.score.toFixed(1)}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-zinc-500 uppercase block">vs {form.opponent}</span>
                        <span className={`text-[10px] font-bold uppercase ${form.goals > 0 || form.assists > 0 ? 'text-secondary' : 'text-zinc-500'}`}>
                          {form.goals > 0 ? `${form.goals}G` : ''}{form.goals > 0 && form.assists > 0 ? ' ' : ''}{form.assists > 0 ? `${form.assists}A` : ''}{form.goals === 0 && form.assists === 0 ? 'CS' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bio grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6 border-t border-white/5">
                <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">Player Profile</h4>
                <div className="space-y-3">
                  {[
                    ['Age', `${player.age} Years`],
                    ['Nationality', player.nationality],
                    ['Preferred Foot', preferredFoot],
                    ['Goals', String(player.seasonStats.goals)],
                    ['Assists', String(player.seasonStats.assists)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0">
                      <span className="text-sm text-zinc-400">{label}</span>
                      <span className="text-sm font-bold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-xl p-6 border-t border-white/5 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">monitoring</span>
                <h4 className="text-xl font-black font-headline italic text-white uppercase">Top Speed</h4>
                <p className="text-4xl font-black text-primary font-headline italic text-glow-primary leading-none mt-1">
                  {(35 + (player.stats.pace - 80) * 0.15).toFixed(1)} <span className="text-xs uppercase">km/h</span>
                </p>
                <div className="mt-4 text-xs text-zinc-500 uppercase tracking-widest">
                  Pace Rating: {player.stats.pace}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto px-6 mt-12">
        <div className="flex gap-8 border-b border-zinc-800 mb-8">
          {(['highlights', 'market', 'media'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 font-headline font-bold uppercase tracking-widest text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab === 'highlights' ? 'Career Highlights' : tab === 'market' ? 'Market Value' : 'Media'}
            </button>
          ))}
        </div>

        {activeTab === 'highlights' && (
          <div className="space-y-4">
            {careerHighlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-4 p-4 glass-card rounded-xl border-l-2 border-secondary">
                <span className="w-6 h-6 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center text-xs font-black text-secondary flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm font-body text-on-surface">{highlight}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'market' && (
          <div className="glass-card rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center border-[0.5px] border-primary/20 bg-surface-container">
            <div className="flex-1 space-y-4">
              <h4 className="text-primary text-xs uppercase font-bold tracking-widest">Estimated Value</h4>
              <p className="text-5xl md:text-7xl font-black italic tracking-tighter text-white">&euro;{(player.rating * 1.2).toFixed(1)} <span className="text-2xl text-zinc-500 uppercase">Million</span></p>
              <div className="flex items-center gap-2 text-secondary font-bold font-headline text-sm bg-secondary/10 w-fit px-3 py-1 rounded-full border border-secondary/20 shadow-[0_0_15px_rgba(47,248,1,0.2)]">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span className="text-glow-secondary">+4.2% This Season</span>
              </div>
            </div>
            
            <div className="flex-1 w-full flex gap-4 h-32 items-end justify-between px-4 border-l border-white/10 pt-4 mt-4 md:mt-0 md:pt-0">
              {[50, 58, 65, 72, 85, player.rating].map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group w-full">
                  <div className="w-full bg-surface-variant rounded-t-sm relative flex items-end overflow-hidden" style={{ height: '80px' }}>
                     <div className="w-full bg-primary/70 group-hover:bg-primary transition-all rounded-t-sm" style={{ height: `${val}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">202{i}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mediaItems.map((item, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden aspect-video group cursor-pointer bg-surface-container-low border border-outline-variant/20 shadow-lg">
                <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <span className="text-[10px] text-primary uppercase font-bold tracking-widest drop-shadow-md">{item.label}</span>
                  <h5 className="text-white font-bold text-sm mt-1 drop-shadow-lg">{item.title}</h5>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-5xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {item.type === 'image' ? 'image' : 'play_circle'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
