import { Platform } from 'react-native';
import { api, poll } from '../config/api';

export async function submitPayment({ registration, user, screenshotAsset, txnId, amount }) {
  const formData = new FormData();
  if (Platform.OS === 'web') {
    const response = await fetch(screenshotAsset.uri);
    const blob = await response.blob();
    formData.append('screenshot', blob, 'screenshot.jpg');
  } else {
    formData.append('screenshot', { uri: screenshotAsset.uri, name: 'screenshot.jpg', type: 'image/jpeg' });
  }
  formData.append('registrationId', registration.id);
  formData.append('tournamentId', registration.tournamentId);
  formData.append('tournamentName', registration.tournamentName);
  formData.append('userName', user.username || registration.captainName);
  formData.append('teamName', registration.teamName);
  formData.append('amount', String(amount));
  formData.append('txnId', txnId.trim());
  return api.postForm('/payments', formData);
}

export function watchPayments(cb, status) {
  return poll(() => api.get(`/payments${status ? `?status=${status}` : ''}`), cb);
}

export function watchUserPayments(userId, cb) {
  return poll(() => api.get('/payments/me'), cb);
}

export async function approvePayment(payment) {
  return api.put(`/payments/${payment.id}/approve`, {});
}

export async function rejectPayment(payment, adminUid, reason = '') {
  return api.put(`/payments/${payment.id}/reject`, { reason });
}
