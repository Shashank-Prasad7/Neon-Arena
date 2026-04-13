import type { Player } from '../../types';
import { Link } from 'react-router-dom';

interface Props {
  players: Player[];
  onRemove: (id: number) => void;
  onClose: () => void;
}

const STAT_KEYS: Array<{ key: keyof Player['stats']; label: string }> = [
  { key: 'pace', label: 'Pace' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'passing', label: 'Passing' },
  { key: 'dribbling', label: 'Dribbling' },
  { key: 'defending', label: 'Defending' },
  { key: 'physical', label: 'Physical' },
];

export default function CompareDrawer({ players, onRemove, onClose }: Props) {
  const [p1, p2] = players;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up">
      <div className="glass-card border-t border-primary/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[60vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline font-black text-lg uppercase tracking-tighter italic flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full" />
              Player Comparison
            </h3>
            <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="grid grid-cols-[1fr_80px_1fr] gap-4">
            {/* Player 1 */}
            <div className="text-center">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-headline font-bold uppercase text-sm">{p1.name}</h4>
                <button onClick={() => onRemove(p1.id)} className="text-xs text-zinc-600 hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <p className="text-xs text-zinc-500 uppercase mb-3">{p1.club}</p>
              <div className="text-4xl font-black font-headline text-primary italic">{p1.rating}</div>
            </div>

            {/* Labels */}
            <div className="flex flex-col justify-end gap-3 pb-1">
              {STAT_KEYS.map((s) => (
                <div key={s.key} className="text-center text-[10px] text-zinc-500 uppercase tracking-widest font-bold h-6 flex items-center justify-center">
                  {s.label}
                </div>
              ))}
            </div>

            {/* Player 2 */}
            {p2 ? (
              <div className="text-center">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => onRemove(p2.id)} className="text-xs text-zinc-600 hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                  <h4 className="font-headline font-bold uppercase text-sm">{p2.name}</h4>
                </div>
                <p className="text-xs text-zinc-500 uppercase mb-3">{p2.club}</p>
                <div className="text-4xl font-black font-headline text-secondary italic">{p2.rating}</div>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                <span className="material-symbols-outlined mb-1">add_circle</span>
                <p className="text-xs uppercase">Add player</p>
              </div>
            )}
          </div>

          {/* Stat bars */}
          {p2 && (
            <div className="mt-6 space-y-3">
              {STAT_KEYS.map((s) => {
                const v1 = p1.stats[s.key];
                const v2 = p2.stats[s.key];
                const winner1 = v1 > v2;
                const winner2 = v2 > v1;
                return (
                  <div key={s.key} className="grid grid-cols-[1fr_60px_1fr] gap-2 items-center">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-bold text-sm ${winner1 ? 'text-primary' : 'text-on-surface-variant'}`}>{v1}</span>
                      <div className="h-2 rounded-full bg-surface-container-highest overflow-hidden w-full max-w-[120px]">
                        <div className={`h-full rounded-full ${winner1 ? 'bg-primary' : 'bg-zinc-600'}`} style={{ width: `${v1}%` }} />
                      </div>
                    </div>
                    <div className="text-center text-[10px] text-zinc-500 uppercase font-bold">{s.label}</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-surface-container-highest overflow-hidden w-full max-w-[120px]">
                        <div className={`h-full rounded-full ${winner2 ? 'bg-secondary' : 'bg-zinc-600'}`} style={{ width: `${v2}%` }} />
                      </div>
                      <span className={`font-bold text-sm ${winner2 ? 'text-secondary' : 'text-on-surface-variant'}`}>{v2}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-4 mt-6 justify-center">
            {players.map((p) => (
              <Link
                key={p.id}
                to={`/players/${p.id}`}
                className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
              >
                Full Profile: {p.shortName}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
