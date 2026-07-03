const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { mapNotification } = require('../mappers');
const { sendNotification } = require('../push');
const pool = require('../db');

const router = express.Router();

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, body, userId = null, type = 'custom', tournamentId = null } = req.body;
  const row = await sendNotification({ title, body, userId, type, tournamentId });
  res.status(201).json(mapNotification(row));
});

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM notifications WHERE user_id IS NULL OR user_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [req.user.uid]
  );
  res.json(rows.map(mapNotification));
});

module.exports = router;
