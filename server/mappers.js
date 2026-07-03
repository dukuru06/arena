// Maps snake_case Postgres rows to the camelCase shapes the client expects
// (mirrors the original Firestore document shapes).

function mapUser(row) {
  if (!row) return null;
  return {
    uid: row.id,
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    blocked: row.blocked,
    phone: row.phone || '',
    gameUid: row.game_uid || '',
    photoURL: row.photo_url || null,
    stats: row.stats || { tournaments: 0, wins: 0, kills: 0 },
    createdAt: row.created_at,
  };
}

function mapTournament(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    game: row.game,
    mode: row.mode,
    entryFee: Number(row.entry_fee),
    prizePool: Number(row.prize_pool),
    date: row.date,
    registrationDeadline: row.registration_deadline,
    totalSlots: row.total_slots,
    slotsFilled: row.slots_filled,
    numMatches: row.num_matches,
    map: row.map || '',
    rules: row.rules || '',
    status: row.status,
    bannerUrl: row.banner_url || null,
    registrationsLocked: row.registrations_locked,
    pointSystem: row.point_system,
    confirmedUids: row.confirmed_uids || [],
    createdAt: row.created_at,
  };
}

function mapRoom(row) {
  if (!row) return null;
  return { roomId: row.room_id, password: row.password, matchTime: row.match_time };
}

function mapRegistration(row) {
  if (!row) return null;
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    tournamentName: row.tournament_name,
    game: row.game,
    entryFee: row.entry_fee != null ? Number(row.entry_fee) : null,
    userId: row.user_id,
    teamName: row.team_name,
    captainName: row.captain_name,
    gameUid: row.game_uid,
    phone: row.phone,
    email: row.email,
    teamLogo: row.team_logo || null,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapPayment(row) {
  if (!row) return null;
  return {
    id: row.id,
    registrationId: row.registration_id,
    tournamentId: row.tournament_id,
    tournamentName: row.tournament_name,
    userId: row.user_id,
    userName: row.user_name,
    teamName: row.team_name,
    amount: Number(row.amount),
    txnId: row.txn_id,
    screenshotUrl: row.screenshot_url,
    status: row.status,
    rejectReason: row.reject_reason || null,
    reviewedBy: row.reviewed_by || null,
    reviewedAt: row.reviewed_at || null,
    createdAt: row.created_at,
  };
}

function mapMatch(row) {
  if (!row) return null;
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    matchNumber: row.match_number,
    results: row.results || [],
    scoreboardUrl: row.scoreboard_url || null,
    createdAt: row.created_at,
  };
}

function mapLeaderboard(row) {
  if (!row) return null;
  return {
    tournamentId: row.tournament_id,
    tournamentName: row.tournament_name,
    standings: row.standings || [],
    manualOverride: row.manual_override,
    updatedAt: row.updated_at,
  };
}

function mapNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    userId: row.user_id,
    type: row.type,
    tournamentId: row.tournament_id,
    createdAt: row.created_at,
  };
}

function mapWinner(row) {
  if (!row) return null;
  return {
    id: row.id,
    tournamentName: row.tournament_name,
    teamName: row.team_name,
    prize: Number(row.prize),
    photoUrl: row.photo_url || null,
    date: row.date,
    createdAt: row.created_at,
  };
}

function mapGalleryItem(row) {
  if (!row) return null;
  return { id: row.id, imageUrl: row.image_url, caption: row.caption || '', createdAt: row.created_at };
}

module.exports = {
  mapUser, mapTournament, mapRoom, mapRegistration, mapPayment,
  mapMatch, mapLeaderboard, mapNotification, mapWinner, mapGalleryItem,
};
