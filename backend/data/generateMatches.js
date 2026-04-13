const fs = require('fs');
const path = require('path');

// Per-league configs — counts reflect realistic mid-April state of each competition
const leagues = [
  {
    name: "Premier League", code: "PL", id: 2021,
    live: 6, upcoming: 26, finished: 20,   // Full 20-team league, many GWs left + results
    teams: [
      { name: "Arsenal",           shortName: "ARS", crest: "https://crests.football-data.org/57.png" },
      { name: "Liverpool",         shortName: "LIV", crest: "https://crests.football-data.org/64.png" },
      { name: "Chelsea",           shortName: "CHE", crest: "https://crests.football-data.org/61.png" },
      { name: "Manchester City",   shortName: "MCI", crest: "https://crests.football-data.org/65.png" },
      { name: "Manchester United", shortName: "MUN", crest: "https://crests.football-data.org/66.png" },
      { name: "Tottenham Hotspur", shortName: "TOT", crest: "https://crests.football-data.org/73.svg" },
      { name: "Aston Villa",       shortName: "AVL", crest: "https://crests.football-data.org/58.png" },
      { name: "Newcastle United",  shortName: "NEW", crest: "https://crests.football-data.org/67.png" },
      { name: "West Ham United",   shortName: "WHU", crest: "https://crests.football-data.org/563.png" },
      { name: "Brighton",          shortName: "BHA", crest: "https://crests.football-data.org/397.png" },
      { name: "Wolverhampton",     shortName: "WOL", crest: "https://crests.football-data.org/76.svg" },
      { name: "Fulham",            shortName: "FUL", crest: "https://crests.football-data.org/63.png" },
      { name: "Brentford",         shortName: "BRE", crest: "https://crests.football-data.org/402.png" },
      { name: "Everton",           shortName: "EVE", crest: "https://crests.football-data.org/62.png" },
    ]
  },
  {
    name: "La Liga", code: "PD", id: 2014,
    live: 4, upcoming: 18, finished: 15,
    teams: [
      { name: "Real Madrid",     shortName: "RMA", crest: "https://crests.football-data.org/86.png" },
      { name: "Barcelona",       shortName: "BAR", crest: "https://crests.football-data.org/81.png" },
      { name: "Atletico Madrid", shortName: "ATM", crest: "https://crests.football-data.org/78.png" },
      { name: "Real Betis",      shortName: "BET", crest: "https://crests.football-data.org/90.png" },
      { name: "Real Sociedad",   shortName: "RSO", crest: "https://crests.football-data.org/92.svg" },
      { name: "Villarreal",      shortName: "VIL", crest: "https://crests.football-data.org/94.png" },
      { name: "Valencia",        shortName: "VAL", crest: "https://crests.football-data.org/95.png" },
      { name: "Sevilla",         shortName: "SEV", crest: "https://crests.football-data.org/77.png" },
      { name: "Athletic Club",   shortName: "ATH", crest: "https://crests.football-data.org/80.png" },
      { name: "Getafe",          shortName: "GET", crest: "https://crests.football-data.org/89.svg" },
    ]
  },
  {
    name: "Bundesliga", code: "BL1", id: 2002,
    live: 3, upcoming: 14, finished: 17,   // Bundesliga tends to play Fri–Sun, slightly fewer future fixtures visible
    teams: [
      { name: "Bayern Munich",       shortName: "BAY", crest: "https://crests.football-data.org/5.png" },
      { name: "Bayer Leverkusen",    shortName: "B04", crest: "https://crests.football-data.org/3.png" },
      { name: "Borussia Dortmund",   shortName: "BVB", crest: "https://crests.football-data.org/4.png" },
      { name: "RB Leipzig",          shortName: "RBL", crest: "https://crests.football-data.org/721.png" },
      { name: "Eintracht Frankfurt", shortName: "SGE", crest: "https://crests.football-data.org/19.png" },
      { name: "VfB Stuttgart",       shortName: "VFB", crest: "https://crests.football-data.org/10.png" },
      { name: "Borussia M'gladbach", shortName: "BMG", crest: "https://crests.football-data.org/18.png" },
      { name: "SC Freiburg",         shortName: "SCF", crest: "https://crests.football-data.org/17.png" },
    ]
  },
  {
    name: "Ligue 1", code: "FL1", id: 2015,
    live: 2, upcoming: 16, finished: 13,
    teams: [
      { name: "Paris Saint-Germain", shortName: "PSG", crest: "https://crests.football-data.org/524.png" },
      { name: "Marseille",           shortName: "OLM", crest: "https://crests.football-data.org/516.png" },
      { name: "Lyon",                shortName: "OL",  crest: "https://crests.football-data.org/523.png" },
      { name: "Monaco",              shortName: "ASM", crest: "https://crests.football-data.org/548.png" },
      { name: "Lille",               shortName: "LOS", crest: "https://crests.football-data.org/521.png" },
      { name: "Lens",                shortName: "LEN", crest: "https://crests.football-data.org/546.png" },
      { name: "Rennes",              shortName: "REN", crest: "https://crests.football-data.org/529.png" },
      { name: "Nice",                shortName: "OGC", crest: "https://crests.football-data.org/522.png" },
    ]
  },
  {
    name: "Serie A", code: "SA", id: 2019,
    live: 5, upcoming: 19, finished: 16,
    teams: [
      { name: "Inter Milan",  shortName: "INT", crest: "https://crests.football-data.org/108.png" },
      { name: "Juventus",     shortName: "JUV", crest: "https://crests.football-data.org/109.png" },
      { name: "AC Milan",     shortName: "MIL", crest: "https://crests.football-data.org/98.png" },
      { name: "Napoli",       shortName: "NAP", crest: "https://crests.football-data.org/113.png" },
      { name: "Roma",         shortName: "ROM", crest: "https://crests.football-data.org/100.png" },
      { name: "Lazio",        shortName: "LAZ", crest: "https://crests.football-data.org/110.png" },
      { name: "Atalanta",     shortName: "ATA", crest: "https://crests.football-data.org/102.png" },
      { name: "Fiorentina",   shortName: "FIO", crest: "https://crests.football-data.org/99.png" },
      { name: "Torino",       shortName: "TOR", crest: "https://crests.football-data.org/586.png" },
    ]
  },
  {
    name: "Champions League", code: "CL", id: 2001,
    live: 2, upcoming: 6, finished: 14,  // Mid-QF stage: 2 legs live, 2 SF + Final upcoming, plenty of R16+QF done
    isCL: true,
    teams: [
      { name: "Real Madrid",         shortName: "RMA", crest: "https://crests.football-data.org/86.png" },
      { name: "Bayern Munich",       shortName: "BAY", crest: "https://crests.football-data.org/5.png" },
      { name: "Manchester City",     shortName: "MCI", crest: "https://crests.football-data.org/65.png" },
      { name: "Paris Saint-Germain", shortName: "PSG", crest: "https://crests.football-data.org/524.png" },
      { name: "Juventus",            shortName: "JUV", crest: "https://crests.football-data.org/109.png" },
      { name: "Liverpool",           shortName: "LIV", crest: "https://crests.football-data.org/64.png" },
      { name: "Inter Milan",         shortName: "INT", crest: "https://crests.football-data.org/108.png" },
      { name: "Arsenal",             shortName: "ARS", crest: "https://crests.football-data.org/57.png" },
      { name: "Barcelona",           shortName: "BAR", crest: "https://crests.football-data.org/81.png" },
      { name: "Atletico Madrid",     shortName: "ATM", crest: "https://crests.football-data.org/78.png" },
      { name: "Borussia Dortmund",   shortName: "BVB", crest: "https://crests.football-data.org/4.png" },
      { name: "AC Milan",            shortName: "MIL", crest: "https://crests.football-data.org/98.png" },
    ]
  },
];

const CL_STAGE_UPCOMING  = ["Quarter-final (2nd leg)", "Semi-final (1st leg)", "Semi-final (2nd leg)", "Final"];
const CL_STAGE_LIVE      = ["Quarter-final (1st leg)", "Quarter-final (2nd leg)"];
const CL_STAGE_FINISHED  = ["Round of 16 (1st leg)", "Round of 16 (2nd leg)", "Quarter-final (1st leg)"];
const PL_UPCOMING_GW     = ["Matchweek 32","Matchweek 33","Matchweek 34","Matchweek 35","Matchweek 36","Matchweek 37","Matchweek 38"];
const PL_FINISHED_GW     = ["Matchweek 25","Matchweek 26","Matchweek 27","Matchweek 28","Matchweek 29","Matchweek 30","Matchweek 31"];

// Deterministic seeded rand
let seed = 77;
function rand(max) {
  seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
  return seed % max;
}

let matchId = 1000;
const allMatches = [];

leagues.forEach(league => {
  const t = league.teams;
  const isCL = !!league.isCL;

  // Pair tracker — allow same pair across statuses but not within
  const used = { live: new Set(), upcoming: new Set(), finished: new Set() };
  function pickPair(bucket) {
    let h, a, key, tries = 0;
    do {
      h = rand(t.length); a = rand(t.length);
      key = `${Math.min(h,a)}-${Math.max(h,a)}`;
      tries++;
    } while ((h === a || used[bucket].has(key)) && tries < 100);
    used[bucket].add(key);
    return [h, a];
  }

  // ── LIVE ──
  for (let i = 0; i < league.live; i++) {
    const [hi, ai] = pickPair('live');
    const minute = rand(85) + 5;
    const hg = rand(4);
    const ag = rand(3);
    const poss = 36 + rand(28);
    allMatches.push({
      id: ++matchId,
      competition: { id: league.id, name: league.name, code: league.code },
      utcDate: new Date().toISOString(),
      status: "IN_PLAY",
      minute,
      homeTeam: { name: t[hi].name, shortName: t[hi].shortName, crest: t[hi].crest },
      awayTeam: { name: t[ai].name, shortName: t[ai].shortName, crest: t[ai].crest },
      score: { home: hg, away: ag },
      stats: {
        possession: `${poss}% - ${100 - poss}%`,
        xG: `${(hg * 0.7 + rand(10) / 10).toFixed(1)} - ${(ag * 0.7 + rand(10) / 10).toFixed(1)}`,
      },
      group: isCL ? CL_STAGE_LIVE[rand(CL_STAGE_LIVE.length)] : "Matchweek 31",
    });
  }

  // ── UPCOMING ──
  for (let i = 0; i < league.upcoming; i++) {
    const [hi, ai] = pickPair('upcoming');
    const daysAhead = rand(30) + 1;
    const ko = new Date();
    ko.setDate(ko.getDate() + daysAhead);
    ko.setHours([13,14,15,16,17,18,19,20,21][rand(9)], 0, 0, 0);
    allMatches.push({
      id: ++matchId,
      competition: { id: league.id, name: league.name, code: league.code },
      utcDate: ko.toISOString(),
      status: "SCHEDULED",
      minute: null,
      homeTeam: { name: t[hi].name, shortName: t[hi].shortName, crest: t[hi].crest },
      awayTeam: { name: t[ai].name, shortName: t[ai].shortName, crest: t[ai].crest },
      score: { home: null, away: null },
      stats: {},
      group: isCL
        ? CL_STAGE_UPCOMING[rand(CL_STAGE_UPCOMING.length)]
        : PL_UPCOMING_GW[rand(PL_UPCOMING_GW.length)],
    });
  }

  // ── FINISHED ──
  for (let i = 0; i < league.finished; i++) {
    const [hi, ai] = pickPair('finished');
    const daysAgo = rand(28) + 1;
    const played = new Date();
    played.setDate(played.getDate() - daysAgo);
    const hg = rand(5);
    const ag = rand(4);
    const poss = 36 + rand(28);
    allMatches.push({
      id: ++matchId,
      competition: { id: league.id, name: league.name, code: league.code },
      utcDate: played.toISOString(),
      status: "FINISHED",
      minute: null,
      homeTeam: { name: t[hi].name, shortName: t[hi].shortName, crest: t[hi].crest },
      awayTeam: { name: t[ai].name, shortName: t[ai].shortName, crest: t[ai].crest },
      score: { home: hg, away: ag },
      stats: {
        possession: `${poss}% - ${100 - poss}%`,
        xG: `${(hg * 0.65 + rand(12) / 10).toFixed(1)} - ${(ag * 0.65 + rand(12) / 10).toFixed(1)}`,
        shotsOnTarget: `${hg * 2 + rand(4) + 1} - ${ag * 2 + rand(4) + 1}`,
      },
      group: isCL
        ? CL_STAGE_FINISHED[rand(CL_STAGE_FINISHED.length)]
        : PL_FINISHED_GW[rand(PL_FINISHED_GW.length)],
    });
  }
});

fs.writeFileSync(path.join(__dirname, 'matches.json'), JSON.stringify({ matches: allMatches }, null, 2));
console.log(`\nGenerated ${allMatches.length} total matches:\n`);
leagues.forEach(l => {
  const lm = allMatches.filter(m => m.competition.code === l.code);
  console.log(`  ${l.name.padEnd(22)} ${lm.filter(m=>m.status==='IN_PLAY').length} live  |  ${lm.filter(m=>m.status==='SCHEDULED').length} upcoming  |  ${lm.filter(m=>m.status==='FINISHED').length} finished`);
});
