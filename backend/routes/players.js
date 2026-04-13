const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const PLAYERS_PATH = path.join(__dirname, '..', 'data', 'players.json');

function loadPlayers() {
  return JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));
}

function savePlayers(players) {
  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
}

function buildShortName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}

function slugCode(name) {
  const normalized = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim();

  const known = {
    england: 'gb-eng',
    france: 'fr',
    brazil: 'br',
    argentina: 'ar',
    germany: 'de',
    spain: 'es',
    portugal: 'pt',
    netherlands: 'nl',
    croatia: 'hr',
    morocco: 'ma',
    japan: 'jp',
    italy: 'it',
    usa: 'us',
    'united states': 'us',
    mexico: 'mx',
    belgium: 'be',
    switzerland: 'ch',
    denmark: 'dk',
    senegal: 'sn',
    ghana: 'gh',
    ireland: 'ie',
    sweden: 'se',
  };

  if (known[normalized]) return known[normalized];

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'un';
  if (words.length === 1) return words[0].slice(0, 2);
  return `${words[0][0]}${words[1][0]}`;
}

function buildPlayer(payload, players) {
  const nextId = players.reduce((max, player) => Math.max(max, player.id), 0) + 1;
  const numberPool = new Set(players.map((player) => player.number));
  let number = (nextId % 99) || 99;

  while (numberPool.has(number)) {
    number = (number % 99) + 1;
  }

  const position = payload.position || 'Midfielder';
  const name = String(payload.name || '').trim();
  const nationality = String(payload.nationality || 'International').trim();
  const club = String(payload.club || 'Free Agents').trim();
  const age = Number(payload.age) || 22;

  const defaultsByPosition = {
    Goalkeeper: { pace: 54, shooting: 22, passing: 60, dribbling: 48, defending: 72, physical: 70 },
    Defender: { pace: 68, shooting: 42, passing: 64, dribbling: 58, defending: 78, physical: 76 },
    Midfielder: { pace: 72, shooting: 66, passing: 76, dribbling: 74, defending: 64, physical: 70 },
    Winger: { pace: 82, shooting: 72, passing: 70, dribbling: 82, defending: 44, physical: 64 },
    Forward: { pace: 80, shooting: 78, passing: 64, dribbling: 76, defending: 34, physical: 72 },
  };

  return {
    id: nextId,
    name,
    shortName: buildShortName(name),
    number,
    position,
    nationality,
    nationalityCode: slugCode(nationality),
    club,
    age,
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=72dcff&size=256`,
    rating: 70,
    badge: 'NEW SIGNING',
    stats: defaultsByPosition[position] || defaultsByPosition.Midfielder,
    seasonStats: {
      goals: 0,
      assists: 0,
      matches: 0,
      minutesPlayed: 0,
      passAccuracy: 80,
      shotsOnTarget: 0,
      tackles: 0,
      sprints: 0,
    },
    recentForm: [],
    careerHighlights: [
      'Added to the Neon Arena database on April 13, 2026',
      `${club} squad member registered for tactical depth`,
      `${nationality} player available for club and country selection`,
    ],
  };
}

// GET /api/players
router.get('/', (req, res) => {
  const { search, position, nationality, club, minRating, maxRating } = req.query;
  let players = loadPlayers();

  if (search) {
    const q = search.toLowerCase();
    players = players.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.club.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q)
    );
  }
  if (position) {
    players = players.filter(p => p.position.toLowerCase() === position.toLowerCase());
  }
  if (nationality) {
    players = players.filter(p => p.nationality.toLowerCase().includes(nationality.toLowerCase()));
  }
  if (club) {
    players = players.filter(p => p.club.toLowerCase().includes(club.toLowerCase()));
  }
  if (minRating) {
    players = players.filter(p => p.rating >= parseInt(minRating));
  }
  if (maxRating) {
    players = players.filter(p => p.rating <= parseInt(maxRating));
  }

  res.json({ players, total: players.length });
});

// GET /api/players/:id
router.get('/:id', (req, res) => {
  const players = loadPlayers();
  const player = players.find(p => p.id === parseInt(req.params.id));
  if (!player) return res.status(404).json({ error: 'Player not found' });
  res.json({ player });
});

router.post('/', (req, res) => {
  const players = loadPlayers();
  const name = String(req.body?.name || '').trim();

  if (!name) {
    return res.status(400).json({ error: 'Player name is required' });
  }

  const duplicate = players.find((player) => player.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    return res.status(409).json({ error: 'A player with that name already exists', player: duplicate });
  }

  const player = buildPlayer(req.body || {}, players);
  players.push(player);
  savePlayers(players);

  res.status(201).json({ success: true, player });
});

module.exports = router;
