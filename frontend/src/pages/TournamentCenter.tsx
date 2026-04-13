import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as api from '../services/api';
import type { CustomTeam, TournamentMatch, TournamentSimulation } from '../types';
import { PageLoader } from '../components/ui/LoadingSpinner';

type CompetitionKey = 'worldcup' | 'champions-league';

const COMPETITIONS: Array<{ key: CompetitionKey; label: string; kicker: string }> = [
  { key: 'worldcup', label: 'World Cup', kicker: 'International Run' },
  { key: 'champions-league', label: 'Champions League', kicker: 'European Run' },
];

function MatchColumn({ title, accent, matches, emptyLabel, customTeamName }: { title: string; accent: string; matches: TournamentMatch[]; emptyLabel: string; customTeamName?: string }) {
  return (
    <section className="glass-card rounded-3xl border border-white/5 p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${accent}`}>{title}</div>
          <div className="text-xs uppercase tracking-widest text-zinc-500 mt-1">{matches.length} fixtures</div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center text-sm font-bold text-zinc-500">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <article key={match.id} className="rounded-2xl border border-white/5 bg-black/20 p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${accent}`}>{match.stage}</div>
                  <div className="text-xs uppercase tracking-widest text-zinc-500 mt-1">{match.minute} · {match.venue}</div>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                  {match.status}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div className="min-w-0">
                  {match.homeTeam === customTeamName ? <Link to={`/tactics?view=custom&team=${encodeURIComponent(match.homeTeam)}`} className="block truncate text-sm font-black uppercase tracking-tight text-primary transition-colors hover:text-white">{match.homeTeam}</Link> : <div className="text-sm font-black uppercase tracking-tight text-white truncate">{match.homeTeam}</div>}
                </div>
                <div className="text-2xl font-black italic text-white">
                  {match.homeScore ?? '-'}
                  <span className="mx-2 text-primary">:</span>
                  {match.awayScore ?? '-'}
                </div>
                <div className="min-w-0 text-right">
                  {match.awayTeam === customTeamName ? <Link to={`/tactics?view=custom&team=${encodeURIComponent(match.awayTeam)}`} className="block truncate text-sm font-black uppercase tracking-tight text-primary transition-colors hover:text-white">{match.awayTeam}</Link> : <div className="text-sm font-black uppercase tracking-tight text-white truncate">{match.awayTeam}</div>}
                </div>
              </div>

              {match.analysis && <p className="text-sm text-zinc-400">{match.analysis}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function TournamentCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [teams, setTeams] = useState<CustomTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [simulation, setSimulation] = useState<TournamentSimulation | null>(null);
  const [error, setError] = useState('');

  const competition = (searchParams.get('competition') === 'champions-league' ? 'champions-league' : 'worldcup') as CompetitionKey;
  const selectedTeamSlug = searchParams.get('team') || '';

  useEffect(() => {
    api.getCustomTeams()
      .then((response) => {
        const nextTeams = response.data?.teams ?? [];
        setTeams(nextTeams);

        if (selectedTeamSlug && nextTeams.length) {
          const normalized = nextTeams.find((team: CustomTeam) => team.slug === selectedTeamSlug || team.slug === selectedTeamSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
          if (normalized && normalized.slug !== selectedTeamSlug) {
            setSearchParams({ team: normalized.slug, competition }, { replace: true });
            return;
          }
        }

        if (!selectedTeamSlug && nextTeams.length) {
          setSearchParams({ team: nextTeams[0].slug, competition }, { replace: true });
        }
      })
      .catch((requestError: any) => setError(requestError?.response?.data?.error || 'Failed to load custom teams.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTeamSlug) return;

    setSimLoading(true);
    setError('');

    api.simulateTournament(selectedTeamSlug, competition)
      .then((response) => setSimulation(response.data?.simulation ?? null))
      .catch((requestError: any) => {
        setSimulation(null);
        setError(requestError?.response?.data?.error || 'Failed to simulate tournament run.');
      })
      .finally(() => setSimLoading(false));
  }, [selectedTeamSlug, competition]);

  const selectedTeam = useMemo(() => teams.find((team) => team.slug === selectedTeamSlug) ?? null, [teams, selectedTeamSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32 space-y-8">
      <section className="glass-card rounded-[2rem] border border-white/5 p-8 md:p-10 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Final Phase</div>
            <h1 className="mt-4 text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
              Tournament <span className="text-primary">Center</span>
            </h1>
            <p className="mt-4 max-w-3xl text-zinc-400">
              Register your custom tactics team once, then throw it into fresh World Cup or Champions League simulations. Every rerun can give you a different path, from early exit to lifting the trophy.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {COMPETITIONS.map((item) => (
              <button
                key={item.key}
                onClick={() => setSearchParams(selectedTeamSlug ? { team: selectedTeamSlug, competition: item.key } : { competition: item.key })}
                className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                  competition === item.key ? 'bg-primary text-black shadow-[0_0_24px_rgba(114,220,255,0.24)]' : 'border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
          <div className="rounded-3xl border border-white/5 bg-black/20 p-5 space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Registered Teams</div>
            {teams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-zinc-500">
                No custom teams yet. Build one in <Link to="/tactics" className="text-primary">Tactical Hub</Link>.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teams.map((team) => (
                  <div
                    key={team.slug}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      selectedTeamSlug === team.slug ? 'border-primary/40 bg-primary/10' : 'border-white/5 bg-black/20 hover:border-white/20'
                    }`}
                  >
                    <button onClick={() => setSearchParams({ team: team.slug, competition })} className="w-full text-left">
                      <div className="text-sm font-black uppercase tracking-tight text-white">{team.name}</div>
                      <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">{team.formationId} · {team.overall} OVR</div>
                      <div className="mt-2 text-xs text-zinc-400">{team.manager}</div>
                    </button>
                    <Link to={`/tactics?view=custom&team=${encodeURIComponent(team.slug)}`} className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-all hover:border-primary/20 hover:text-white">View Squad</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/5 bg-black/20 p-5 space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Control Deck</div>
            <div className="space-y-2">
              <div className="text-2xl font-black italic text-white">{selectedTeam?.name || 'No Team Selected'}</div>
              <div className="text-sm text-zinc-400">{competition === 'worldcup' ? 'International tournament route with nations and knockout pressure.' : 'Club campaign route with league phase and European knockouts.'}</div>
            </div>
            <button
              onClick={() => {
                if (!selectedTeamSlug) return;
                setSimLoading(true);
                api.simulateTournament(selectedTeamSlug, competition)
                  .then((response) => { setSimulation(response.data?.simulation ?? null); setError(''); })
                  .catch((requestError: any) => setError(requestError?.response?.data?.error || 'Failed to rerun tournament simulation.'))
                  .finally(() => setSimLoading(false));
              }}
              disabled={!selectedTeamSlug}
              className="w-full rounded-2xl bg-secondary/90 px-5 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Rerun Simulation
            </button>
            <Link
              to={selectedTeam ? `/tactics?view=custom&team=${encodeURIComponent(selectedTeam.slug)}` : '/tactics'}
              className="block w-full rounded-2xl border border-white/10 px-5 py-4 text-center text-sm font-black uppercase tracking-widest text-zinc-300 transition-all hover:border-primary/20 hover:text-white"
            >
              View Team Squad
            </Link>
          </div>
        </div>
      </section>

      {error && <div className="rounded-3xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-100">{error}</div>}

      {simLoading ? (
        <div className="glass-card rounded-[2rem] border border-white/5 p-12">
          <PageLoader />
        </div>
      ) : simulation ? (
        <>
          <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
            <div className="glass-card rounded-[2rem] border border-white/5 p-8 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{simulation.competition}</div>
                  <h2 className="mt-3 text-4xl font-black uppercase italic tracking-tight text-white">{simulation.team.name}</h2>
                  <p className="mt-3 max-w-2xl text-zinc-400">{simulation.summary.resultLabel}</p>
                </div>
                <div className={`rounded-2xl px-4 py-3 text-center ${simulation.summary.trophyWon ? 'bg-secondary/15 text-secondary' : 'bg-white/5 text-zinc-300'}`}>
                  <div className="text-[10px] font-black uppercase tracking-widest">Stage</div>
                  <div className="mt-2 text-lg font-black italic">{simulation.summary.stageReached}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Record</div>
                  <div className="mt-2 text-2xl font-black italic text-white">{simulation.summary.record.wins}-{simulation.summary.record.draws}-{simulation.summary.record.losses}</div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Goals For</div>
                  <div className="mt-2 text-2xl font-black italic text-white">{simulation.summary.record.goalsFor}</div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Goals Against</div>
                  <div className="mt-2 text-2xl font-black italic text-white">{simulation.summary.record.goalsAgainst}</div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Team OVR</div>
                  <div className="mt-2 text-2xl font-black italic text-white">{simulation.team.overall}</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-[2rem] border border-white/5 p-8 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Tournament Squad</div>
              <div className="text-sm text-zinc-400">Your saved tactics roster is what powers this run. Re-register the team in Tactical Hub any time you want a fresh squad shape.</div>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 hide-scrollbar">
                {[...selectedTeam?.starters || [], ...selectedTeam?.substitutes || []].slice(0, 16).map((player) => (
                  <Link
                    key={player.id}
                    to={`/players/${player.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/20 px-4 py-3 transition-all hover:border-primary/20 hover:bg-primary/5"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-black uppercase tracking-tight text-white truncate">{player.name}</div>
                      <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">{player.position} · {player.club}</div>
                    </div>
                    <div className="text-xs font-black text-secondary">{player.rating} OVR</div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <MatchColumn title="Live Matches" accent="text-primary" matches={simulation.liveMatches} emptyLabel="No live matches in this current simulation snapshot." customTeamName={simulation.team.name} />
            <MatchColumn title="Upcoming Matches" accent="text-secondary" matches={simulation.upcomingMatches} emptyLabel="No upcoming ties remain in this current run." customTeamName={simulation.team.name} />
            <MatchColumn title="Finished Matches" accent="text-zinc-300" matches={simulation.finishedMatches} emptyLabel="Finished matches will appear here once the run generates results." customTeamName={simulation.team.name} />
          </section>
        </>
      ) : teams.length > 0 ? (
        <div className="glass-card rounded-[2rem] border border-white/5 px-6 py-12 text-center text-zinc-500">
          Select a custom team to generate a tournament run.
        </div>
      ) : null}
    </div>
  );
}
