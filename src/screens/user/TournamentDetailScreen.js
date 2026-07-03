import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Share, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { ScreenContainer, GlassCard, NeonButton, StatusBadge, CountdownTimer, Skeleton, SectionHeader } from '../../components/ui';
import { watchTournament, watchRoom } from '../../services/tournamentService';
import { getUserRegistrationForTournament } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius, typography } from '../../theme';
import { formatDate, formatTime, formatINR, formatDateTime, toDate } from '../../utils/format';
import { notify } from '../../utils/notify';

export default function TournamentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [t, setT] = useState(undefined);
  const [reg, setReg] = useState(null);
  const [room, setRoomData] = useState(null);

  useEffect(() => watchTournament(id, setT), [id]);
  useEffect(() => {
    if (user) {
      getUserRegistrationForTournament(user.uid, id).then(setReg).catch(() => {});
    }
  }, [user, id, t?.slotsFilled]);
  // Room doc is readable only after admin approval (enforced by security rules).
  const confirmed = reg?.status === 'confirmed';
  useEffect(() => {
    if (confirmed) return watchRoom(id, setRoomData);
    setRoomData(null);
  }, [confirmed, id]);

  if (t === undefined) return <ScreenContainer><Skeleton height={200} /><Skeleton height={300} /></ScreenContainer>;
  if (t === null) return <ScreenContainer><Text style={typography.body}>Tournament not found.</Text></ScreenContainer>;

  const slotsLeft = Math.max(0, (t.totalSlots || 0) - (t.slotsFilled || 0));
  const deadlinePassed = toDate(t.registrationDeadline) ? toDate(t.registrationDeadline) < new Date() : false;
  const canJoin = t.status === 'upcoming' && !t.registrationsLocked && slotsLeft > 0 && !deadlinePassed && !reg;
  const isConfirmed = reg?.status === 'confirmed';

  const onShare = async () => {
    const msg = `🎮 ${t.name} (${t.game})\n🏆 Prize Pool: ${formatINR(t.prizePool)}\n💰 Entry: ${t.entryFee > 0 ? formatINR(t.entryFee) : 'FREE'}\n📅 ${formatDateTime(t.date)}\n\nJoin now on Arena Esports!`;
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(msg);
      notify('Copied', 'Tournament details copied to clipboard.');
    } else {
      Share.share({ message: msg });
    }
  };

  const copyRoom = async (text) => {
    await Clipboard.setStringAsync(text);
    notify('Copied', text);
  };

  return (
    <ScreenContainer>
      {t.bannerUrl ? <Image source={{ uri: t.bannerUrl }} style={styles.banner} /> : null}
      <View style={styles.headerRow}>
        <Text style={[typography.h1, { flex: 1 }]}>{t.name}</Text>
        <TouchableOpacity onPress={onShare} style={{ padding: 6 }}>
          <Ionicons name="share-social-outline" size={24} color={colors.neonBlue} />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
        <StatusBadge status={t.status} />
        <Text style={typography.caption}>{t.game} · {t.mode}</Text>
      </View>

      {t.status === 'upcoming' && <CountdownTimer target={t.date} />}

      <GlassCard style={{ marginTop: spacing.md }}>
        <InfoRow icon="trophy-outline" label="Prize Pool" value={formatINR(t.prizePool)} valueColor={colors.gold} />
        <InfoRow icon="cash-outline" label="Entry Fee" value={t.entryFee > 0 ? formatINR(t.entryFee) : 'FREE'} />
        <InfoRow icon="calendar-outline" label="Date & Time" value={`${formatDate(t.date)} · ${formatTime(t.date)}`} />
        <InfoRow icon="hourglass-outline" label="Registration Deadline" value={formatDateTime(t.registrationDeadline)} />
        <InfoRow icon="people-outline" label="Slots" value={`${t.slotsFilled || 0} / ${t.totalSlots} filled`} />
        <InfoRow icon="map-outline" label="Map" value={t.map || 'TBA'} />
        <InfoRow icon="layers-outline" label="Matches" value={String(t.numMatches || 1)} />
      </GlassCard>

      {reg && (
        <GlassCard style={{ borderColor: colors.neonBlue + '66' }}>
          <SectionRowTitle icon="ticket-outline" title="Your Registration" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm }}>
            <Text style={typography.body}>{reg.teamName}</Text>
            <StatusBadge status={reg.status} />
          </View>
          {reg.status === 'pending_payment' && (
            <NeonButton title="UPLOAD PAYMENT PROOF" style={{ marginTop: spacing.md }}
              onPress={() => navigation.navigate('PaymentUpload', { registration: reg })} />
          )}
          {reg.status === 'rejected' && (
            <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.sm }]}>
              Payment was rejected. Contact admin or re-register.
            </Text>
          )}
        </GlassCard>
      )}

      {isConfirmed && room?.roomId ? (
        <GlassCard style={{ borderColor: colors.success, borderWidth: 1.5 }}>
          <SectionRowTitle icon="key-outline" title="Match Room" color={colors.success} />
          <RoomRow label="Room ID" value={room.roomId} onCopy={copyRoom} />
          <RoomRow label="Password" value={room.password} onCopy={copyRoom} />
          {room.matchTime ? <Text style={[typography.caption, { marginTop: spacing.sm }]}>Match time: {room.matchTime}</Text> : null}
        </GlassCard>
      ) : isConfirmed ? (
        <GlassCard>
          <SectionRowTitle icon="key-outline" title="Match Room" />
          <Text style={[typography.caption, { marginTop: spacing.sm }]}>
            Room ID & password will appear here before the match starts. 🔒
          </Text>
        </GlassCard>
      ) : null}

      {t.rules ? (
        <>
          <SectionHeader title="📜 Rules" />
          <GlassCard><Text style={[typography.body, { lineHeight: 22 }]}>{t.rules}</Text></GlassCard>
        </>
      ) : null}

      <NeonButton title="VIEW LEADERBOARD" variant="outline" icon="podium-outline"
        style={{ marginTop: spacing.md }}
        onPress={() => navigation.navigate('Leaderboard', { tournamentId: t.id, tournamentName: t.name })} />

      {canJoin && (
        <NeonButton title={`JOIN NOW · ${t.entryFee > 0 ? formatINR(t.entryFee) : 'FREE'}`}
          style={{ marginTop: spacing.md }}
          onPress={() => navigation.navigate('JoinTournament', { tournament: t })} />
      )}
      {!reg && !canJoin && t.status === 'upcoming' && (
        <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.md, color: colors.warning }]}>
          {t.registrationsLocked ? 'Registrations are locked.' : deadlinePassed ? 'Registration deadline has passed.' : slotsLeft === 0 ? 'All slots are full.' : ''}
        </Text>
      )}
    </ScreenContainer>
  );
}

function InfoRow({ icon, label, value, valueColor }) {
  return (
    <View style={styles.infoRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={icon} size={16} color={colors.textSecondary} />
        <Text style={typography.caption}>{label}</Text>
      </View>
      <Text style={[typography.body, { fontWeight: '600' }, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function SectionRowTitle({ icon, title, color = colors.neonBlue }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[typography.h3, { color }]}>{title}</Text>
    </View>
  );
}

function RoomRow({ label, value, onCopy }) {
  return (
    <View style={styles.roomRow}>
      <Text style={typography.caption}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={[typography.h3, { color: colors.neonBlue, letterSpacing: 1 }]}>{value}</Text>
        <TouchableOpacity onPress={() => onCopy(value)}>
          <Ionicons name="copy-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 180, borderRadius: radius.lg, marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 },
  roomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
});
