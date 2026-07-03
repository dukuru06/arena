const express = require('express');
const pool = require('../db');
const { mapTournament, mapRoom } = require('../mappers');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const FIELD_MAP = {
  name: 'name', game: 'game', mode: 'mode', entryFee: 'entry_fee', prizePool: 'prize_pool',
  date: 'date', registrationDeadline: 'registration_deadline', totalSlots: 'total_slots',
  numMatches: 'num_matches', map: 'map', rules: 'rules', status: 'status',
  bannerUrl: 'banner_url', registrationsLocked: 'registrations_locked', pointSystem: 'point_system',
};

router.get('/', requireAuth, async (req, res) => {
  const { status, game } = req.query;
  const clauses = [];
  const values = [];
  if (status) { values.push(status); clauses.push(`status = $${values.length}`); }
  if (game) { values.push(game); clauses.push(`game = $${values.length}`); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(`SELECT * FROM tournaments ${where} ORDER BY date DESC`, values);
  res.json(rows.map(mapTournament));
});

router.get('/:id', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM tournaments WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(mapTournament(rows[0]));
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const cols = [];
  const placeholders = [];
  const values = [];
  for (const [key, col] of Object.entries(FIELD_MAP)) {
    if (req.body[key] !== undefined) {
      cols.push(col);
      values.push(key === 'pointSystem' ? JSON.stringify(req.body[key]) : req.body[key]);
      placeholders.push(`$${values.length}`);
    }
  }
  const { rows } = await pool.query(
    `INSERT INTO tournaments (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    values
  );
  res.status(201).json(mapTournament(rows[0]));
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const sets = [];
  const values = [];
  for (const [key, col] of Object.entries(FIELD_MAP)) {
    if (req.body[key] !== undefined) {
      values.push(key === 'pointSystem' ? JSON.stringify(req.body[key]) : req.body[key]);
      sets.push(`${col} = $${values.length}`);
    }
  }
  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE tournaments SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING *`,
    values
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(mapTournament(rows[0]));
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM tournaments WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// Room credentials — admin, or a user in confirmed_uids for this tournament.
router.get('/:id/room', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT confirmed_uids FROM tournaments WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  const allowed = req.user.role === 'admin' || (rows[0].confirmed_uids || []).includes(req.user.uid);
  if (!allowed) return res.status(403).json({ error: 'Not authorized to view room details' });
  const roomRes = await pool.query('SELECT * FROM tournament_rooms WHERE tournament_id = $1', [req.params.id]);
  res.json(mapRoom(roomRes.rows[0]));
});

router.put('/:id/room', requireAuth, requireAdmin, async (req, res) => {
  const { roomId, password, matchTime } = req.body;
  await pool.query(
    `INSERT INTO tournament_rooms (tournament_id, room_id, password, match_time, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (tournament_id) DO UPDATE SET room_id = $2, password = $3, match_time = $4, updated_at = now()`,
    [req.params.id, roomId, password, matchTime || '']
  );
  res.json({ ok: true });
});

module.exports = router;
