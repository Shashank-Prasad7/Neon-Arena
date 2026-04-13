const express = require('express');
const authMiddleware = require('../middleware/auth');
const footballApi = require('../services/footballApi');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// All football routes require authentication
router.use(authMiddleware);

function loadMockMatches() {
  const filePath = path.join(__dirname, '..', 'data', 'matches.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// GET /api/football/matches/live
router.get('/matches/live', async (req, res) => {
  try {
    const data = await footballApi.getLiveMatches();
    if (data && data.matches && data.matches.length > 0) return res.json(data);
    // Fallback: filter mock data for live matches
    const mock = loadMockMatches();
    const live = mock.matches.filter(m => ['IN_PLAY','LIVE','PAUSED'].includes(m.status));
    return res.json({ matches: live });
  } catch (err) {
    const mock = loadMockMatches();
    const live = mock.matches.filter(m => ['IN_PLAY','LIVE','PAUSED'].includes(m.status));
    res.json({ matches: live });
  }
});

// GET /api/football/matches?competition=PL
router.get('/matches', async (req, res) => {
  const { competition = 'PL' } = req.query;

  const mock = loadMockMatches();
  const mockFiltered = mock.matches.filter(m => m.competition?.code === competition);

  const LIVE_STATUSES     = ['IN_PLAY', 'LIVE', 'PAUSED'];
  const UPCOMING_STATUSES = ['SCHEDULED', 'TIMED'];
  const FINISHED_STATUSES = ['FINISHED'];

  try {
    const data = await footballApi.getMatches(competition);
    if (data && data.matches && data.matches.length > 0) {
      const apiMatches = data.matches.filter(m => m.competition?.code === competition);
      if (apiMatches.length > 0) {
        // Check which status buckets the real API covers
        const hasLive     = apiMatches.some(m => LIVE_STATUSES.includes(m.status));
        const hasUpcoming = apiMatches.some(m => UPCOMING_STATUSES.includes(m.status));
        const hasFinished = apiMatches.some(m => FINISHED_STATUSES.includes(m.status));

        // Supplement any empty bucket with mock data so the UI always has content
        const merged = [...apiMatches];
        if (!hasLive)     merged.push(...mockFiltered.filter(m => LIVE_STATUSES.includes(m.status)));
        if (!hasUpcoming) merged.push(...mockFiltered.filter(m => UPCOMING_STATUSES.includes(m.status)));
        if (!hasFinished) merged.push(...mockFiltered.filter(m => FINISHED_STATUSES.includes(m.status)));

        return res.json({ matches: merged });
      }
    }
  } catch (err) {}

  // Full fallback: serve mock data
  res.json({ matches: mockFiltered });
});

// GET /api/football/standings?competition=PL
router.get('/standings', async (req, res) => {
  const { competition = 'PL' } = req.query;
  try {
    const data = await footballApi.getStandings(competition);
    res.json(data || { standings: [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
});

module.exports = router;
