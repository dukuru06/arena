import { api, poll } from '../config/api';

// ---- home content (banners, announcements, news, sponsors, socials, featuredTournamentId) ----
export function watchHomeContent(cb) {
  return poll(() => api.get('/cms/home-content'), cb);
}

export async function updateHomeContent(patch) {
  return api.put('/cms/home-content', patch);
}

// ---- settings (UPI details, static pages) ----
export function watchSettings(cb) {
  return poll(() => api.get('/cms/settings'), cb);
}

export async function updateSettings(patch) {
  return api.put('/cms/settings', patch);
}

// ---- winners ----
export function watchWinners(cb) {
  return poll(() => api.get('/cms/winners'), cb);
}

export async function addWinner(data) {
  return api.post('/cms/winners', data);
}

export async function deleteWinner(id) {
  return api.delete(`/cms/winners/${id}`);
}

// ---- gallery ----
export function watchGallery(cb) {
  return poll(() => api.get('/cms/gallery'), cb);
}

export async function addGalleryItem(data) {
  return api.post('/cms/gallery', data);
}

export async function deleteGalleryItem(id) {
  return api.delete(`/cms/gallery/${id}`);
}
