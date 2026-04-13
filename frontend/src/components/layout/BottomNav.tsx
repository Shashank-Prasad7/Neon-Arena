import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/matches', icon: 'sports_soccer', label: 'Matches' },
  { to: '/worldcup', icon: 'public', label: 'World Cup' },
  { to: '/tactics', icon: 'tactic', label: 'Tactics' },
  { to: '/players', icon: 'explore', label: 'Players' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-[2rem] bg-[linear-gradient(180deg,rgba(5,10,18,0.82),rgba(5,10,18,0.58))] backdrop-blur-2xl z-50 flex justify-around items-center px-4 py-2 shadow-[0_0_30px_rgba(0,210,255,0.08)] border border-white/8">
      {tabs.map((tab) => {
        const isActive = pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 active:scale-110 ${
              isActive
                ? 'bg-sky-500/14 text-sky-300 shadow-[0_0_15px_rgba(0,210,255,0.22)]'
                : 'text-zinc-500 hover:text-sky-300'
            }`}
          >
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {tab.icon}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
