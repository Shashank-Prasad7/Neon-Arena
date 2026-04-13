const { Pool } = require('pg');

let pool = null;

function hasPostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!hasPostgres()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

async function query(text, params = []) {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('DATABASE_URL is not configured');
  }
  return currentPool.query(text, params);
}

async function initPostgres() {
  if (!hasPostgres()) return false;

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS newsletter_subs (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS custom_players (
      id INTEGER PRIMARY KEY,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tactics_state (
      mode TEXT NOT NULL,
      team TEXT NOT NULL,
      formation_id TEXT NOT NULL,
      starters JSONB NOT NULL DEFAULT '[]'::jsonb,
      substitutes JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (mode, team)
    );

    CREATE TABLE IF NOT EXISTS custom_teams (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      manager TEXT NOT NULL,
      formation_id TEXT NOT NULL,
      starters JSONB NOT NULL DEFAULT '[]'::jsonb,
      substitutes JSONB NOT NULL DEFAULT '[]'::jsonb,
      competitions JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  return true;
}

module.exports = { hasPostgres, query, initPostgres };
