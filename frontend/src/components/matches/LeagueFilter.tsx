const LEAGUES = [
  { code: 'CL', label: 'Champions League' },
  { code: 'PL', label: 'Premier League' },
  { code: 'PD', label: 'La Liga' },
  { code: 'BL1', label: 'Bundesliga' },
  { code: 'FL1', label: 'Ligue 1' },
  { code: 'SA', label: 'Serie A' },
];

interface Props {
  active: string;
  onChange: (code: string) => void;
}

export default function LeagueFilter({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
      {LEAGUES.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`flex-none px-4 py-2 rounded-full border text-xs font-label uppercase tracking-wider transition-all ${
            active === l.code
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
