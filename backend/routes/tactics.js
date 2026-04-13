const express = require('express');
const path = require('path');
const fs = require('fs');
const postgres = require('../db/postgres');

const router = express.Router();
const FORMATIONS_PATH = path.join(__dirname, '..', 'data', 'formations.json');
const STATE_PATH = path.join(__dirname, '..', 'data', 'tactics-state.json');

function loadFormations() {
  try {
    return JSON.parse(fs.readFileSync(FORMATIONS_PATH, 'utf-8'));
  } catch (err) {
    console.error('Critical: Failed to load formations.json', err);
    return [];
  }
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
  } catch (err) {
    return { club: {}, country: {} };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

async function loadStateAsync() {
  if (!postgres.hasPostgres()) return loadState();

  const result = await postgres.query('SELECT mode, team, formation_id, starters, substitutes, updated_at FROM tactics_state');
  const state = { club: {}, country: {} };

  result.rows.forEach((row) => {
    const mode = row.mode === 'country' ? 'country' : 'club';
    state[mode][row.team] = {
      formationId: row.formation_id,
      starters: Array.isArray(row.starters) ? row.starters : [],
      substitutes: Array.isArray(row.substitutes) ? row.substitutes : [],
      updatedAt: row.updated_at,
    };
  });

  return state;
}

router.get('/formations', async (req, res) => {
  res.json({ success: true, data: loadFormations(), savedState: await loadStateAsync() });
});

router.post('/save', async (req, res) => {
  const mode = req.body?.mode === 'country' ? 'country' : 'club';
  const team = String(req.body?.team || '').trim();

  if (!team) {
    return res.status(400).json({ success: false, error: 'Team key is required.' });
  }

  const payload = {
    formationId: req.body?.formationId || '4-3-3',
    starters: Array.isArray(req.body?.starters) ? req.body.starters : [],
    substitutes: Array.isArray(req.body?.substitutes) ? req.body.substitutes : [],
    updatedAt: new Date().toISOString(),
  };

  if (postgres.hasPostgres()) {
    await postgres.query(
      `INSERT INTO tactics_state (mode, team, formation_id, starters, substitutes, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, NOW())
       ON CONFLICT (mode, team)
       DO UPDATE SET formation_id = EXCLUDED.formation_id, starters = EXCLUDED.starters, substitutes = EXCLUDED.substitutes, updated_at = NOW()`,
      [mode, team, payload.formationId, JSON.stringify(payload.starters), JSON.stringify(payload.substitutes)]
    );
  } else {
    const state = loadState();
    state[mode][team] = payload;
    saveState(state);
  }

  res.json({ success: true, message: 'Formation synced to tactical state.', saved: payload });
});

module.exports = router;
