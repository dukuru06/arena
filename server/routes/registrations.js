const express = require('express');
const pool = require('../db');
const { mapRegistration } = require('../mappers');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const me = await pool.query('SELECT blocked FROM users WHERE id = $1', [req.user.uid]);
  if (me.rows[0]?.blocked) return res.status(403).json({ error: 'Account suspended' });

  const { tournamentId, tournamentName, game, entryFee, teamName, captainName, gameUid, phone, email, teamLogo } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO registrations
       (tournament_id, tournament_name, game, entry_fee, user_id, team_name, captain_name, game_uid, phone, email, team_logo, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending_payment') RETURNING *`,
    [tournamentId, tournamentName, game, entryFee, req.user.uid, teamName, captainName, gameUid, phone, email, teamLogo || null]
  );
  res.status(201).json(mapRegistration(rows[0]));
});

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM registrations WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.uid]
  );
  res.json(rows.map(mapRegistration));
});

router.get('/me/tournament/:tid', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM registrations WHERE user_id = $1 AND tournament_id = $2 LIMIT 1',
    [req.user.uid, req.params.tid]
  );
  res.json(rows.length ? mapRegistration(rows[0]) : null);
});

router.get('/tournament/:tid', requireAuth, requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM registrations WHERE tournament_id = $1 ORDER BY created_at DESC',
    [req.params.tid]
  );
  res.json(rows.map(mapRegistration));
});

// status: confirmed | rejected | cancelled | refunded
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM registrations WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (!rows.length) throw Object.assign(new Error('Not found'), { statusCode: 404 });
    const reg = rows[0];
    const wasConfirmed = reg.status === 'confirmed';

    await client.query('UPDATE registrations SET status = $1, updated_at = now() WHERE id = $2', [status, req.params.id]);

    if (status === 'confirmed' && !wasConfirmed) {
      await client.query(
        `UPDATE tournaments SET slots_filled = slots_filled + 1,
           confirmed_uids = array_append(confirmed_uids, $1) WHERE id = $2 AND NOT ($1 = ANY(confirmed_uids))`,
        [reg.user_id, reg.tournament_id]
      );
    } else if ((status === 'cancelled' || status === 'refunded' || status === 'rejected') && wasConfirmed) {
      await client.query(
        `UPDATE tournaments SET slots_filled = GREATEST(slots_filled - 1, 0),
           confirmed_uids = array_remove(confirmed_uids, $1) WHERE id = $2`,
        [reg.user_id, reg.tournament_id]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(e.statusCode || 500).json({ error: e.message });
  } finally {
    client.release();
  }
});

module.exports = router;
