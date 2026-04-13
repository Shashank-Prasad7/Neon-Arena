import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', glow = false, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl ${glow ? 'neon-glow-primary' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
