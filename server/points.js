function aggregateLeaderboard(results, pointSystem) {
  const placementPoints = pointSystem?.placementPoints || {};
  const killPoint = Number(pointSystem?.killPoint ?? 1);
  const byTeam = {};
  for (const r of results) {
    if (!byTeam[r.teamId]) {
      byTeam[r.teamId] = {
        teamId: r.teamId, teamName: r.teamName, kills: 0,
        placementPts: 0, totalPts: 0, matchesPlayed: 0, bestPlacement: Infinity,
      };
    }
    const t = byTeam[r.teamId];
    const placementPts = Number(placementPoints[r.placement] || 0);
    const killPts = Number(r.kills || 0) * killPoint;
    t.kills += Number(r.kills || 0);
    t.placementPts += placementPts;
    t.totalPts += placementPts + killPts;
    t.matchesPlayed += 1;
    t.bestPlacement = Math.min(t.bestPlacement, Number(r.placement || 99));
  }
  return Object.values(byTeam)
    .sort((a, b) => b.totalPts - a.totalPts || b.kills - a.kills || a.bestPlacement - b.bestPlacement)
    .map((t, i) => ({ ...t, rank: i + 1 }));
}

module.exports = { aggregateLeaderboard };
