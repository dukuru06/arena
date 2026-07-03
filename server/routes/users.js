const express = require('express');
const pool = require('../db');
const { mapUser } = require('../mappers');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.uid]);
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  res.json(mapUser(rows[0]));
});

router.put('/me', requireAuth, async (req, res) => {
  const allowed = ['username', 'phone', 'gameUid', 'photoURL'];
  const fields = { username: 'username', phone: 'phone', gameUid: 'game_uid', photoURL: 'photo_url' };
  const sets = [];
  const values = [];
  let i = 1;
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      sets.push(`${fields[key]} = $${i++}`);
      values.push(req.body[key]);
    }
  }
  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.user.uid);
  const { rows } = await pool.query(
    `UPDATE users SET ${sets.join(', ')}, updated_at = now() WHERE id = $${i} RETURNING *`,
    values
  );
  res.json(mapUser(rows[0]));
});

router.post('/me/push-token', requireAuth, async (req, res) => {
  await pool.query('UPDATE users SET fcm_token = $1 WHERE id = $2', [req.body.token || null, req.user.uid]);
  res.json({ ok: true });
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  res.json(rows.map(mapUser));
});

router.put('/:uid/block', requireAuth, requireAdmin, async (req, res) => {
  await pool.query('UPDATE users SET blocked = $1 WHERE id = $2', [!!req.body.blocked, req.params.uid]);
  res.json({ ok: true });
});

module.exports = router;
