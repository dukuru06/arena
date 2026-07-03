const pool = require('./db');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

async function sendExpoPush(tokens, title, body, data = {}) {
  const valid = tokens.filter((t) => typeof t === 'string' && t.startsWith('ExponentPushToken'));
  if (!valid.length) return;
  for (let i = 0; i < valid.length; i += 100) {
    const chunk = valid.slice(i, i + 100).map((to) => ({ to, title, body, sound: 'default', data }));
    try {
      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      });
    } catch (e) {
      console.warn('Push delivery failed:', e.message);
    }
  }
}

// Inserts a notifications row (so the client's polling picks it up) and
// best-effort delivers a push to the target user(s) via Expo.
async function sendNotification({ title, body, userId = null, type = 'custom', tournamentId = null }) {
  const { rows } = await pool.query(
    `INSERT INTO notifications (title, body, user_id, type, tournament_id) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [title, body, userId, type, tournamentId]
  );

  let tokens = [];
  if (userId) {
    const u = await pool.query('SELECT fcm_token FROM users WHERE id = $1', [userId]);
    if (u.rows[0]?.fcm_token) tokens = [u.rows[0].fcm_token];
  } else {
    const all = await pool.query('SELECT fcm_token FROM users WHERE fcm_token IS NOT NULL');
    tokens = all.rows.map((r) => r.fcm_token);
  }
  sendExpoPush(tokens, title, body, { type, tournamentId }).catch(() => {});
  return rows[0];
}

module.exports = { sendNotification };
