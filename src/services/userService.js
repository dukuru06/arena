import { api, poll } from '../config/api';

export async function updateUserProfile(uid, data) {
  return api.put('/users/me', data);
}

export function watchAllUsers(cb) {
  return poll(() => api.get('/users'), cb);
}

export async function setUserBlocked(uid, blocked) {
  return api.put(`/users/${uid}/block`, { blocked });
}
