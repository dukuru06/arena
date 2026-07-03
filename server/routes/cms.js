const express = require('express');
const pool = require('../db');
const { mapWinner, mapGalleryItem } = require('../mappers');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ---- home content (banners, announcements, news, sponsors, socials, featuredTournamentId) ----
router.get('/home-content', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT data FROM home_content WHERE id = 1');
  res.json(rows[0]?.data || {});
});

router.put('/home-content', requireAuth, requireAdmin, async (req, res) => {
  const { rows } = await pool.query('SELECT data FROM home_content WHERE id = 1');
  const merged = { ...(rows[0]?.data || {}), ...req.body };
  await pool.query('UPDATE home_content SET data = $1, updated_at = now() WHERE id = 1', [JSON.stringify(merged)]);
  res.json(merged);
});

// ---- settings (UPI details, static pages) ----
router.get('/settings', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT data FROM settings WHERE id = 1');
  res.json(rows[0]?.data || {});
});

router.put('/settings', requireAuth, requireAdmin, async (req, res) => {
  const { rows } = await pool.query('SELECT data FROM settings WHERE id = 1');
  const merged = { ...(rows[0]?.data || {}), ...req.body };
  await pool.query('UPDATE settings SET data = $1, updated_at = now() WHERE id = 1', [JSON.stringify(merged)]);
  res.json(merged);
});

// ---- winners ----
router.get('/winners', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM winners ORDER BY date DESC');
  res.json(rows.map(mapWinner));
});

router.post('/winners', requireAuth, requireAdmin, async (req, res) => {
  const { tournamentName, teamName, prize, photoUrl, date } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO winners (tournament_name, team_name, prize, photo_url, date) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [tournamentName, teamName, prize, photoUrl || null, date || new Date().toISOString()]
  );
  res.status(201).json(mapWinner(rows[0]));
});

router.delete('/winners/:id', requireAuth, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM winners WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ---- gallery ----
router.get('/gallery', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
  res.json(rows.map(mapGalleryItem));
});

router.post('/gallery', requireAuth, requireAdmin, async (req, res) => {
  const { imageUrl, caption } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO gallery (image_url, caption) VALUES ($1,$2) RETURNING *`,
    [imageUrl, caption || '']
  );
  res.status(201).json(mapGalleryItem(rows[0]));
});

router.delete('/gallery/:id', requireAuth, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM gallery WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
