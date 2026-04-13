import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import type { Player } from '../../types';

export default function FeaturedPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    api.getPlayers().then((res) => {
      // Get top 10 players
      const featured = res.data.players?.slice(0, 10) || [];
      setPlayers(featured);
    }).catch(() => {});
  }, []);

  if (players.length === 0) return null;

  return (
    <section className="py-24 overflow-hidden">
      <div className="px-6 max-w-7xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <span className="text-primary font-label uppercase tracking-[0.3em] text-xs font-bold mb-2 block">The Elite List</span>
          <h2 className="text-4xl md:text-5xl font-headline font-black italic tracking-tighter uppercase leading-none">Featured Icons</h2>
        </div>
        <Link to="/players" className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
          View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      <div className="flex gap-8 overflow-x-auto px-6 hide-scrollbar pb-12 snap-x snap-mandatory">
        {players.map((player, i) => {
          const rotate = i % 2 === 0 ? 'hover:-rotate-1' : 'hover:rotate-1';
          return (
            <Link
              key={player.id}
              to={`/players/${player.id}`}
              className={`min-w-[300px] md:min-w-[380px] aspect-[3/4] glass-card rounded-2xl relative overflow-hidden group snap-center cursor-pointer transition-all duration-500 hover:scale-[1.02] ${rotate}`}
            >
              {/* Background image if available */}
              {player.image && (
                 <img src={player.image} alt={player.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-all duration-700 blur-[2px] group-hover:blur-0 scale-105 group-hover:scale-100" />
              )}
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-surface-container/90 via-surface-container/60 MixBlendMode-multiply" />
              
              {/* Number watermark */}
              <span className="text-primary font-headline font-black text-[120px] opacity-[0.1] absolute -top-6 -left-4 italic leading-none select-none drop-shadow-[0_0_10px_rgba(0,210,255,0.8)]">
                {player.number}
              </span>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                <h3 className="text-3xl font-headline font-black italic uppercase leading-none mb-1 drop-shadow-md text-white">
                  {player.name}
                </h3>
                <p className="text-secondary text-sm font-label uppercase tracking-widest font-bold mb-1">{player.position} • {player.age} yrs</p>
                <div className="flex items-center gap-2 mb-4">
                  <img src={`https://flagcdn.com/w20/${player.nationalityCode.toLowerCase()}.png`} alt={player.nationality} className="w-4" />
                  <p className="text-zinc-300 text-[10px] font-label uppercase tracking-widest font-bold">{player.club}</p>
                </div>
                
                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500 bg-surface-container-highest/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                   <div className="flex flex-col flex-1 items-center justify-center border-r border-white/5 last:border-0">
                     <span className="text-[10px] text-zinc-400 uppercase font-black">PAC</span>
                     <span className="font-black text-white text-lg">{player.stats.pace}</span>
                   </div>
                   <div className="flex flex-col flex-1 items-center justify-center border-r border-white/5 last:border-0">
                     <span className="text-[10px] text-zinc-400 uppercase font-black">SHO</span>
                     <span className="font-black text-white text-lg">{player.stats.shooting}</span>
                   </div>
                   <div className="flex flex-col flex-1 items-center justify-center border-r border-white/5 last:border-0">
                     <span className="text-[10px] text-zinc-400 uppercase font-black">PAS</span>
                     <span className="font-black text-white text-lg">{player.stats.passing}</span>
                   </div>
                   <div className="flex flex-col flex-1 items-center justify-center last:border-0">
                     <span className="text-[10px] text-zinc-400 uppercase font-black">DRI</span>
                     <span className="font-black text-white text-lg">{player.stats.dribbling}</span>
                   </div>
                </div>
              </div>

              {/* Rating badge */}
              <div className="absolute top-6 right-6 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-primary/30 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                <span className="text-2xl font-black font-headline text-primary italic leading-none">{player.rating}</span>
                <span className="text-[8px] font-bold uppercase text-primary-dim tracking-widest block text-center mt-0.5">OVR</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
