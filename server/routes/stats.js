const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', requireAuth, requireAdmin, async (req, res) => {
  const q = (sql, params) => pool.query(sql, params).then((r) => Number(r.rows[0].count));

  const [
    totalUsers, totalTeams, totalTournaments,
    pendingPayments, approvedPayments, liveMatches, completedMatches, revenue,
  ] = await Promise.all([
    q('SELECT COUNT(*) FROM users'),
    q("SELECT COUNT(*) FROM registrations WHERE status = 'confirmed'"),
    q('SELECT COUNT(*) FROM tournaments'),
    q("SELECT COUNT(*) FROM payments WHERE status = 'pending'"),
    q("SELECT COUNT(*) FROM payments WHERE status = 'approved'"),
    q("SELECT COUNT(*) FROM tournaments WHERE status = 'live'"),
    q("SELECT COUNT(*) FROM tournaments WHERE status = 'completed'"),
    pool.query("SELECT COALESCE(SUM(amount), 0) AS count FROM payments WHERE status = 'approved'").then((r) => Number(r.rows[0].count)),
  ]);

  res.json({ totalUsers, totalTeams, totalTournaments, pendingPayments, approvedPayments, liveMatches, completedMatches, revenue });
});

module.exports = router;
