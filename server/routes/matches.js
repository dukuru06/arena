const express = require('express');
const pool = require('../db');
const { mapMatch, mapLeaderboard, mapTournament } = require('../mappers');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { aggregateLeaderboard } = require('../points');

const router = express.Router();

async function rebuildLeaderboard(tournamentId) {
  const tRes = await pool.query('SELECT * FROM tournaments WHERE id = $1', [tournamentId]);
  const tournament = mapTournament(tRes.rows[0]);
  const mRes = await pool.query('SELECT results FROM matches WHERE tournament_id = $1', [tournamentId]);
  const allResults = mRes.rows.flatMap((r) => r.results || []);
  const standings = aggregateLeaderboard(allResults, tournament.pointSystem);
  await pool.query(
    `INSERT INTO leaderboards (tournament_id, tournament_name, standings, manual_override, updated_at)
     VALUES ($1,$2,$3,false,now())
     ON CONFLICT (tournament_id) DO UPDATE SET tournament_name = $2, standings = $3, manual_override = false, updated_at = now()`,
    [tournamentId, tournament.name, JSON.stringify(standings)]
  );
  return standings;
}

router.get('/tournament/:tid', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM matches WHERE tournament_id = $1 ORDER BY match_number ASC',
    [req.params.tid]
  );
  res.json(rows.map(mapMatch));
});

router.post('/tournament/:tid', requireAuth, requireAdmin, async (req, res) => {
  const { matchNumber, results, scoreboardUrl } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO matches (tournament_id, match_number, results, scoreboard_url) VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.params.tid, matchNumber, JSON.stringify(results), scoreboardUrl || null]
  );
  await rebuildLeaderboard(req.params.tid);
  res.status(201).json(mapMatch(rows[0]));
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { rows } = await pool.query('DELETE FROM matches WHERE id = $1 RETURNING tournament_id', [req.params.id]);
  if (rows.length) await rebuildLeaderboard(rows[0].tournament_id);
  res.json({ ok: true });
});

router.get('/leaderboard/:tid', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM leaderboards WHERE tournament_id = $1', [req.params.tid]);
  res.json(rows.length ? mapLeaderboard(rows[0]) : null);
});

router.put('/leaderboard/:tid', requireAuth, requireAdmin, async (req, res) => {
  const { standings } = req.body;
  const ranked = [...standings]
    .sort((a, b) => b.totalPts - a.totalPts || b.kills - a.kills)
    .map((t, i) => ({ ...t, rank: i + 1 }));
  await pool.query(
    `INSERT INTO leaderboards (tournament_id, standings, manual_override, updated_at)
     VALUES ($1, $2, true, now())
     ON CONFLICT (tournament_id) DO UPDATE SET standings = $2, manual_override = true, updated_at = now()`,
    [req.params.tid, JSON.stringify(ranked)]
  );
  res.json({ ok: true });
});

module.exports = router;
