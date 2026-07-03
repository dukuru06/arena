const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const pool = require('../db');
const { mapPayment } = require('../mappers');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendNotification } = require('../push');

const router = express.Router();
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads', 'payments');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_ROOT, req.user.uid);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads are allowed'));
    cb(null, true);
  },
});

router.post('/', requireAuth, upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Screenshot is required' });
    const { registrationId, tournamentId, tournamentName, userName, teamName, amount, txnId } = req.body;
    const screenshotUrl = `${req.protocol}://${req.get('host')}/uploads/payments/${req.user.uid}/${req.file.filename}`;
    const { rows } = await pool.query(
      `INSERT INTO payments (registration_id, tournament_id, tournament_name, user_id, user_name, team_name, amount, txn_id, screenshot_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING *`,
      [registrationId, tournamentId, tournamentName, req.user.uid, userName, teamName, amount, txnId, screenshotUrl]
    );
    res.status(201).json(mapPayment(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.query;
  const { rows } = await pool.query(
    status ? 'SELECT * FROM payments WHERE status = $1 ORDER BY created_at DESC' : 'SELECT * FROM payments ORDER BY created_at DESC',
    status ? [status] : []
  );
  res.json(rows.map(mapPayment));
});

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC', [req.user.uid]);
  res.json(rows.map(mapPayment));
});

router.put('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (!rows.length) throw Object.assign(new Error('Not found'), { statusCode: 404 });
    const payment = rows[0];

    await client.query(
      'UPDATE payments SET status = $1, reviewed_by = $2, reviewed_at = now() WHERE id = $3',
      ['approved', req.user.uid, req.params.id]
    );
    const reg = await client.query('SELECT * FROM registrations WHERE id = $1 FOR UPDATE', [payment.registration_id]);
    if (reg.rows.length && reg.rows[0].status !== 'confirmed') {
      await client.query('UPDATE registrations SET status = $1, updated_at = now() WHERE id = $2', ['confirmed', payment.registration_id]);
      await client.query(
        `UPDATE tournaments SET slots_filled = slots_filled + 1,
           confirmed_uids = array_append(confirmed_uids, $1) WHERE id = $2 AND NOT ($1 = ANY(confirmed_uids))`,
        [payment.user_id, payment.tournament_id]
      );
    }
    await client.query('COMMIT');

    await sendNotification({
      title: 'Payment Approved ✅',
      body: `Your payment for ${payment.tournament_name} is approved. Registration confirmed — Room ID will appear before the match.`,
      userId: payment.user_id,
      type: 'payment_approved',
      tournamentId: payment.tournament_id,
    });
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(e.statusCode || 500).json({ error: e.message });
  } finally {
    client.release();
  }
});

router.put('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  const { reason = '' } = req.body;
  const { rows } = await pool.query('SELECT * FROM payments WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  const payment = rows[0];

  await pool.query(
    'UPDATE payments SET status = $1, reject_reason = $2, reviewed_by = $3, reviewed_at = now() WHERE id = $4',
    ['rejected', reason, req.user.uid, req.params.id]
  );
  await pool.query('UPDATE registrations SET status = $1, updated_at = now() WHERE id = $2', ['rejected', payment.registration_id]);

  await sendNotification({
    title: 'Payment Rejected ❌',
    body: `Your payment for ${payment.tournament_name} was rejected.${reason ? ` Reason: ${reason}` : ''} Please re-upload a valid screenshot.`,
    userId: payment.user_id,
    type: 'payment_rejected',
    tournamentId: payment.tournament_id,
  });
  res.json({ ok: true });
});

module.exports = router;
