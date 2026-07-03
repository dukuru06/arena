import { api, poll } from '../config/api';

export function watchTournaments(cb, { status, game } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (game) params.set('game', game);
  const qs = params.toString() ? `?${params}` : '';
  return poll(() => api.get(`/tournaments${qs}`), cb);
}

export function watchTournament(id, cb) {
  return poll(() => api.get(`/tournaments/${id}`).catch(() => null), cb);
}

export async function getTournament(id) {
  return api.get(`/tournaments/${id}`);
}

export async function createTournament(data) {
  return api.post('/tournaments', data);
}

export async function updateTournament(id, data) {
  return api.put(`/tournaments/${id}`, data);
}

export async function deleteTournament(id) {
  return api.delete(`/tournaments/${id}`);
}

export async function setRoom(id, room) {
  return api.put(`/tournaments/${id}/room`, room);
}

export function watchRoom(id, cb, onError) {
  return poll(
    () => api.get(`/tournaments/${id}/room`).catch((e) => { if (onError) onError(e); return null; }),
    cb
  );
}
