import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/matches', label: 'Matches' },
  { to: '/players', label: 'Players' },
  { to: '/worldcup', label: 'World Cup' },
  { to: '/tactics', label: 'Tactics' },
  { to: '/tournaments', label: 'Tournaments' },
];

export default function Header() {
  const { pathname } = useLocation();
  const { user, logout, openAuthModal } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = [
    { label: 'World Cup Hub', to: '/worldcup', keywords: ['w', 'world', 'cup', 'international'] },
    { label: 'Live Matches', to: '/matches', keywords: ['m', 'match', 'live', 'score'] },
    { label: 'Player Discovery', to: '/players', keywords: ['p', 'player', 'scout'] },
    { label: 'Tournament Center', to: '/tournaments', keywords: ['tournament', 'career', 'champions', 'league', 'world cup run'] },
    { label: 'Mbappe (Player)', to: '/players/7', keywords: ['mbappe', 'kylian'] },
    { label: 'Messi (Player)', to: '/players/10', keywords: ['messi', 'lionel'] }
  ].filter(item => searchQuery.length > 0 && item.keywords.some(k => k.includes(searchQuery.toLowerCase())));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/6 bg-[linear-gradient(180deg,rgba(5,9,18,0.84),rgba(10,12,18,0.54))] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(114,220,255,0.1),0_18px_40px_-24px_rgba(0,0,0,0.75)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-primary/30 bg-[linear-gradient(145deg,rgba(16,26,46,0.95),rgba(8,12,20,0.7))] flex items-center justify-center shadow-[0_0_20px_rgba(114,220,255,0.12)]">
          <span className="material-symbols-outlined text-primary text-xl">sports_soccer</span>
        </div>
        <Link
          to="/"
          className="text-xl font-black italic text-sky-300 drop-shadow-[0_0_8px_rgba(0,210,255,0.45)] font-headline tracking-[-0.08em] uppercase"
        >
          NEON ARENA
        </Link>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-3 rounded-full border border-white/6 bg-black/20 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`rounded-full px-4 py-2 font-headline font-bold tracking-[0.16em] uppercase text-[11px] hover:text-white transition-all duration-300 ${
              pathname === link.to ? 'bg-primary/12 text-sky-300 shadow-[0_0_18px_rgba(114,220,255,0.16)]' : 'text-zinc-500'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3 relative">
        <div className={`flex flex-col transition-all duration-500 ease-in-out hidden md:flex absolute top-0 right-10 ${isSearchOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
          <input 
            type="text" 
            placeholder="Search players, teams, matches..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-highest border border-primary/30 text-white text-sm rounded-full px-4 py-1.5 outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,210,255,0.3)] transition-all placeholder:text-zinc-500 font-body relative z-20"
          />
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-highest border border-outline-variant rounded-xl shadow-2xl overflow-hidden z-20">
              {searchResults.map((res, i) => (
                <Link 
                  key={i} 
                  to={res.to} 
                  onClick={() => setIsSearchOpen(false)}
                  className="block px-4 py-3 hover:bg-primary/20 text-sm font-bold text-zinc-300 hover:text-white transition-colors border-b border-white/5 last:border-0"
                >
                  {res.label}
                </Link>
              ))}
            </div>
          )}
          {searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-highest border border-outline-variant rounded-xl shadow-2xl p-4 text-center z-20">
               <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">No Results</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-black/20 text-sky-400 hover:text-white hover:border-primary/25 transition-all duration-300 active:scale-95 z-10 ${isSearchOpen ? 'rotate-90' : 'rotate-0'}`}
        >
          <span className="material-symbols-outlined">{isSearchOpen ? 'close' : 'search'}</span>
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm font-bold text-on-surface-variant">{user.name}</span>
            <button
              onClick={logout}
              className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>
        ) : (
            <button
              onClick={() => openAuthModal('login')}
            className="hidden md:flex items-center gap-2 px-4 py-2 border border-primary/30 text-primary text-xs font-headline font-bold uppercase tracking-[0.16em] rounded-full hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(114,220,255,0.15)] transition-all"
          >
            Sign In
          </button>
        )}
      </div>
      </div>
    </header>
  );
}
