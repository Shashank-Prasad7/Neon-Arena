const express = require('express');
const path = require('path');
const fs = require('fs');
const postgres = require('../db/postgres');

const router = express.Router();

const CUSTOM_TEAMS_PATH = path.join(__dirname, '..', 'data', 'custom-teams.json');
const PLAYERS_PATH = path.join(__dirname, '..', 'data', 'players.json');
const FORMATIONS_PATH = path.join(__dirname, '..', 'data', 'formations.json');
const WORLD_CUP_PATH = path.join(__dirname, '..', 'data', 'worldcup-groups.json');

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function loadPlayers() {
  return readJson(PLAYERS_PATH, []);
}

function loadFormations() {
  return readJson(FORMATIONS_PATH, []);
}

function loadWorldCup() {
  return readJson(WORLD_CUP_PATH, { nations: [] });
}

function loadCustomTeams() {
  return readJson(CUSTOM_TEAMS_PATH, []);
}

function saveCustomTeams(teams) {
  writeJson(CUSTOM_TEAMS_PATH, teams);
}

async function loadCustomTeamsAsync() {
  if (!postgres.hasPostgres()) return loadCustomTeams();
  const result = await postgres.query('SELECT * FROM custom_teams ORDER BY updated_at DESC');
  return result.rows.map((row) => ({
    id: row.id || Date.now(),
    slug: row.slug,
    name: row.name,
    manager: row.manager,
    formationId: row.formation_id,
    starters: Array.isArray(row.starters) ? row.starters : [],
    substitutes: Array.isArray(row.substitutes) ? row.substitutes : [],
    competitions: Array.isArray(row.competitions) ? row.competitions : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function dedupeNumbers(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => Number(value)).filter(Boolean))];
}

function averageRating(players) {
  if (!players.length) return 70;
  return Math.round(players.reduce((sum, player) => sum + (Number(player.rating) || 70), 0) / players.length);
}

function pickRandom(items, count, excluded = new Set()) {
  const pool = items.filter((item) => !excluded.has(item));
  const copy = [...pool];
  const result = [];

  while (copy.length && result.length < count) {
    const index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }

  return result;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scoreMatch(teamStrength, opponentStrength, allowDraw = true) {
  const strengthDiff = (teamStrength - opponentStrength) / 18;
  const homeBase = Math.max(0, Math.round(Math.random() * 2 + strengthDiff));
  const awayBase = Math.max(0, Math.round(Math.random() * 2 - strengthDiff));

  let homeScore = homeBase;
  let awayScore = awayBase;

  if (!allowDraw && homeScore === awayScore) {
    if (Math.random() > 0.5) homeScore += 1;
    else awayScore += 1;
  }

  return { homeScore, awayScore };
}

function generateLiveMinute() {
  const minute = randomInt(17, 89);
  return `${minute}'`;
}

function teamCard(team, playersById) {
  const starters = (team.starters || []).map((id) => playersById.get(id)).filter(Boolean);
  const substitutes = (team.substitutes || []).map((id) => playersById.get(id)).filter(Boolean);
  const squad = [...starters, ...substitutes];

  return {
    ...team,
    starters,
    substitutes,
    squad,
    overall: averageRating(starters),
  };
}

function stageOrder(competition, stage) {
  const worldCupStages = ['Group Stage', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final', 'Champions'];
  const championsLeagueStages = ['League Phase', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final', 'Champions'];
  const order = competition === 'worldcup' ? worldCupStages : championsLeagueStages;
  return order.indexOf(stage);
}

function makeMatch(id, competitionLabel, stage, status, homeTeam, awayTeam, homeRating, awayRating, venue, extra = {}) {
  const allowDraw = stage === 'Group Stage' || stage === 'League Phase' || status !== 'FINISHED';
  const score = scoreMatch(homeRating, awayRating, allowDraw);
  return {
    id,
    competition: competitionLabel,
    stage,
    status,
    minute: status === 'LIVE' ? generateLiveMinute() : status === 'FINISHED' ? 'FT' : extra.kickoff || `${randomInt(18, 23)}:${Math.random() > 0.5 ? '00' : '30'}`,
    venue,
    homeTeam,
    awayTeam,
    homeScore: status === 'UPCOMING' ? null : score.homeScore,
    awayScore: status === 'UPCOMING' ? null : score.awayScore,
    analysis: extra.analysis || '',
  };
}

function finishedAnalysis(teamName, opponent, competitionLabel, stage) {
  return `${teamName} and ${opponent} produced a sharp ${competitionLabel} ${stage.toLowerCase()} battle, with the key swing coming from control in the decisive moments.`;
}

function upcomingAnalysis(teamName, opponent, competitionLabel, stage) {
  return `${teamName} is preparing for ${opponent} in the ${competitionLabel} ${stage.toLowerCase()}, where shape, tempo, and squad freshness could decide the tie.`;
}

function buildWorldCupSimulation(team) {
  const data = loadWorldCup();
  const competition = 'World Cup';
  const stageResults = ['Group Stage', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final', 'Champions'];
  const stageReached = stageResults[randomInt(0, stageResults.length - 1)];
  const nations = (data.nations || []).map((nation) => nation.name).filter((name) => name !== team.name);
  const teamStrength = team.overall;
  const usedNames = new Set([team.name]);
  const finishedMatches = [];
  const liveMatches = [];
  const upcomingMatches = [];

  const groupOpponents = pickRandom(nations, 3, usedNames);
  const groupVenues = ['Lusail Stadium', 'Al Bayt Stadium', 'Education City Stadium'];
  let record = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };

  groupOpponents.forEach((opponent, index) => {
    const opponentStrength = randomInt(74, 90);
    const match = makeMatch(`wc-group-${index}`, competition, 'Group Stage', 'FINISHED', team.name, opponent, teamStrength, opponentStrength, groupVenues[index], {
      analysis: finishedAnalysis(team.name, opponent, competition, 'Group Stage'),
    });
    finishedMatches.push(match);
    record.goalsFor += match.homeScore;
    record.goalsAgainst += match.awayScore;
    if (match.homeScore > match.awayScore) record.wins += 1;
    else if (match.homeScore === match.awayScore) record.draws += 1;
    else record.losses += 1;
    usedNames.add(opponent);
  });

  const knockoutRounds = [
    { stage: 'Round of 16', venue: 'Stadium 974' },
    { stage: 'Quarter-finals', venue: 'Al Janoub Stadium' },
    { stage: 'Semi-finals', venue: 'Khalifa International Stadium' },
    { stage: 'Final', venue: 'Lusail Stadium' },
  ];

  const reachedIndex = stageOrder('worldcup', stageReached);

  knockoutRounds.forEach((round, index) => {
    const opponent = pickRandom(nations, 1, usedNames)[0] || `Nation ${index + 1}`;
    usedNames.add(opponent);
    const opponentStrength = randomInt(78, 92);
    const roundStageIndex = stageOrder('worldcup', round.stage);

    if (roundStageIndex < reachedIndex || stageReached === 'Champions') {
      const match = makeMatch(`wc-finished-${index}`, competition, round.stage, 'FINISHED', team.name, opponent, teamStrength, opponentStrength, round.venue, {
        analysis: finishedAnalysis(team.name, opponent, competition, round.stage),
      });

      if (match.homeScore === match.awayScore) {
        match.homeScore += 1;
      }

      finishedMatches.push(match);
      record.goalsFor += match.homeScore;
      record.goalsAgainst += match.awayScore;
      record.wins += 1;
      return;
    }

    if (roundStageIndex === reachedIndex && stageReached !== 'Champions') {
      if (Math.random() > 0.5) {
        const match = makeMatch(`wc-live-${index}`, competition, round.stage, 'LIVE', team.name, opponent, teamStrength, opponentStrength, round.venue, {
          analysis: `${team.name} is still in the balance here with the knockout tie alive.`,
        });
        liveMatches.push(match);
      } else {
        const match = makeMatch(`wc-finished-exit-${index}`, competition, round.stage, 'FINISHED', team.name, opponent, teamStrength, opponentStrength, round.venue, {
          analysis: `${team.name} fell short once the match opened up late against ${opponent}.`,
        });
        if (match.homeScore >= match.awayScore) {
          match.awayScore = match.homeScore + 1;
        }
        finishedMatches.push(match);
        record.goalsFor += match.homeScore;
        record.goalsAgainst += match.awayScore;
        record.losses += 1;
      }
      return;
    }

    if (roundStageIndex > reachedIndex && stageReached !== 'Champions') {
      upcomingMatches.push(makeMatch(`wc-upcoming-${index}`, competition, round.stage, 'UPCOMING', team.name, opponent, teamStrength, opponentStrength, round.venue, {
        kickoff: `${randomInt(18, 22)}:${Math.random() > 0.5 ? '00' : '30'}`,
        analysis: upcomingAnalysis(team.name, opponent, competition, round.stage),
      }));
    }
  });

  if (!liveMatches.length) {
    const otherLiveOpponents = pickRandom(nations, 2, usedNames);
    if (otherLiveOpponents.length === 2) {
      liveMatches.push(makeMatch('wc-neutral-live', competition, 'Semi-finals', 'LIVE', otherLiveOpponents[0], otherLiveOpponents[1], randomInt(80, 92), randomInt(80, 92), 'MetLife Stadium', {
        analysis: 'The other side of the bracket is still moving in real time.',
      }));
    }
  }

  if (!upcomingMatches.length) {
    const neutralUpcoming = pickRandom(nations, 2, usedNames);
    if (neutralUpcoming.length === 2) {
      upcomingMatches.push(makeMatch('wc-neutral-upcoming', competition, 'Third Place Playoff', 'UPCOMING', neutralUpcoming[0], neutralUpcoming[1], randomInt(76, 90), randomInt(76, 90), 'AT&T Stadium', {
        kickoff: `${randomInt(18, 22)}:${Math.random() > 0.5 ? '00' : '30'}`,
        analysis: `Even outside ${team.name}'s own path, the World Cup schedule still has major fixtures ahead.`,
      }));
    }
  }

  const trophyWon = stageReached === 'Champions';
  const resultLabel = trophyWon ? `${team.name} lifted the World Cup.` : stageReached === 'Group Stage' ? `${team.name} did not survive the group.` : `${team.name} reached the ${stageReached.toLowerCase()}.`;

  return {
    competition,
    team: { name: team.name, formationId: team.formationId, manager: team.manager || 'User Manager', overall: team.overall },
    summary: {
      stageReached,
      trophyWon,
      resultLabel,
      record,
    },
    liveMatches,
    upcomingMatches,
    finishedMatches,
  };
}

function buildChampionsLeagueSimulation(team, allClubNames) {
  const competition = 'Champions League';
  const stageResults = ['League Phase', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final', 'Champions'];
  const stageReached = stageResults[randomInt(0, stageResults.length - 1)];
  const clubPool = allClubNames.filter((name) => name !== team.name);
  const teamStrength = team.overall;
  const usedNames = new Set([team.name]);
  const finishedMatches = [];
  const liveMatches = [];
  const upcomingMatches = [];
  let record = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };

  pickRandom(clubPool, 4, usedNames).forEach((opponent, index) => {
    usedNames.add(opponent);
    const match = makeMatch(`ucl-league-${index}`, competition, 'League Phase', 'FINISHED', team.name, opponent, teamStrength, randomInt(77, 92), 'Neon Arena Park', {
      analysis: finishedAnalysis(team.name, opponent, competition, 'League Phase'),
    });
    finishedMatches.push(match);
    record.goalsFor += match.homeScore;
    record.goalsAgainst += match.awayScore;
    if (match.homeScore > match.awayScore) record.wins += 1;
    else if (match.homeScore === match.awayScore) record.draws += 1;
    else record.losses += 1;
  });

  const knockoutRounds = [
    { stage: 'Round of 16', venue: 'Santiago Bernabeu' },
    { stage: 'Quarter-finals', venue: 'San Siro' },
    { stage: 'Semi-finals', venue: 'Allianz Arena' },
    { stage: 'Final', venue: 'Wembley Stadium' },
  ];

  const reachedIndex = stageOrder('champions-league', stageReached);

  knockoutRounds.forEach((round, index) => {
    const opponent = pickRandom(clubPool, 1, usedNames)[0] || `Club ${index + 1}`;
    usedNames.add(opponent);
    const opponentStrength = randomInt(80, 94);
    const roundStageIndex = stageOrder('champions-league', round.stage);

    if (roundStageIndex < reachedIndex || stageReached === 'Champions') {
      const match = makeMatch(`ucl-finished-${index}`, competition, round.stage, 'FINISHED', team.name, opponent, teamStrength, opponentStrength, round.venue, {
        analysis: finishedAnalysis(team.name, opponent, competition, round.stage),
      });
      if (match.homeScore === match.awayScore) match.homeScore += 1;
      finishedMatches.push(match);
      record.goalsFor += match.homeScore;
      record.goalsAgainst += match.awayScore;
      record.wins += 1;
      return;
    }

    if (roundStageIndex === reachedIndex && stageReached !== 'Champions') {
      if (Math.random() > 0.45) {
        liveMatches.push(makeMatch(`ucl-live-${index}`, competition, round.stage, 'LIVE', team.name, opponent, teamStrength, opponentStrength, round.venue, {
          analysis: 'The tie is live and still open enough to swing either way.',
        }));
      } else {
        const exitMatch = makeMatch(`ucl-exit-${index}`, competition, round.stage, 'FINISHED', team.name, opponent, teamStrength, opponentStrength, round.venue, {
          analysis: `${team.name} was punished on the break in the decisive spell by ${opponent}.`,
        });
        if (exitMatch.homeScore >= exitMatch.awayScore) exitMatch.awayScore = exitMatch.homeScore + 1;
        finishedMatches.push(exitMatch);
        record.goalsFor += exitMatch.homeScore;
        record.goalsAgainst += exitMatch.awayScore;
        record.losses += 1;
      }
      return;
    }

    if (roundStageIndex > reachedIndex && stageReached !== 'Champions') {
      upcomingMatches.push(makeMatch(`ucl-upcoming-${index}`, competition, round.stage, 'UPCOMING', team.name, opponent, teamStrength, opponentStrength, round.venue, {
        kickoff: `${randomInt(19, 22)}:${Math.random() > 0.5 ? '00' : '45'}`,
        analysis: upcomingAnalysis(team.name, opponent, competition, round.stage),
      }));
    }
  });

  if (!liveMatches.length) {
    const others = pickRandom(clubPool, 2, usedNames);
    if (others.length === 2) {
      liveMatches.push(makeMatch('ucl-neutral-live', competition, 'Quarter-finals', 'LIVE', others[0], others[1], randomInt(79, 93), randomInt(79, 93), 'Parc des Princes', {
        analysis: 'The rest of the bracket remains active around your campaign.',
      }));
    }
  }

  if (!upcomingMatches.length) {
    const neutralUpcoming = pickRandom(clubPool, 2, usedNames);
    if (neutralUpcoming.length === 2) {
      upcomingMatches.push(makeMatch('ucl-neutral-upcoming', competition, 'Super Sunday', 'UPCOMING', neutralUpcoming[0], neutralUpcoming[1], randomInt(79, 93), randomInt(79, 93), 'San Siro', {
        kickoff: `${randomInt(19, 22)}:${Math.random() > 0.5 ? '00' : '45'}`,
        analysis: `The bracket still has heavyweight club fixtures coming even after ${team.name}'s latest result.`,
      }));
    }
  }

  const trophyWon = stageReached === 'Champions';
  const resultLabel = trophyWon ? `${team.name} became champions of Europe.` : stageReached === 'League Phase' ? `${team.name} stalled in the league phase.` : `${team.name} made it to the ${stageReached.toLowerCase()}.`;

  return {
    competition,
    team: { name: team.name, formationId: team.formationId, manager: team.manager || 'User Manager', overall: team.overall },
    summary: {
      stageReached,
      trophyWon,
      resultLabel,
      record,
    },
    liveMatches,
    upcomingMatches,
    finishedMatches,
  };
}

router.get('/teams', async (req, res) => {
  const players = loadPlayers();
  const playersById = new Map(players.map((player) => [Number(player.id), player]));
  const teams = (await loadCustomTeamsAsync()).map((team) => teamCard(team, playersById));
  res.json({ success: true, teams });
});

router.post('/teams', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const formationId = String(req.body?.formationId || '4-3-3').trim();
  const starters = dedupeNumbers(req.body?.starters);
  const substitutes = dedupeNumbers(req.body?.substitutes).filter((id) => !starters.includes(id));

  if (!name) {
    return res.status(400).json({ success: false, error: 'Team name is required.' });
  }

  if (starters.length < 11) {
    return res.status(400).json({ success: false, error: 'Select all 11 starters before saving the team.' });
  }

  const players = loadPlayers();
  const playersById = new Map(players.map((player) => [Number(player.id), player]));
  const startersResolved = starters.map((id) => playersById.get(id)).filter(Boolean);

  if (startersResolved.length < 11) {
    return res.status(400).json({ success: false, error: 'Some selected starters no longer exist in the player database.' });
  }

  const now = new Date().toISOString();
  const teams = await loadCustomTeamsAsync();
  const existingIndex = teams.findIndex((team) => team.slug === slugify(name));
  const payload = {
    id: existingIndex >= 0 ? teams[existingIndex].id : Date.now(),
    slug: slugify(name),
    name,
    manager: String(req.body?.manager || 'User Manager'),
    formationId,
    starters,
    substitutes,
    competitions: ['worldcup', 'champions-league'],
    createdAt: existingIndex >= 0 ? teams[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (postgres.hasPostgres()) {
    await postgres.query(
      `INSERT INTO custom_teams (slug, name, manager, formation_id, starters, substitutes, competitions, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, COALESCE((SELECT created_at FROM custom_teams WHERE slug = $1), NOW()), NOW())
       ON CONFLICT (slug)
       DO UPDATE SET name = EXCLUDED.name, manager = EXCLUDED.manager, formation_id = EXCLUDED.formation_id, starters = EXCLUDED.starters, substitutes = EXCLUDED.substitutes, competitions = EXCLUDED.competitions, updated_at = NOW()`,
      [payload.slug, payload.name, payload.manager, payload.formationId, JSON.stringify(payload.starters), JSON.stringify(payload.substitutes), JSON.stringify(payload.competitions)]
    );
  } else {
    if (existingIndex >= 0) teams[existingIndex] = payload;
    else teams.push(payload);
    saveCustomTeams(teams);
  }
  res.json({ success: true, team: teamCard(payload, playersById) });
});

router.get('/simulate', async (req, res) => {
  const competition = String(req.query?.competition || 'worldcup').toLowerCase();
  const teamSlug = slugify(req.query?.team);
  const players = loadPlayers();
  const playersById = new Map(players.map((player) => [Number(player.id), player]));
  const teams = await loadCustomTeamsAsync();
  const team = teams.find((entry) => entry.slug === teamSlug || slugify(entry.name) === teamSlug);

  if (!team) {
    return res.status(404).json({ success: false, error: 'Custom team not found.' });
  }

  const hydratedTeam = teamCard(team, playersById);
  const clubNames = [...new Set(loadFormations().map((entry) => entry.club).concat(players.map((player) => player.club)))];
  const simulation = competition === 'champions-league'
    ? buildChampionsLeagueSimulation(hydratedTeam, clubNames)
    : buildWorldCupSimulation(hydratedTeam);

  res.json({ success: true, simulation });
});

module.exports = router;
