import { useState, useEffect, useMemo, useRef } from 'react';
import * as api from '../services/api';
import type { Player } from '../types';
import PlayerCard from '../components/players/PlayerCard';
import PlayerFilters from '../components/players/PlayerFilters';
import CompareDrawer from '../components/players/CompareDrawer';
import { PageLoader } from '../components/ui/LoadingSpinner';

type RegisterState = 'idle' | 'saving' | 'success';

export default function PlayerDiscovery() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPlayersForSearch, setAllPlayersForSearch] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('');
  const [sortBy, setSortBy] = useState<'ovr-desc' | 'market-desc' | 'age-asc' | 'goals-desc' | 'assists-desc'>('ovr-desc');
  const [spotlight, setSpotlight] = useState<'all' | 'top-scorers' | 'playmakers' | 'wonderkids'>('all');
  const [compareList, setCompareList] = useState<Player[]>([]);
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Register modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regState, setRegState] = useState<RegisterState>('idle');
  const [regName, setRegName] = useState('');
  const [regPosition, setRegPosition] = useState('Forward');
  const [regClub, setRegClub] = useState('');
  const [regNationality, setRegNationality] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regError, setRegError] = useState('');

  // Fetch players whenever filters change
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search && search.length >= 1) params.search = search;
    if (position) params.position = position;

    api.getPlayers(params)
      .then(res => setPlayers(res.data?.players ?? []))
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, [search, position]);

  // Load all players once for search suggestions
  useEffect(() => {
    api.getPlayers().then(res => setAllPlayersForSearch(res.data?.players ?? []));
  }, []);

  // Update suggestions from local cache (fast, no refetch)
  useEffect(() => {
    if (search.length >= 2) {
      const q = search.toLowerCase();
      const hits = allPlayersForSearch.filter(p =>
        p.name.toLowerCase().includes(q) || p.club?.toLowerCase().includes(q)
      ).slice(0, 6);
      setSuggestions(hits);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search, allPlayersForSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggleCompare(player: Player) {
    setCompareList(prev => {
      if (prev.find(p => p.id === player.id)) return prev.filter(p => p.id !== player.id);
      if (prev.length >= 2) return [prev[1], player];
      return [...prev, player];
    });
  }

  async function handleRegister() {
    if (!regName.trim()) return;
    setRegState('saving');
    setRegError('');
    try {
      const res = await api.createPlayer({
        name: regName.trim(),
        position: regPosition,
        club: regClub.trim(),
        nationality: regNationality.trim(),
        age: regAge.trim(),
      });

      const createdPlayer = res.data?.player;
      if (createdPlayer) {
        setPlayers((prev) => [createdPlayer, ...prev]);
        setAllPlayersForSearch((prev) => [createdPlayer, ...prev]);
        setSearch(createdPlayer.name);
      }

      setRegState('success');
    } catch (error: any) {
      setRegError(error?.response?.data?.error || 'Failed to register player.');
      setRegState('idle');
    }
  }

  function closeRegister() {
    setIsRegisterOpen(false);
    setRegState('idle');
    setRegError('');
    setRegName(''); setRegPosition('Forward'); setRegClub('');
    setRegNationality(''); setRegAge('');
  }

  const visiblePlayers = useMemo(() => {
    let next = [...players];

    if (spotlight === 'top-scorers') next = next.filter((player) => player.seasonStats.goals > 0);
    if (spotlight === 'playmakers') next = next.filter((player) => player.seasonStats.assists > 0 || player.stats.passing >= 75);
    if (spotlight === 'wonderkids') next = next.filter((player) => player.age <= 23);

    next.sort((a, b) => {
      switch (sortBy) {
        case 'market-desc':
          return b.rating * 1.2 - a.rating * 1.2;
        case 'age-asc':
          return a.age - b.age;
        case 'goals-desc':
          return b.seasonStats.goals - a.seasonStats.goals;
        case 'assists-desc':
          return b.seasonStats.assists - a.seasonStats.assists;
        case 'ovr-desc':
        default:
          return b.rating - a.rating;
      }
    });

    return next;
  }, [players, sortBy, spotlight]);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-32">
      {/* ── Hero ── */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-2xl p-8 md:p-12 bg-surface-container-low mb-8">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="relative z-10">
            <h1 className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 leading-none">
              Discover <br /><span className="text-primary italic text-glow-primary">Next Gen</span> Talent
            </h1>
            <p className="text-on-surface-variant max-w-xl mb-8 font-body font-light">
              Filter through the world's most elite prospects. Real-time performance data meets advanced scouting.
            </p>

            {/* Search + Register row */}
            <div className="flex flex-wrap gap-4 items-center max-w-2xl" ref={searchRef}>
              <div className="relative flex-1 min-w-[200px]">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary opacity-20 group-focus-within:opacity-50 blur transition duration-300 rounded-full" />
                  <div className="relative flex items-center bg-zinc-950/60 backdrop-blur-2xl rounded-full px-6 py-4">
                    <span className="material-symbols-outlined text-primary mr-4">manage_search</span>
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Search by name, club..."
                      className="bg-transparent border-none focus:outline-none text-on-surface placeholder:text-zinc-600 w-full font-body font-medium" />
                    {search && (
                      <button onClick={() => { setSearch(''); setSuggestions([]); setShowSuggestions(false); }}
                        className="text-zinc-500 hover:text-white ml-2 transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Autocomplete dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                    {suggestions.map(p => (
                      <button key={p.id} onMouseDown={() => { setSearch(p.name); setShowSuggestions(false); }}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 flex-none">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.name) + '&background=1a1a2e&color=72dcff'; }} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">{p.name}</div>
                          <div className="text-xs text-zinc-500 font-bold">{p.position} · {p.club}</div>
                        </div>
                        <span className="ml-auto text-secondary font-black text-xs">{p.rating} OVR</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-6 py-4 bg-secondary text-black font-black uppercase tracking-widest rounded-full hover:shadow-[0_0_20px_rgba(47,248,1,0.5)] transition-all flex items-center gap-2 flex-none">
                <span className="material-symbols-outlined">person_add</span>
                Register
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <PlayerFilters position={position} onPositionChange={setPosition} />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                ['all', 'All Profiles'],
                ['top-scorers', 'Top Scorers'],
                ['playmakers', 'Playmakers'],
                ['wonderkids', 'Wonderkids'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSpotlight(key as typeof spotlight)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${spotlight === key ? 'bg-primary/10 border border-primary/30 text-primary' : 'bg-surface-container-highest text-zinc-400 border border-transparent hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-zinc-950/70 border border-white/10 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-white focus:border-primary outline-none"
              >
                <option value="ovr-desc">OVR</option>
                <option value="market-desc">Market Value</option>
                <option value="goals-desc">Goals</option>
                <option value="assists-desc">Assists</option>
                <option value="age-asc">Youngest First</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      {loading ? (
        <PageLoader />
      ) : visiblePlayers.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-4 block">person_search</span>
          <p className="font-headline text-xl uppercase">No players found</p>
          <p className="text-sm mt-2 text-zinc-600">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visiblePlayers.map(player => (
              <PlayerCard key={player.id} player={player}
                isInCompare={compareList.some(p => p.id === player.id)}
                onCompareToggle={() => toggleCompare(player)} />
            ))}
          </section>
          <p className="mt-8 text-center text-[10px] text-zinc-600 uppercase font-medium tracking-widest">
            Showing {players.length} players{position ? ` · ${position}` : ''}{search ? ` matching "${search}"` : ''}
          </p>
        </>
      )}

      {/* ── Compare Drawer ── */}
      {compareList.length > 0 && (
        <CompareDrawer players={compareList}
          onRemove={id => setCompareList(prev => prev.filter(p => p.id !== id))}
          onClose={() => setCompareList([])} />
      )}

      {/* ── Register Player Modal ── */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

            {regState === 'success' ? (
              /* ── Success State ── */
              <div className="p-12 text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-green-400">check_circle</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase text-white">Player Registered!</h2>
                  <p className="text-zinc-400 mt-2 font-medium">
                    <span className="text-white font-black">{regName}</span> has been added to the scouting database.
                  </p>
                </div>
                <div className="w-full p-4 bg-white/5 rounded-2xl text-sm text-zinc-400 text-left space-y-1">
                  <div><span className="text-zinc-600 font-bold uppercase text-xs">Position:</span> <span className="text-white font-bold">{regPosition}</span></div>
                  {regClub && <div><span className="text-zinc-600 font-bold uppercase text-xs">Club:</span> <span className="text-white font-bold">{regClub}</span></div>}
                  {regNationality && <div><span className="text-zinc-600 font-bold uppercase text-xs">Nation:</span> <span className="text-white font-bold">{regNationality}</span></div>}
                </div>
                <button onClick={closeRegister}
                  className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all">
                  Done
                </button>
              </div>
            ) : (
              /* ── Form State ── */
              <>
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-black italic uppercase text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">person_add</span>
                      Register Player
                    </h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Add to scouting database</p>
                  </div>
                  <button onClick={closeRegister}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Full Name *</label>
                    <input type="text" value={regName} onChange={e => setRegName(e.target.value)}
                      placeholder="Enter full name..."
                      className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors font-bold" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Position *</label>
                      <select value={regPosition} onChange={e => setRegPosition(e.target.value)}
                        className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none appearance-none font-bold">
                        <option>Forward</option>
                        <option>Midfielder</option>
                        <option>Defender</option>
                        <option>Winger</option>
                        <option>Goalkeeper</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Age</label>
                      <input type="number" value={regAge} onChange={e => setRegAge(e.target.value)}
                        placeholder="e.g. 21"
                        className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors font-bold" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Club</label>
                    <input type="text" value={regClub} onChange={e => setRegClub(e.target.value)}
                      placeholder="Club name"
                      className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors font-bold" />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Nationality</label>
                    <input type="text" value={regNationality} onChange={e => setRegNationality(e.target.value)}
                      placeholder="Country"
                      className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors font-bold" />
                  </div>

                  {regError && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
                      {regError}
                    </div>
                  )}

                  <button
                    onClick={handleRegister}
                    disabled={!regName.trim() || regState === 'saving'}
                    className={`w-full py-4 mt-2 font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 ${!regName.trim() ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' : regState === 'saving' ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' : 'bg-primary text-black hover:shadow-[0_0_20px_rgba(0,210,255,0.4)]'}`}>
                    {regState === 'saving' ? (
                      <>
                        <span className="w-4 h-4 border-2 border-zinc-400/20 border-t-zinc-400 rounded-full animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
