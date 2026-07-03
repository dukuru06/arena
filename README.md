# 🏆 Arena Esports — Tournament Management App

A tournament platform for **Free Fire, BGMI, PUBG, COD Mobile, Valorant, Cricket** and more. One React Native (Expo) codebase runs on **Android and Web**, backed by a **Node/Express API** on top of **Postgres (Neon)**.

## Architecture

```
Client (Expo/React Native)  ──HTTP/JWT──►  server/ (Express)  ──►  Postgres (Neon)
                                              └── /uploads (local disk, static-served)
```

- **Auth**: JWT (bcrypt-hashed passwords), issued by `server/routes/auth.js`, stored in `AsyncStorage` on the client.
- **Realtime**: no Firestore-style push listeners — the client polls the API every few seconds (`src/config/api.js`'s `poll()` helper). Good enough for a tournament app; swap for WebSockets later if you need instant updates.
- **Images**: uploaded to the backend, saved under `server/uploads/`, served statically at `/uploads/...`. Swap for S3/Cloudinary later if you deploy the backend somewhere without persistent disk.
- **Push notifications**: Expo push tokens stored per-user; `server/push.js` sends via the Expo push API whenever a notification row is created.

## Project structure

```
server/
  index.js            ← Express app entry
  db.js               ← Postgres pool (Neon connection)
  schema.sql           / migrate.js   ← DB schema + migration runner
  mappers.js          ← snake_case DB rows → camelCase API responses
  points.js           ← leaderboard point calculation (mirrors client's utils/points.js)
  push.js             ← Expo push delivery
  middleware/auth.js  ← JWT verification, admin gate
  routes/             ← auth, users, tournaments, registrations, payments, matches, notifications, cms, stats, uploads
  uploads/            ← uploaded images live here (gitignored)
src/
  config/api.js       ← API base URL + fetch wrapper + poll() helper
  theme/              ← dark esports theme (neon blue/purple, glassmorphism)
  context/AuthContext.js
  services/           ← one file per resource, calls the REST API
  components/, screens/, navigation/  ← unchanged UI layer
```

## Setup

### 1. Install
```bash
npm install
cd server && npm install && cd ..
```

### 2. Configure the database
`server/.env` already points at your Neon connection string. Run the migration once to create all tables:
```bash
npm run migrate
```

### 3. Start the backend
```bash
npm run server
```
This starts the API on `http://localhost:4000`. Keep it running alongside Expo.

### 4. Point the client at your backend
Open [src/config/api.js](src/config/api.js) and set `LAN_IP` to your PC's local network IP (`ipconfig` → IPv4 Address) — required so an Android phone on the same Wi-Fi can reach the API. Web automatically uses `localhost`.

### 5. Run the app
```bash
npm run web       # browser
npm run android   # Expo Go (same Wi-Fi as this PC)
```

### 6. Create your admin account
1. Register normally in the app.
2. Promote the account to admin directly in Postgres:
   ```bash
   cd server
   node -e "require('./db').query(\"UPDATE users SET role='admin' WHERE email=$1\", ['you@example.com']).then(()=>process.exit())"
   ```
3. Reopen the app — you land in the admin panel.

### 7. First-time content
- Admin → **More → App Settings**: set your **UPI ID** and upload the **payment QR code**.
- Admin → **More → Home Page CMS**: add banners/announcements.
- Admin → **Tournaments → + NEW**: create your first tournament.

## How the payment flow works

```
Player registers team → status: pending_payment
→ uploads UPI screenshot + txn ID → payments row (pending)
→ Admin reviews screenshot (full-size) → Approve / Reject
   Approve: registration confirmed, slot counted, uid added to
            tournaments.confirmed_uids, push + in-app notification sent
   Reject:  player notified with the reason
→ Room ID/password published by admin → GET /tournaments/:id/room only
  succeeds for admins or uids in confirmed_uids (403 otherwise)
```

## Point system

Default (Free Fire style): 1st = 12, 2nd = 9, 3rd = 8, 4th = 7, 5th = 6 … + 1/kill.
Every tournament can override both the placement table and kill points in the create/edit form (`1:12, 2:9, 3:8…`). Leaderboards recalculate automatically from all recorded matches; admins can also manually override points via `PUT /matches/leaderboard/:tid`.

## Database tables

`users` · `tournaments` (+ `tournament_rooms`) · `registrations` · `payments` · `matches` · `leaderboards` · `notifications` · `winners` · `gallery` · `home_content` · `settings`

See [server/schema.sql](server/schema.sql) for the full DDL.

## Known limitations / follow-ups

- **Forgot password** is a stub (`POST /auth/forgot-password` just returns a message) — no SMTP provider is wired up. Add one (Resend/SendGrid) to send real reset emails, or reset passwords manually in Postgres.
- **Google login** isn't implemented against the custom backend (it needs verifying a Google ID token server-side) — email/password only for now.
- **Realtime is polling-based**, not instant push, since Postgres has no Firestore-style listeners built in.
- **Image storage is local disk** on the backend — fine for development, but means uploads won't survive a redeploy on most hosting platforms. Move to S3/Cloudinary before deploying to production.
- Images are compressed client-side (quality 0.6) before upload; the upload endpoints cap files at 5 MB and images only.
- To generate a Play Store build: `npx eas build --platform android --profile production` (point `src/config/api.js` at your deployed backend URL first, not `localhost`).
