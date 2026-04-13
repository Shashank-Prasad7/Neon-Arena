interface Props {
  label: string;
  variant?: 'primary' | 'secondary' | 'live';
  pulse?: boolean;
}

export default function NeonBadge({ label, variant = 'primary', pulse = false }: Props) {
  const styles = {
    primary: 'bg-primary/10 border-primary/30 text-primary',
    secondary: 'bg-secondary/10 border-secondary/30 text-secondary',
    live: 'bg-secondary/10 border-secondary/30 text-secondary',
  };

  const dotStyles = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    live: 'bg-secondary',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest ${styles[variant]}`}>
      {pulse && (
        <span className={`w-2 h-2 rounded-full ${dotStyles[variant]} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {label}
    </div>
  );
}
