const express = require('express');
const path = require('path');
const fs = require('fs');

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

router.get('/formations', (req, res) => {
  res.json({ success: true, data: loadFormations(), savedState: loadState() });
});

router.post('/save', (req, res) => {
  const state = loadState();
  const mode = req.body?.mode === 'country' ? 'country' : 'club';
  const team = String(req.body?.team || '').trim();

  if (!team) {
    return res.status(400).json({ success: false, error: 'Team key is required.' });
  }

  state[mode][team] = {
    formationId: req.body?.formationId || '4-3-3',
    starters: Array.isArray(req.body?.starters) ? req.body.starters : [],
    substitutes: Array.isArray(req.body?.substitutes) ? req.body.substitutes : [],
    updatedAt: new Date().toISOString(),
  };

  saveState(state);
  res.json({ success: true, message: 'Formation synced to tactical state.', saved: state[mode][team] });
});

module.exports = router;
