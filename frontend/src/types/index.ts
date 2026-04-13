export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface PlayerSeasonStats {
  goals: number;
  assists: number;
  matches: number;
  minutesPlayed: number;
  passAccuracy: number;
  shotsOnTarget: number;
  tackles: number;
  sprints: number;
}

export interface FormEntry {
  opponent: string;
  score: number;
  goals: number;
  assists: number;
}

export interface Player {
  id: number;
  name: string;
  shortName: string;
  number: number;
  position: string;
  nationality: string;
  nationalityCode: string;
  club: string;
  age: number;
  image: string;
  rating: number;
  badge: string | null;
  stats: PlayerStats;
  seasonStats: PlayerSeasonStats;
  recentForm: FormEntry[];
  careerHighlights: string[];
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  crest: string;
}

export interface MatchScore {
  home: number | null;
  away: number | null;
  aggregate?: string;
}

export interface MatchStats {
  possession?: string;
  xG?: string;
  shotsOnTarget?: string;
  winProbability?: string;
}

export interface Match {
  id: number;
  competition: { name: string; code: string; emblem: string };
  stage: string;
  group: string | null;
  status: 'IN_PLAY' | 'LIVE' | 'SCHEDULED' | 'FINISHED' | 'PAUSED';
  minute?: string | null;
  utcDate?: string;
  homeTeam: Team;
  awayTeam: Team;
  score: MatchScore;
  stats: MatchStats;
}

export interface Standing {
  name: string;
  code: string;
  P: number;
  W: number;
  D: number;
  L: number;
  GF: number;
  GA: number;
  GD: number;
  Pts: number;
  qualified: boolean;
}

export interface Group {
  name: string;
  teams: Standing[];
}

export interface Fixture {
  date: string;
  time: string;
  homeTeam: string;
  homeCode: string;
  awayTeam: string;
  awayCode: string;
  venue: string;
  group: string;
}

export interface Nation {
  name: string;
  code: string;
  group: string;
}

export interface FeaturedMatch {
  homeTeam: { name: string; code: string; ranking: number };
  awayTeam: { name: string; code: string; ranking: number };
  homeScore: number;
  awayScore: number;
  minute: string;
  status: string;
  stats: Record<string, string>;
  permutations: Array<{ type: string; text: string }>;
}

export interface WorldCupData {
  competition: string;
  stage: string;
  featuredMatches: FeaturedMatch[];
  groups: Group[];
  fixtures: Fixture[];
  nations: Nation[];
}

export interface TacticalSquadMember {
  id: number;
  name: string;
  position: string;
  status: 'Healthy' | 'Injured';
}

export interface FormationData {
  club: string;
  manager: string;
  formation: string;
  squad: TacticalSquadMember[];
}

export interface TacticalSavedRoster {
  formationId: string;
  starters: number[];
  substitutes: number[];
  updatedAt?: string;
}

export interface TacticalSavedState {
  club: Record<string, TacticalSavedRoster>;
  country: Record<string, TacticalSavedRoster>;
}

export interface FeaturedStats {
  liveMatches: number;
  activeCountries: number;
  topScorers: number;
}

export interface CustomTeam {
  id: number;
  slug: string;
  name: string;
  manager: string;
  formationId: string;
  starters: Player[];
  substitutes: Player[];
  squad: Player[];
  overall: number;
  competitions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TournamentMatch {
  id: string;
  competition: string;
  stage: string;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  minute: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  analysis?: string;
}

export interface TournamentSimulation {
  competition: string;
  team: {
    name: string;
    formationId: string;
    manager: string;
    overall: number;
  };
  summary: {
    stageReached: string;
    trophyWon: boolean;
    resultLabel: string;
    record: {
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
    };
  };
  liveMatches: TournamentMatch[];
  upcomingMatches: TournamentMatch[];
  finishedMatches: TournamentMatch[];
}
