const cache = require('./cache');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://api.football-data.org/v4';

// Cache TTLs in milliseconds
const TTL = {
  LIVE: 60 * 1000,          // 1 min
  MATCHES: 5 * 60 * 1000,   // 5 min
  STANDINGS: 30 * 60 * 1000,// 30 min
  TEAMS: 6 * 60 * 60 * 1000,// 6 hours
};

function loadMockFile(filename) {
  try {
    const filePath = path.join(__dirname, '..', 'data', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

async function fetchFromApi(endpoint) {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'X-Auth-Token': apiKey },
    });
    if (!res.ok) {
      console.warn(`Football API returned ${res.status} for ${endpoint}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`Football API fetch error: ${err.message}`);
    return null;
  }
}

async function getMatches(competition = 'PL') {
  const cacheKey = `matches:${competition}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const apiData = await fetchFromApi(
    `/competitions/${competition}/matches?status=LIVE,SCHEDULED,IN_PLAY`
  );

  if (apiData) {
    cache.set(cacheKey, apiData, TTL.MATCHES);
    return apiData;
  }

  // Fallback to mock
  const mock = loadMockFile('matches.json');
  if (mock) cache.set(cacheKey, mock, TTL.MATCHES);
  return mock;
}

async function getLiveMatches() {
  const cacheKey = 'matches:live';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const apiData = await fetchFromApi('/matches?status=LIVE,IN_PLAY');

  if (apiData) {
    cache.set(cacheKey, apiData, TTL.LIVE);
    return apiData;
  }

  const mock = loadMockFile('matches.json');
  if (mock) cache.set(cacheKey, mock, TTL.LIVE);
  return mock;
}

async function getStandings(competition = 'PL') {
  const cacheKey = `standings:${competition}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const apiData = await fetchFromApi(`/competitions/${competition}/standings`);

  if (apiData) {
    cache.set(cacheKey, apiData, TTL.STANDINGS);
    return apiData;
  }

  const mock = loadMockFile('standings.json');
  if (mock) cache.set(cacheKey, mock, TTL.STANDINGS);
  return mock;
}

async function getTeams(competition = 'PL') {
  const cacheKey = `teams:${competition}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const apiData = await fetchFromApi(`/competitions/${competition}/teams`);

  if (apiData) {
    cache.set(cacheKey, apiData, TTL.TEAMS);
    return apiData;
  }

  return { teams: [] };
}

module.exports = { getMatches, getLiveMatches, getStandings, getTeams };
