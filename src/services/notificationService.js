import { api, poll } from '../config/api';

export async function sendNotification({ title, body, userId = null, type = 'custom', tournamentId = null }) {
  return api.post('/notifications', { title, body, userId, type, tournamentId });
}

export function watchUserNotifications(userId, cb) {
  return poll(() => api.get('/notifications/me'), cb);
}
