# ⚽ NEON ARENA — Elite Football Intelligence Platform

> A cinematic, full-stack football web application with live match data, tactical analysis, player scouting, World Cup tracking, and a WebGL animated interface.

### 🌐 [**Live Demo → neon-arena-mnq0.onrender.com**](https://neon-arena-mnq0.onrender.com/)

![NEON ARENA](https://img.shields.io/badge/Status-Active-2ff801?style=for-the-badge)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-neon--arena-72dcff?style=for-the-badge&logo=render)](https://neon-arena-mnq0.onrender.com/)
![React](https://img.shields.io/badge/React-18-72dcff?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-72dcff?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-72dcff?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-72dcff?style=for-the-badge&logo=tailwindcss)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 **Live Match Center** | Real-time scores across Champions League, Premier League, La Liga, Bundesliga, Ligue 1, Serie A |
| 🧠 **Tactical Hub** | Interactive pitch with PRO club formations and custom Team Builder |
| 🌍 **World Cup Hub** | Full FIFA World Cup 2026 group tables, live fixtures, and nations grid |
| 👤 **Player Discovery** | Search, filter, and compare up to 2 players with a hex radar chart |
| 📊 **Match Analytics** | Post-match stats, timeline of events, player ratings with Man of the Match |
| 🏆 **Tournament Center** | Simulate your custom team's run through the World Cup or Champions League |
| 🤖 **AI Scout Chatbot** | Context-aware football assistant embedded in every page |
| ✨ **WebGL Backgrounds** | Crystal shader and Celestial Matrix shader (Three.js) as live animated backdrops |
| 🖱️ **Cursor Sparks** | Framer Motion cursor trail effect on every page |
| 🔐 **JWT Auth** | Email/password registration and login with 7-day tokens |

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite 8** + **TypeScript** (strict mode, `verbatimModuleSyntax`)
- **Tailwind CSS v4** — CSS-first `@theme {}` configuration, no `tailwind.config.js`
- **React Router v6** — client-side routing
- **Framer Motion** — cursor effect and modal animations
- **Three.js** — Celestial Matrix WebGL background shader
- **Custom WebGL** — Crystal Shader (Voronoi domain warping, brand colour palette)
- **Axios** — API client with JWT interceptor

### Backend
- **Node.js** + **Express** — REST API on port 3001
- **SQLite** via `better-sqlite3` — zero-config, WAL mode
- **JWT** (`jsonwebtoken`) + **bcryptjs** — auth
- **football-data.org** free tier — live match data (graceful mock fallback when no key)
- **In-memory TTL cache** — reduces API calls (1 min live, 5 min matches, 30 min standings)

---

## 🗂 Project Structure

```
Football_WEB/
├── backend/
│   ├── data/               # Mock JSON (matches, players, worldcup, formations)
│   ├── db/                 # SQLite init + seed users
│   ├── middleware/         # JWT auth middleware
│   ├── routes/             # auth, football, players, newsletter, worldcup, tactics
│   ├── services/           # footballApi.js (API + fallback), cache.js
│   ├── server.js           # Express entry point
│   └── .env                # PORT, JWT_SECRET, FOOTBALL_API_KEY
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── home/       # HeroSection, StatsCounter, LiveMatchPanel, FeaturedPlayers
    │   │   ├── layout/     # Header, BottomNav
    │   │   ├── matches/    # MatchCard, MatchStatsModal, LeagueFilter, NewsTicker
    │   │   ├── players/    # PlayerCard, PlayerFilters, CompareDrawer
    │   │   └── ui/         # AuthModal, AIChatbot, crystal-shader, martrix-shader, ErrorBoundary
    │   ├── context/        # AuthContext (JWT + modal state)
    │   ├── pages/          # Home, MatchCenter, PlayerDiscovery, PlayerDetails,
    │   │                   # WorldCupHub, WorldCupMatchCenter, TacticalHub,
    │   │                   # TournamentCenter, WorldCupSimulation
    │   ├── services/       # api.ts (Axios instance)
    │   ├── types/          # All TypeScript interfaces
    │   └── utils/          # formations.ts
    └── vite.config.ts      # Tailwind v4 plugin + /api proxy → :3001
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### 1. Clone the repo
```bash
git clone https://github.com/Shashank-Prasad7/Neon-Arena.git
cd Neon-Arena
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=3001
JWT_SECRET=your_super_secret_key_here
FOOTBALL_API_KEY=          # Optional — leave empty to use mock data
FRONTEND_URL=http://localhost:5173
DB_PATH=./neon_arena.db
```

Start the backend:
```bash
node server.js
```

The server starts at **http://localhost:3001**. Without a `FOOTBALL_API_KEY` the app falls back to the rich mock dataset automatically.

### 3. Set up the frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### 4. Seed test accounts (optional)
```bash
cd backend
node db/seed.js
```

| Email | Password |
|---|---|
| alex@neonarena.com | password123 |
| jamie@neonarena.com | password123 |
| test@test.com | test123 |

---

## 🔑 API Keys (Optional)

Get a free key at [football-data.org](https://www.football-data.org/) and add it to `backend/.env`:

```env
FOOTBALL_API_KEY=your_key_here
```

Without it, the app uses the built-in mock dataset (108 matches across 6 leagues, 20 players, full World Cup data) — everything works out of the box.

---

## 📡 API Endpoints

### Public
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login, get JWT |
| `GET` | `/api/stats` | Live match count, countries, top scorers |
| `GET` | `/api/players` | All players (search, position, club, rating filters) |
| `GET` | `/api/players/:id` | Single player profile |
| `GET` | `/api/worldcup` | Full World Cup 2026 data |
| `POST` | `/api/newsletter/subscribe` | Newsletter signup |

### Protected (requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/football/matches/live` | All live matches |
| `GET` | `/api/football/matches?competition=CL` | Matches by league |
| `GET` | `/api/football/standings?competition=PL` | League standings |
| `GET` | `/api/tactics/formations` | Club formation data |
| `POST` | `/api/tactics/save` | Save custom team |

---

## 🚢 Deployment

### ✅ Live Instance
| Service | URL |
|---|---|
| **Full App** | [https://neon-arena-mnq0.onrender.com/](https://neon-arena-mnq0.onrender.com/) |

### Self-host: Frontend → Vercel
- Set root directory to `frontend/`
- The included `vercel.json` handles SPA rewrites

### Self-host: Backend → Railway / Render
- Set root directory to `backend/`
- The included `Procfile` sets `web: node server.js`
- Add environment variables in the dashboard

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#0e0e0f` |
| Primary (Cyan) | `#72dcff` |
| Secondary (Neon Green) | `#2ff801` |
| Headline font | Space Grotesk (Black Italic) |
| Body font | Manrope |
| Cards | Glassmorphism — `rgba(38,38,39,0.4)` + `backdrop-filter: blur(20px)` |

---

## 📄 License

MIT © 2026 [Shashank Prasad](https://github.com/Shashank-Prasad7)
