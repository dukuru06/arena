import { api, poll } from '../config/api';

export async function createRegistration({ tournament, user, team }) {
  const reg = await api.post('/registrations', {
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    game: tournament.game,
    entryFee: tournament.entryFee,
    teamName: team.teamName,
    captainName: team.captainName,
    gameUid: team.gameUid,
    phone: team.phone,
    email: team.email,
    teamLogo: team.teamLogo || null,
  });
  return reg; // has .id, matching the old Firestore DocumentReference usage
}

export function watchUserRegistrations(userId, cb) {
  return poll(() => api.get('/registrations/me'), cb);
}

export function watchTournamentRegistrations(tournamentId, cb) {
  return poll(() => api.get(`/registrations/tournament/${tournamentId}`), cb);
}

export async function getUserRegistrationForTournament(userId, tournamentId) {
  return api.get(`/registrations/me/tournament/${tournamentId}`);
}

export async function setRegistrationStatus(id, status) {
  return api.put(`/registrations/${id}/status`, { status });
}

export async function confirmRegistration(reg) {
  return setRegistrationStatus(reg.id, 'confirmed');
}

export async function cancelRegistration(reg, refunded = false) {
  return setRegistrationStatus(reg.id, refunded ? 'refunded' : 'cancelled');
}
