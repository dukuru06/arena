// Base URL of the backend server (server/index.js).
// - Web (localhost:8081) can reach the API at localhost.
// - Android via Expo Go needs the PC's LAN IP instead of localhost (edit below).
import { Platform } from 'react-native';

const LAN_IP = '192.168.1.78'; // update if your PC's IP changes
export const API_BASE_URL = Platform.OS === 'web' ? 'http://localhost:4000' : `http://${LAN_IP}:4000`;

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData, isForm: true }),
};

// Polling replacement for Firestore's onSnapshot — keeps the same
// watchX(cb) → unsubscribe() signature the screens already call.
export function poll(fetchFn, cb, intervalMs = 4000) {
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    try {
      const data = await fetchFn();
      if (!stopped) cb(data);
    } catch (e) {
      if (!stopped) console.warn('poll error:', e.message);
    }
  };
  tick();
  const id = setInterval(tick, intervalMs);
  return () => { stopped = true; clearInterval(id); };
}
