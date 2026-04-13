import { Link } from 'react-router-dom';

const NAV_GROUPS = [
  {
    label: 'Platform',
    links: [
      { to: '/', label: 'Home' },
      { to: '/matches', label: 'Match Center' },
      { to: '/worldcup', label: 'World Cup Hub' },
      { to: '/worldcup/matches', label: 'WC Match Center' },
    ],
  },
  {
    label: 'Intelligence',
    links: [
      { to: '/players', label: 'Player Discovery' },
      { to: '/tactics', label: 'Tactical Hub' },
      { to: '/tournaments', label: 'Tournament Center' },
      { to: '/simulation', label: 'Live Simulation' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/5 bg-[linear-gradient(180deg,rgba(5,9,18,0.0),rgba(5,9,18,0.72))] backdrop-blur-sm">
      {/* Top glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-12">

          {/* Brand column */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl border border-primary/30 bg-black/40 flex items-center justify-center shadow-[0_0_14px_rgba(114,220,255,0.1)]">
                <span className="material-symbols-outlined text-primary text-lg">sports_soccer</span>
              </div>
              <span className="font-headline font-black italic text-lg tracking-[-0.06em] text-sky-300 uppercase drop-shadow-[0_0_8px_rgba(0,210,255,0.35)]">
                NEON ARENA
              </span>
            </div>

            <p className="text-sm text-zinc-500 font-body leading-relaxed max-w-xs">
              Elite football intelligence — live scores, tactical shapes, player scouting, and World Cup data in one cinematic control room.
            </p>

            {/* Live demo pill */}
            <a
              href="https://neon-arena-mnq0.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/8 text-secondary text-xs font-black uppercase tracking-widest hover:bg-secondary/15 hover:border-secondary/50 transition-all group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Live on Render
              <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">open_in_new</span>
            </a>
          </div>

          {/* Nav groups */}
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-600">
                {group.label}
              </span>
              <ul className="space-y-2.5">
                {group.links.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm font-medium text-zinc-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600 font-body">
            © 2026 Neon Arena · Built by{' '}
            <a
              href="https://github.com/Shashank-Prasad7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-primary transition-colors"
            >
              Shashank Prasad
            </a>
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Shashank-Prasad7/Neon-Arena"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-white transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-sm">code</span>
              GitHub
            </a>
            <a
              href="https://neon-arena-mnq0.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-primary transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              neon-arena-mnq0.onrender.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
