import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('neon_arena_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────
export const register = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

// ── Public ────────────────────────────────────────────────────────────────
export const getStats = () => api.get('/stats');
export const getPlayers = (params?: Record<string, string>) => api.get('/players', { params });
export const createPlayer = (data: {
  name: string;
  position: string;
  club: string;
  nationality: string;
  age?: string | number;
}) => api.post('/players', data);
export const getFormations = () => api.get('/tactics/formations');
export const saveFormation = (data: any) => api.post('/tactics/save', data);
export const getPlayer = (id: number | string) => api.get(`/players/${id}`);
export const subscribeNewsletter = (email: string) =>
  api.post('/newsletter/subscribe', { email });
export const getWorldCup = () => api.get('/worldcup');
export const getCustomTeams = () => api.get('/tournaments/teams');
export const saveCustomTeam = (data: {
  name: string;
  formationId: string;
  manager?: string;
  starters: number[];
  substitutes: number[];
}) => api.post('/tournaments/teams', data);
export const simulateTournament = (team: string, competition: 'worldcup' | 'champions-league') =>
  api.get('/tournaments/simulate', { params: { team, competition } });

// ── Football (auth required) ──────────────────────────────────────────────
export const getLiveMatches = () => api.get('/football/matches/live');
export const getMatches = (competition = 'PL') =>
  api.get('/football/matches', { params: { competition } });
export const getStandings = (competition = 'PL') =>
  api.get('/football/standings', { params: { competition } });

export default api;
