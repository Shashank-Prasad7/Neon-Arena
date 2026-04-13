require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const footballRoutes = require('./routes/football');
const playersRoutes = require('./routes/players');
const newsletterRoutes = require('./routes/newsletter');
const tacticsRoutes = require('./routes/tactics');
const worldcupRoutes = require('./routes/worldcup');
const tournamentsRoutes = require('./routes/tournaments');
const { initPostgres, hasPostgres } = require('./db/postgres');

const app = express();
const PORT = process.env.PORT || 3001;
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
const hasFrontendBuild = fs.existsSync(frontendDistPath);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/tactics', tacticsRoutes);
app.use('/api/worldcup', worldcupRoutes);
app.use('/api/tournaments', tournamentsRoutes);

app.get('/api/stats', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'data', 'featured-stats.json');
    const stats = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Stats unavailable' });
  }
});

app.use('/api/football', footballRoutes);

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    if (hasPostgres()) {
      await initPostgres();
      console.log('   Postgres persistence: connected');
    } else {
      console.log('   Postgres persistence: not configured, using local fallback storage');
    }

    app.listen(PORT, () => {
      console.log(`\nNeon Arena API running on http://localhost:${PORT}`);
      console.log(`   Tactics endpoint: http://localhost:${PORT}/api/tactics/formations`);
      console.log(`   Football API key: ${process.env.FOOTBALL_API_KEY ? 'set' : 'not set (using mock data)'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
