import { api } from '../config/api';

export async function getDashboardStats() {
  return api.get('/stats/dashboard');
}
