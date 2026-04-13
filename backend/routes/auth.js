const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const postgres = require('../db/postgres');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    let existing;
    if (postgres.hasPostgres()) {
      const result = await postgres.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      existing = result.rows[0];
    } else {
      existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    }
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = bcrypt.hashSync(password, 10);
    let user;
    if (postgres.hasPostgres()) {
      const insert = await postgres.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
        [name, email.toLowerCase().trim(), hash]
      );
      user = insert.rows[0];
    } else {
      const result = db.prepare(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
      ).run(name, email.toLowerCase().trim(), hash);
      user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    const token = signToken(user);

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    let user;
    if (postgres.hasPostgres()) {
      const result = await postgres.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      user = result.rows[0];
    } else {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...safeUser } = user;
    const token = signToken(safeUser);

    res.json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    let user;
    if (postgres.hasPostgres()) {
      const result = await postgres.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
      user = result.rows[0];
    } else {
      user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load user' });
  }
});

module.exports = router;
