import { Link } from 'react-router-dom';
import type { Player } from '../../types';

interface Props {
  player: Player;
  isInCompare: boolean;
  onCompareToggle: () => void;
}

export default function PlayerCard({ player, isInCompare, onCompareToggle }: Props) {
  return (
    <div className={`glass-card relative flex flex-col rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${isInCompare ? 'ring-2 ring-secondary shadow-[0_0_20px_rgba(47,248,1,0.3)]' : ''}`}>
      {/* Image area */}
      <div className="relative h-56 overflow-hidden bg-surface-container-low">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(114,220,255,0.18),transparent_58%)]" />
        <div className="absolute -top-10 right-0 w-28 h-28 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -bottom-6 left-0 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-125" />
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/40 shadow-[0_0_24px_rgba(114,220,255,0.18)]">
              <img
                src={player.image}
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=111827&color=72dcff`; }}
              />
            </div>
          </div>
        </div>
        {/* Rating badge */}
        <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-primary/30 flex flex-col items-center">
          <span className="text-2xl font-black font-headline text-primary italic leading-none">{player.rating}</span>
          <span className="text-[8px] font-bold uppercase text-primary-dim tracking-widest">OVR</span>
        </div>
        {/* Badge */}
        {player.badge && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-zinc-950/60 backdrop-blur-md px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-[9px] font-bold uppercase text-secondary tracking-widest">{player.badge}</span>
          </div>
        )}
        {/* Flag */}
        <div className="absolute bottom-4 right-4">
          <img
            src={`https://flagcdn.com/w20/${player.nationalityCode.toLowerCase()}.png`}
            alt={player.nationality}
            className="h-4 rounded-sm opacity-80"
          />
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 border border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">{player.position}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{player.number}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-headline text-lg font-bold uppercase tracking-tight text-white">{player.name}</h3>
            <p className="text-zinc-500 text-xs font-body font-medium uppercase tracking-widest mt-0.5">
              {player.position} · {player.club}
            </p>
          </div>
          <Link
            to={`/players/${player.id}`}
            className="bg-surface-container-highest text-primary p-2 rounded-xl hover:bg-primary hover:text-on-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-sm">add_chart</span>
          </Link>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-zinc-900/50 p-3 rounded-xl border-b border-zinc-800">
            <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">
              {player.position === 'Goalkeeper' ? 'Saves' : player.position === 'Defender' ? 'Tackles' : 'Goals'}
            </span>
            <span className="text-xl font-black font-headline text-white leading-none">
              {player.position === 'Goalkeeper' ? player.seasonStats.tackles :
               player.position === 'Defender' ? player.seasonStats.tackles :
               player.seasonStats.goals}
            </span>
          </div>
          <div className="bg-zinc-900/50 p-3 rounded-xl border-b border-zinc-800">
            <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">
              {player.position === 'Defender' ? 'Sprints' : 'Assists'}
            </span>
            <span className="text-xl font-black font-headline text-white leading-none">
              {player.position === 'Defender' ? player.seasonStats.sprints : player.seasonStats.assists}
            </span>
          </div>
        </div>

        {/* Compare + Analytics */}
        <div className="flex items-center justify-between mt-auto">
          <label className="flex items-center cursor-pointer group/toggle">
            <div className="relative">
              <input
                type="checkbox"
                checked={isInCompare}
                onChange={onCompareToggle}
                className="sr-only peer"
              />
              <div className={`w-10 h-5 rounded-full transition-all ${isInCompare ? 'bg-secondary/20' : 'bg-zinc-800'}`} />
              <div className={`absolute left-1 top-1 w-3 h-3 rounded-full transition-all ${isInCompare ? 'translate-x-5 bg-secondary' : 'bg-zinc-500'}`} />
            </div>
            <span className="ml-3 text-[10px] font-bold uppercase text-zinc-500 group-hover/toggle:text-white transition-colors tracking-widest">Compare</span>
          </label>
          <Link
            to={`/players/${player.id}`}
            className="text-[10px] font-bold uppercase text-primary border-b border-primary/30 pb-0.5 tracking-widest hover:text-white hover:border-white transition-all"
          >
            Full Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
