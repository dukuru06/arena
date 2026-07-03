import { api, poll } from '../config/api';

export async function saveMatchResults({ tournament, matchNumber, results, scoreboardUrl = null }) {
  return api.post(`/matches/tournament/${tournament.id}`, { matchNumber, results, scoreboardUrl });
}

export function watchMatches(tournamentId, cb) {
  return poll(() => api.get(`/matches/tournament/${tournamentId}`), cb);
}

export async function deleteMatch(matchId, tournament) {
  return api.delete(`/matches/${matchId}`);
}

export async function overrideLeaderboard(tournamentId, standings) {
  return api.put(`/matches/leaderboard/${tournamentId}`, { standings });
}

export function watchLeaderboard(tournamentId, cb) {
  return poll(() => api.get(`/matches/leaderboard/${tournamentId}`), cb);
}
