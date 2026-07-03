// Default placement points (Free Fire style). Tournaments may override with a
// custom map stored on the tournament doc as { pointSystem: { placementPoints, killPoint } }.
export const DEFAULT_PLACEMENT_POINTS = {
  1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
};
export const DEFAULT_KILL_POINT = 1;

export function getPointSystem(tournament) {
  const ps = tournament?.pointSystem || {};
  return {
    placementPoints: ps.placementPoints || DEFAULT_PLACEMENT_POINTS,
    killPoint: ps.killPoint ?? DEFAULT_KILL_POINT,
  };
}

export function calcMatchPoints(placement, kills, pointSystem) {
  const placementPts = Number(pointSystem.placementPoints[placement] || 0);
  const killPts = Number(kills || 0) * Number(pointSystem.killPoint || 0);
  return { placementPts, killPts, total: placementPts + killPts };
}

// Aggregate an array of match result rows [{teamId, teamName, placement, kills}]
// into leaderboard entries sorted by total points (ties broken by kills).
export function aggregateLeaderboard(results, pointSystem) {
  const byTeam = {};
  for (const r of results) {
    if (!byTeam[r.teamId]) {
      byTeam[r.teamId] = {
        teamId: r.teamId,
        teamName: r.teamName,
        kills: 0,
        placementPts: 0,
        totalPts: 0,
        matchesPlayed: 0,
        bestPlacement: Infinity,
      };
    }
    const t = byTeam[r.teamId];
    const { placementPts, killPts, total } = calcMatchPoints(r.placement, r.kills, pointSystem);
    t.kills += Number(r.kills || 0);
    t.placementPts += placementPts;
    t.totalPts += total + killPts * 0; // killPts already included in total
    t.matchesPlayed += 1;
    t.bestPlacement = Math.min(t.bestPlacement, Number(r.placement || 99));
  }
  return Object.values(byTeam)
    .sort((a, b) => b.totalPts - a.totalPts || b.kills - a.kills || a.bestPlacement - b.bestPlacement)
    .map((t, i) => ({ ...t, rank: i + 1 }));
}
