import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const MULTICAST_GAMES = [
  { id: 'm1', home: { name: 'Argentina', code: 'ar' }, away: { name: 'France', code: 'fr' } },
  { id: 'm2', home: { name: 'Brazil', code: 'br' }, away: { name: 'Croatia', code: 'hr' } },
  { id: 'm3', home: { name: 'England', code: 'gb-eng' }, away: { name: 'Spain', code: 'es' } },
  { id: 'm4', home: { name: 'Portugal', code: 'pt' }, away: { name: 'Germany', code: 'de' } },
];

type SimEventType = 'goal' | 'card' | 'foul' | 'sub' | 'var' | 'referee' | 'penalty';

type SimEvent = {
  id: string;
  gameId: string;
  min: number;
  text: string;
  type: SimEventType;
  team?: 'home' | 'away';
  homeScore?: number;
  awayScore?: number;
  isShootout?: boolean;
};

type MatchSnapshot = {
  minute: number;
  homeScore: number;
  awayScore: number;
  shotsHome: number;
  shotsAway: number;
  cornersHome: number;
  cornersAway: number;
  yellowHome: number;
  yellowAway: number;
  possessionHome: number;
  isFinal: boolean;
  finalMessage: string;
  shootoutHome?: number;
  shootoutAway?: number;
};

type PlannedMatch = {
  events: SimEvent[];
  finalMinute: number;
  finalMessage: string;
  minuteLabel: (minute: number) => string;
};

const MASTER_TIMELINE: SimEvent[] = [
  { id: 'm1-1', gameId: 'm1', min: 1, text: 'Kickoff in Buenos Aires style tempo. Argentina and France are underway.', type: 'referee' },
  { id: 'm1-18', gameId: 'm1', min: 18, text: 'Yellow card for France after a late challenge in midfield.', type: 'card', team: 'away' },
  { id: 'm1-27', gameId: 'm1', min: 27, text: 'GOAL! Argentina finish a flowing move to go 1-0 up.', type: 'goal', team: 'home', homeScore: 1, awayScore: 0 },
  { id: 'm1-46', gameId: 'm1', min: 46, text: 'Second half begins. France restart quickly looking for an equaliser.', type: 'referee' },
  { id: 'm1-63', gameId: 'm1', min: 63, text: 'GOAL! France level it from close range after a rebound.', type: 'goal', team: 'away', homeScore: 1, awayScore: 1 },
  { id: 'm1-82', gameId: 'm1', min: 82, text: 'Substitution for Argentina as they freshen the front line.', type: 'sub', team: 'home' },
  { id: 'm1-90', gameId: 'm1', min: 90, text: 'Full time. Argentina 1-1 France.', type: 'referee' },

  { id: 'm2-1', gameId: 'm2', min: 1, text: 'Kickoff between Brazil and Croatia.', type: 'referee' },
  { id: 'm2-21', gameId: 'm2', min: 21, text: 'Foul by Croatia stops a dangerous Brazil counter.', type: 'foul', team: 'away' },
  { id: 'm2-39', gameId: 'm2', min: 39, text: 'GOAL! Brazil break through with a low finish into the far corner.', type: 'goal', team: 'home', homeScore: 1, awayScore: 0 },
  { id: 'm2-58', gameId: 'm2', min: 58, text: 'Yellow card for Brazil after a tactical foul.', type: 'card', team: 'home' },
  { id: 'm2-76', gameId: 'm2', min: 76, text: 'GOAL! Croatia equalise from a set piece.', type: 'goal', team: 'away', homeScore: 1, awayScore: 1 },
  { id: 'm2-90', gameId: 'm2', min: 90, text: 'Full time. Brazil 1-1 Croatia.', type: 'referee' },

  { id: 'm3-1', gameId: 'm3', min: 1, text: 'Kickoff between England and Spain.', type: 'referee' },
  { id: 'm3-24', gameId: 'm3', min: 24, text: 'GOAL! England strike first with a sharp finish after a cut-back.', type: 'goal', team: 'home', homeScore: 1, awayScore: 0 },
  { id: 'm3-45', gameId: 'm3', min: 45, text: 'Half-time. England lead 1-0.', type: 'referee' },
  { id: 'm3-60', gameId: 'm3', min: 60, text: 'Spain make a substitution to add control in midfield.', type: 'sub', team: 'away' },
  { id: 'm3-74', gameId: 'm3', min: 74, text: 'VAR checks a possible Spain handball. No penalty awarded.', type: 'var' },
  { id: 'm3-90', gameId: 'm3', min: 90, text: 'Full time. England win 1-0.', type: 'referee' },

  { id: 'm4-1', gameId: 'm4', min: 1, text: 'Kickoff between Portugal and Germany.', type: 'referee' },
  { id: 'm4-16', gameId: 'm4', min: 16, text: 'Yellow card for Portugal after a late tackle on halfway.', type: 'card', team: 'home' },
  { id: 'm4-33', gameId: 'm4', min: 33, text: 'GOAL! Germany take the lead with a composed finish.', type: 'goal', team: 'away', homeScore: 0, awayScore: 1 },
  { id: 'm4-52', gameId: 'm4', min: 52, text: 'GOAL! Portugal respond immediately after the break.', type: 'goal', team: 'home', homeScore: 1, awayScore: 1 },
  { id: 'm4-88', gameId: 'm4', min: 88, text: 'Foul by Germany in a dangerous area gives Portugal one last set piece.', type: 'foul', team: 'away' },
  { id: 'm4-90', gameId: 'm4', min: 90, text: 'Full time. Portugal 1-1 Germany.', type: 'referee' },
];

const eventColor: Record<SimEventType, { bg: string; text: string; icon: string }> = {
  goal: { bg: 'bg-primary/10 border-primary/30', text: 'text-primary', icon: 'sports_score' },
  card: { bg: 'bg-yellow-400/10 border-yellow-400/30', text: 'text-yellow-400', icon: 'style' },
  foul: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', icon: 'gavel' },
  sub: { bg: 'bg-blue-400/10 border-blue-400/20', text: 'text-blue-400', icon: 'swap_horiz' },
  var: { bg: 'bg-orange-400/10 border-orange-400/20', text: 'text-orange-400', icon: 'videocam' },
  referee: { bg: 'bg-secondary/10 border-secondary/30', text: 'text-secondary', icon: 'sports_whistle' },
  penalty: { bg: 'bg-purple-400/10 border-purple-400/20', text: 'text-white', icon: 'radio_button_checked' },
};

function hashSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function createRng(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function uniqueMinute(rng: () => number, min: number, max: number, used: Set<number>) {
  let candidate = Math.floor(rng() * (max - min + 1)) + min;
  while (used.has(candidate)) {
    candidate += 1;
    if (candidate > max) candidate = min;
  }
  used.add(candidate);
  return candidate;
}

function buildMinuteLabel(knockout: boolean, finalMinute: number) {
  return (minute: number) => {
    if (minute <= 45) return `${minute}'`;
    if (minute <= 90) return `${minute}'`;
    if (knockout && finalMinute > 90 && minute <= 105) return `${minute}'`;
    if (knockout && finalMinute > 105 && minute <= 120) return `${minute}'`;
    if (knockout && minute > 120) return `PEN`;
    return `${minute}'`;
  };
}

function pickRegulationScore(rng: () => number, knockout: boolean) {
  const shouldDraw = rng() < (knockout ? 0.3 : 0.22);

  if (shouldDraw) {
    const drawScores: Array<[number, number]> = [[0, 0], [1, 1], [2, 2]];
    return drawScores[Math.floor(rng() * drawScores.length)];
  }

  const decisiveScores: Array<[number, number]> = [
    [1, 0],
    [2, 0],
    [2, 1],
    [3, 1],
    [3, 2],
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [2, 3],
  ];

  return decisiveScores[Math.floor(rng() * decisiveScores.length)];
}

function buildSingleMatchPlan(home: string, away: string, knockout: boolean): PlannedMatch {
  const seed = hashSeed(`${home}-${away}-${knockout ? 'ko' : 'league'}`);
  const rng = createRng(seed);
  const usedMinutes = new Set<number>([1, 46, 90]);
  const events: SimEvent[] = [];
  let [homeScore, awayScore] = pickRegulationScore(rng, knockout);
  const regulationGoalTeams = [
    ...Array.from({ length: homeScore }, () => 'home' as const),
    ...Array.from({ length: awayScore }, () => 'away' as const),
  ].sort(() => rng() - 0.5);

  const addEvent = (event: Omit<SimEvent, 'id' | 'gameId'>) => {
    events.push({
      ...event,
      id: `single-${event.min}-${events.length + 1}`,
      gameId: 'single',
    });
  };

  addEvent({
    min: 1,
    type: 'referee',
    text: `Kickoff! ${home} get us started against ${away}.`,
  });

  const firstHalfMoments = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < firstHalfMoments; i += 1) {
    const min = uniqueMinute(rng, 8, 42, usedMinutes);
    const team = rng() > 0.5 ? 'home' : 'away';
    const teamName = team === 'home' ? home : away;
    const roll = rng();
    if (roll < 0.38) {
      addEvent({ min, type: 'foul', team, text: `Foul by ${teamName} as they stop a dangerous transition.` });
    } else if (roll < 0.68) {
      addEvent({ min, type: 'card', team, text: `Yellow card shown to ${teamName} after a late challenge.` });
    } else {
      addEvent({ min, type: 'sub', team, text: `${teamName} make an early tactical switch after an injury concern.` });
    }
  }

  let runningHome = 0;
  let runningAway = 0;
  for (let i = 0; i < regulationGoalTeams.length; i += 1) {
    const min = uniqueMinute(rng, 14, 88, usedMinutes);
    const team = regulationGoalTeams[i];
    if (team === 'home') runningHome += 1;
    else runningAway += 1;
    const teamName = team === 'home' ? home : away;
    addEvent({
      min,
      type: 'goal',
      team,
      text: `GOAL! ${teamName} score with a clean finish after a sharp attacking move.`,
      homeScore: runningHome,
      awayScore: runningAway,
    });
  }

  homeScore = runningHome;
  awayScore = runningAway;

  addEvent({
    min: 46,
    type: 'referee',
    text: `The second half is underway. ${home} ${homeScore === awayScore ? 'and' : 'while'} ${away} look for the key next moment.`,
  });

  const secondHalfMoments = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < secondHalfMoments; i += 1) {
    const min = uniqueMinute(rng, 52, 87, usedMinutes);
    const team = rng() > 0.5 ? 'home' : 'away';
    const teamName = team === 'home' ? home : away;
    const roll = rng();
    if (roll < 0.3) {
      addEvent({ min, type: 'foul', team, text: `${teamName} concede a foul in a dangerous area.` });
    } else if (roll < 0.52) {
      addEvent({ min, type: 'card', team, text: `Another booking arrives, this time for ${teamName}.` });
    } else if (roll < 0.78) {
      addEvent({ min, type: 'sub', team, text: `Substitution for ${teamName} as fresh legs come on.` });
    } else {
      addEvent({ min, type: 'var', team, text: `VAR checks a moment involving ${teamName}, but the on-field call stands.` });
    }
  }

  let finalMinute = 90;
  let finalMessage = `${home} ${homeScore} - ${awayScore} ${away}.`;

  if (knockout && homeScore === awayScore) {
    const firstExtraMinute = 91;
    const secondExtraMinute = 106;
    usedMinutes.add(firstExtraMinute);
    usedMinutes.add(secondExtraMinute);

    addEvent({
      min: firstExtraMinute,
      type: 'referee',
      text: `Full time ends level. Extra time begins.`,
    });

    const extraGoalHappens = rng() > 0.45;
    if (extraGoalHappens) {
      const min = uniqueMinute(rng, 97, 118, usedMinutes);
      const team = rng() > 0.5 ? 'home' : 'away';
      if (team === 'home') homeScore += 1;
      else awayScore += 1;
      const teamName = team === 'home' ? home : away;
      addEvent({
        min,
        type: 'goal',
        team,
        text: `GOAL IN EXTRA TIME! ${teamName} finally force the breakthrough.`,
        homeScore,
        awayScore,
      });
    }

    addEvent({
      min: secondExtraMinute,
      type: 'referee',
      text: 'Second period of extra time begins.',
    });

    if (homeScore === awayScore) {
      const shootoutHome = 3 + Math.floor(rng() * 3);
      let shootoutAway = 3 + Math.floor(rng() * 3);
      if (shootoutHome === shootoutAway) {
        shootoutAway = shootoutHome > 3 ? shootoutHome - 1 : shootoutHome + 1;
      }
      finalMinute = 121;
      addEvent({
        min: 121,
        type: 'penalty',
        text: `Penalty shootout: ${home} ${shootoutHome}-${shootoutAway} ${away}.`,
        homeScore,
        awayScore,
        isShootout: true,
      });
      finalMessage = `${homeScore}-${awayScore} after extra time. ${shootoutHome > shootoutAway ? home : away} win on penalties ${shootoutHome}-${shootoutAway}.`;
    } else {
      finalMinute = 120;
      finalMessage = `${home} ${homeScore} - ${awayScore} ${away} after extra time.`;
    }
  }

  addEvent({
    min: finalMinute,
    type: 'referee',
    text: finalMinute > 120
      ? `The shootout is over. ${finalMessage}`
      : `Match ended. ${finalMessage}`,
    homeScore,
    awayScore,
  });

  events.sort((a, b) => a.min - b.min);

  return {
    events,
    finalMinute,
    finalMessage,
    minuteLabel: buildMinuteLabel(knockout, finalMinute),
  };
}

function buildSnapshotFromEvents(events: SimEvent[], minute: number, finalMinute: number, finalMessage: string): MatchSnapshot {
  let homeScore = 0;
  let awayScore = 0;
  let shotsHome = 1;
  let shotsAway = 1;
  let cornersHome = 0;
  let cornersAway = 0;
  let yellowHome = 0;
  let yellowAway = 0;
  let possessionHome = 50;
  let shootoutHome: number | undefined;
  let shootoutAway: number | undefined;

  const visibleEvents = events.filter((event) => event.min <= minute);
  for (const event of visibleEvents) {
    if (typeof event.homeScore === 'number') homeScore = event.homeScore;
    if (typeof event.awayScore === 'number') awayScore = event.awayScore;

    if (event.type === 'goal') {
      if (event.team === 'home') {
        shotsHome += 2;
        cornersHome += 1;
        possessionHome = Math.min(64, possessionHome + 2);
      } else {
        shotsAway += 2;
        cornersAway += 1;
        possessionHome = Math.max(36, possessionHome - 2);
      }
    }

    if (event.type === 'card') {
      if (event.team === 'home') yellowHome += 1;
      if (event.team === 'away') yellowAway += 1;
    }

    if (event.type === 'foul') {
      if (event.team === 'home') possessionHome = Math.max(36, possessionHome - 1);
      if (event.team === 'away') possessionHome = Math.min(64, possessionHome + 1);
    }

    if (event.type === 'sub') {
      if (event.team === 'home') shotsHome += 1;
      if (event.team === 'away') shotsAway += 1;
    }

    if (event.type === 'var') {
      if (event.team === 'home') cornersHome += 1;
      if (event.team === 'away') cornersAway += 1;
    }

    if (event.type === 'penalty' && event.isShootout) {
      const match = event.text.match(/(\d+)-(\d+)/);
      if (match) {
        shootoutHome = Number(match[1]);
        shootoutAway = Number(match[2]);
      }
    }
  }

  return {
    minute,
    homeScore,
    awayScore,
    shotsHome,
    shotsAway,
    cornersHome,
    cornersAway,
    yellowHome,
    yellowAway,
    possessionHome,
    isFinal: minute >= finalMinute,
    finalMessage,
    shootoutHome,
    shootoutAway,
  };
}

function renderCrest(code: string, isUrl: boolean, size = 'md') {
  const cls = size === 'sm' ? 'w-8 h-8' : 'w-12 h-12 md:w-20 md:h-20';
  if (!code) {
    return <div className={`${cls} bg-zinc-800 rounded-full flex items-center justify-center font-black text-zinc-500`}>?</div>;
  }
  const src = isUrl ? decodeURIComponent(code) : `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
  return <img src={src} alt="crest" className={`${cls} rounded object-contain`} />;
}

export default function WorldCupSimulation() {
  const [searchParams] = useSearchParams();
  const [minute, setMinute] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  const homeParam = searchParams.get('home') || '';
  const awayParam = searchParams.get('away') || '';
  const homeCodeParam = searchParams.get('homeCode') || '';
  const awayCodeParam = searchParams.get('awayCode') || '';
  const isWorldCup = searchParams.get('isWorldCup') === 'true';
  const isKnockout = searchParams.get('knockout') === 'true';
  const isSingleMatch = Boolean(homeParam && awayParam);

  const singlePlan = useMemo(
    () => (isSingleMatch ? buildSingleMatchPlan(homeParam, awayParam, isKnockout) : null),
    [awayParam, homeParam, isKnockout, isSingleMatch]
  );

  useEffect(() => {
    setMinute(0);
  }, [singlePlan, isSingleMatch]);

  useEffect(() => {
    const finalMinute = isSingleMatch ? singlePlan?.finalMinute ?? 90 : 90;
    const timer = window.setInterval(() => {
      setMinute((prev) => {
        if (prev >= finalMinute) {
          window.clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 850);

    return () => window.clearInterval(timer);
  }, [isSingleMatch, singlePlan]);

  const singleEvents = useMemo(() => {
    if (!singlePlan) return [];
    return singlePlan.events.filter((event) => event.min <= minute).slice().reverse();
  }, [minute, singlePlan]);

  const singleSnapshot = useMemo(() => {
    if (!singlePlan) return null;
    return buildSnapshotFromEvents(singlePlan.events, minute, singlePlan.finalMinute, singlePlan.finalMessage);
  }, [minute, singlePlan]);

  const multicastEvents = useMemo(() => MASTER_TIMELINE.filter((event) => event.min <= Math.min(minute, 90)).slice().reverse(), [minute]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [singleEvents.length, multicastEvents.length]);

  const displayEvents = isSingleMatch ? singleEvents : multicastEvents;
  const displayMinute = isSingleMatch ? minute : Math.min(minute, 90);
  const minuteText = isSingleMatch && singlePlan ? singlePlan.minuteLabel(Math.min(minute, singlePlan.finalMinute)) : `${Math.min(minute, 90)}'`;
  const progressWidth = isSingleMatch && singlePlan ? `${Math.min(100, (Math.min(minute, singlePlan.finalMinute) / singlePlan.finalMinute) * 100)}%` : `${Math.min(100, (Math.min(minute, 90) / 90) * 100)}%`;

  const getMulticastScore = (gameId: string) => {
    const visible = MASTER_TIMELINE.filter((event) => event.gameId === gameId && event.min <= Math.min(minute, 90) && event.type === 'goal');
    const last = visible[visible.length - 1];
    return {
      home: last?.homeScore ?? 0,
      away: last?.awayScore ?? 0,
    };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-10 pb-32 min-h-screen">
      <Link
        to={isWorldCup ? '/worldcup' : '/matches'}
        className="inline-flex items-center gap-2 text-primary hover:underline font-bold mb-6 uppercase tracking-widest text-xs"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to {isWorldCup ? 'World Cup Hub' : 'Match Center'}
      </Link>

      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full mb-8 w-fit shadow-[0_0_20px_rgba(47,248,1,0.15)]">
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
        <span className="text-secondary font-black uppercase text-xs tracking-widest">
          {isSingleMatch ? 'Live Match Feed' : 'Global Multicast Simulator'}
        </span>
      </div>

      {isSingleMatch && singleSnapshot && (
        <>
          <div className="bg-surface-container-high border border-outline-variant rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex w-full justify-around items-center mb-6">
                <div className="flex flex-col items-center gap-3">
                  {renderCrest(homeCodeParam, !isWorldCup)}
                  <h2 className="text-xl md:text-3xl font-black italic uppercase text-center leading-tight">{homeParam}</h2>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-5xl md:text-7xl font-black text-white px-5 py-2 bg-zinc-950 rounded-xl border border-white/10 shadow-inner font-headline tracking-tighter">
                    {singleSnapshot.homeScore}
                    <span className="text-primary mx-3 text-3xl md:text-5xl">:</span>
                    {singleSnapshot.awayScore}
                  </div>
                  <span className="text-primary font-black text-sm tracking-widest">
                    {minuteText} {singleSnapshot.isFinal ? 'FT' : minute === 45 ? 'HT' : ''}
                  </span>
                  {typeof singleSnapshot.shootoutHome === 'number' && typeof singleSnapshot.shootoutAway === 'number' && (
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                      Pens {singleSnapshot.shootoutHome}-{singleSnapshot.shootoutAway}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-3">
                  {renderCrest(awayCodeParam, !isWorldCup)}
                  <h2 className="text-xl md:text-3xl font-black italic uppercase text-center leading-tight">{awayParam}</h2>
                </div>
              </div>

              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-linear" style={{ width: progressWidth }} />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <StatChip home={singleSnapshot.shotsHome} away={singleSnapshot.shotsAway} label="Shots" icon="sports_soccer" />
                <StatChip home={singleSnapshot.cornersHome} away={singleSnapshot.cornersAway} label="Corners" icon="flag" />
                <StatChip home={singleSnapshot.yellowHome} away={singleSnapshot.yellowAway} label="Cards" icon="style" accent="text-yellow-400" />
                <div className="bg-zinc-900/70 rounded-xl p-3 text-center border border-white/5">
                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Possession</div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${singleSnapshot.possessionHome}%` }} />
                    <div className="h-full bg-secondary/70" style={{ width: `${100 - singleSnapshot.possessionHome}%` }} />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] font-black">
                    <span className="text-primary">{singleSnapshot.possessionHome}%</span>
                    <span className="text-secondary">{100 - singleSnapshot.possessionHome}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {singleSnapshot.isFinal && (
            <div className="mb-8 rounded-2xl border border-secondary/25 bg-secondary/10 p-5 shadow-[0_0_24px_rgba(47,248,1,0.12)]">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary">task_alt</span>
                <div>
                  <h3 className="font-headline font-black italic uppercase text-lg text-white">Match Ended</h3>
                  <p className="text-sm text-zinc-300 mt-1">{singleSnapshot.finalMessage}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!isSingleMatch && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {MULTICAST_GAMES.map((game) => {
              const score = getMulticastScore(game.id);
              return (
                <div key={game.id} className="bg-surface-container-high border border-outline-variant rounded-2xl p-5 relative overflow-hidden shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Quarter-Final</span>
                    <div className="flex w-full justify-between items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <img src={`https://flagcdn.com/w40/${game.home.code}.png`} alt={game.home.name} className="rounded shadow-md w-10" />
                        <span className="text-[11px] font-black uppercase">{game.home.name.slice(0, 3)}</span>
                      </div>
                      <div className="text-3xl font-black font-headline text-white">
                        {score.home}
                        <span className="text-primary text-xl mx-1">:</span>
                        {score.away}
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <img src={`https://flagcdn.com/w40/${game.away.code}.png`} alt={game.away.name} className="rounded shadow-md w-10" />
                        <span className="text-[11px] font-black uppercase">{game.away.name.slice(0, 3)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Match Clock</span>
            <span className="text-primary font-black">{Math.min(displayMinute, 90)}'</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-8">
            <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-linear" style={{ width: progressWidth }} />
          </div>
        </>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-black italic text-xl uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Live Event Feed
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          {displayEvents.length} events
        </div>
      </div>

      <div ref={feedRef} className="bg-surface-container-low rounded-xl border border-white/5 p-4 md:p-6 h-[480px] overflow-y-auto hide-scrollbar shadow-inner">
        {displayEvents.length === 0 && (
          <div className="text-zinc-600 font-bold italic text-center py-20 animate-pulse">
            Awaiting kickoff...
          </div>
        )}
        <div className="space-y-3">
          {displayEvents.map((event) => {
            const style = eventColor[event.type];
            const game = isSingleMatch
              ? { home: { name: homeParam }, away: { name: awayParam } }
              : MULTICAST_GAMES.find((item) => item.id === event.gameId);

            return (
              <div key={event.id} className={`flex items-start md:items-center gap-3 p-3 md:p-4 rounded-xl border ${style.bg} animate-fade-in`}>
                <div className="flex items-center gap-2 shrink-0 min-w-[90px]">
                  <span className={`font-black text-base w-8 text-right ${style.text}`}>{isSingleMatch && singlePlan ? singlePlan.minuteLabel(event.min) : `${event.min}'`}</span>
                  {!isSingleMatch && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 bg-black/30 px-1.5 py-0.5 rounded">
                      {game?.home?.name?.slice(0, 3)} v {game?.away?.name?.slice(0, 3)}
                    </span>
                  )}
                </div>
                <span className={`material-symbols-outlined text-xl hidden md:block shrink-0 ${style.text}`}>{style.icon}</span>
                <p className={`font-body flex-1 text-sm leading-snug ${style.text === 'text-white' ? 'text-zinc-100' : style.text}`}>
                  {event.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {Object.entries(eventColor).map(([type, style]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`material-symbols-outlined text-base ${style.text}`}>{style.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatChip({
  home,
  away,
  label,
  icon,
  accent = 'text-white',
}: {
  home: number;
  away: number;
  label: string;
  icon: string;
  accent?: string;
}) {
  return (
    <div className="bg-zinc-900/70 rounded-xl p-3 border border-white/5">
      <div className="flex items-center justify-center gap-1 mb-1">
        <span className={`material-symbols-outlined text-sm ${accent}`}>{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className={`text-base font-black ${accent}`}>{home}</span>
        <span className="text-zinc-700 text-xs">-</span>
        <span className={`text-base font-black ${accent}`}>{away}</span>
      </div>
    </div>
  );
}
