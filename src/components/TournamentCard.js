import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, StatusBadge } from './ui';
import { colors, spacing, radius, typography } from '../theme';
import { formatDate, formatTime, formatINR } from '../utils/format';

export default function TournamentCard({ tournament, onPress }) {
  const t = tournament;
  const slotsLeft = Math.max(0, (t.totalSlots || 0) - (t.slotsFilled || 0));
  return (
    <GlassCard onPress={onPress} style={{ padding: 0, overflow: 'hidden' }}>
      {t.bannerUrl ? (
        <Image source={{ uri: t.bannerUrl }} style={styles.banner} resizeMode="cover" />
      ) : (
        <View style={[styles.banner, styles.bannerFallback]}>
          <Ionicons name="game-controller" size={40} color={colors.neonPurple} />
        </View>
      )}
      <View style={{ padding: spacing.lg }}>
        <View style={styles.row}>
          <Text style={[typography.h3, { flex: 1 }]} numberOfLines={1}>{t.name}</Text>
          <StatusBadge status={t.status} />
        </View>
        <Text style={[typography.caption, { marginTop: 2 }]}>
          {t.game} · {t.mode} · {t.map || 'TBA'}
        </Text>
        <View style={[styles.row, { marginTop: spacing.md }]}>
          <Meta icon="calendar-outline" text={`${formatDate(t.date)} ${formatTime(t.date)}`} />
          <Meta icon="people-outline" text={`${slotsLeft} slots left`} />
        </View>
        <View style={[styles.row, { marginTop: spacing.sm }]}>
          <Text style={styles.prize}>🏆 {formatINR(t.prizePool)}</Text>
          <Text style={styles.fee}>Entry {t.entryFee > 0 ? formatINR(t.entryFee) : 'FREE'}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

function Meta({ icon, text }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={14} color={colors.textSecondary} />
      <Text style={typography.caption}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 140, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  bannerFallback: { backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prize: { color: colors.gold, fontWeight: '800', fontSize: 16 },
  fee: { color: colors.neonBlue, fontWeight: '700' },
});
