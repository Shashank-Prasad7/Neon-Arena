const POSITIONS = ['Forward', 'Midfielder', 'Defender', 'Winger', 'Goalkeeper'];

interface Props {
  position: string;
  onPositionChange: (pos: string) => void;
}

export default function PlayerFilters({ position, onPositionChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mr-2">Position:</span>
      <button
        onClick={() => onPositionChange('')}
        className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
          position === ''
            ? 'bg-primary/10 border border-primary/40 text-primary'
            : 'bg-surface-container-highest text-on-surface-variant hover:text-white border border-transparent'
        }`}
      >
        All
      </button>
      {POSITIONS.map((pos) => (
        <button
          key={pos}
          onClick={() => onPositionChange(pos === position ? '' : pos)}
          className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            position === pos
              ? 'bg-secondary/10 border border-secondary/20 text-secondary'
              : 'bg-surface-container-highest text-on-surface-variant hover:text-white border border-transparent'
          }`}
        >
          {pos}
          {position === pos && (
            <span className="material-symbols-outlined text-sm">close</span>
          )}
        </button>
      ))}
    </div>
  );
}
