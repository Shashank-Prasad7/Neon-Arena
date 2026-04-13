const express = require('express');
const db = require('../db/database');
const postgres = require('../db/postgres');

const router = express.Router();

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    if (postgres.hasPostgres()) {
      await postgres.query('INSERT INTO newsletter_subs (email) VALUES ($1)', [email.toLowerCase().trim()]);
    } else {
      db.prepare('INSERT INTO newsletter_subs (email) VALUES (?)').run(email.toLowerCase().trim());
    }
    res.json({ message: 'Subscribed successfully' });
  } catch (err) {
    if (err.message?.includes('UNIQUE') || err.code === '23505') {
      return res.json({ message: 'Already subscribed' });
    }
    res.status(500).json({ error: 'Subscription failed' });
  }
});

module.exports = router;
