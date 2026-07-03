const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { mapUser } = require('../mappers');

const router = express.Router();

function sign(user) {
  return jwt.sign({ uid: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone, gameUid } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
    if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length) return res.status(409).json({ error: 'This email is already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash, phone, game_uid)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [username.trim(), email.trim().toLowerCase(), passwordHash, phone || '', gameUid || '']
    );
    const user = mapUser(rows[0]);
    res.status(201).json({ token: sign(rows[0]), user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [String(email || '').trim().toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'Incorrect email or password.' });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'Incorrect email or password.' });
    // Blocked users can still authenticate; the client shows a "suspended" screen from profile.blocked.
    res.json({ token: sign(rows[0]), user: mapUser(rows[0]) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  // No SMTP provider configured in this project — see README for wiring one up.
  res.json({ message: 'Password reset via email is not configured on this server yet. Contact the admin to reset your password directly.' });
});

module.exports = router;
