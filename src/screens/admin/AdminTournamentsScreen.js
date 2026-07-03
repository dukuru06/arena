import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, GlassCard, StatusBadge, Skeleton, EmptyState, NeonButton } from '../../components/ui';
import { watchTournaments, updateTournament, deleteTournament } from '../../services/tournamentService';
import { colors, spacing, typography } from '../../theme';
import { formatDateTime, formatINR } from '../../utils/format';
import { notify, confirm } from '../../utils/notify';

const NEXT_STATUS = { upcoming: 'live', live: 'completed', completed: 'upcoming' };

export default function AdminTournamentsScreen({ navigation }) {
  const [tournaments, setTournaments] = useState(null);

  useEffect(() => watchTournaments(setTournaments), []);

  const cycleStatus = async (t) => {
    const next = NEXT_STATUS[t.status] || 'upcoming';
    if (await confirm('Change status?', `${t.name}: ${t.status} → ${next}`)) {
      await updateTournament(t.id, { status: next });
    }
  };

  const toggleLock = async (t) => {
    await updateTournament(t.id, { registrationsLocked: !t.registrationsLocked });
    notify(t.registrationsLocked ? 'Registrations unlocked' : 'Registrations locked');
  };

  const onDelete = async (t) => {
    if (await confirm('Delete tournament?', `"${t.name}" will be permanently removed.`)) {
      await deleteTournament(t.id);
    }
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <Text style={typography.h1}>Tournaments</Text>
        <NeonButton title="+ NEW" onPress={() => navigation.navigate('TournamentForm', {})} />
      </View>

      {tournaments === null ? (
        <><Skeleton height={160} /><Skeleton height={160} /></>
      ) : tournaments.length === 0 ? (
        <EmptyState title="No tournaments" subtitle="Create your first tournament." />
      ) : (
        tournaments.map((t) => (
          <GlassCard key={t.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[typography.h3, { flex: 1 }]} numberOfLines={1}>{t.name}</Text>
              <TouchableOpacity onPress={() => cycleStatus(t)}><StatusBadge status={t.status} /></TouchableOpacity>
            </View>
            <Text style={[typography.caption, { marginTop: 2 }]}>
              {t.game} · {t.mode} · {formatDateTime(t.date)}
            </Text>
            <Text style={typography.caption}>
              {t.slotsFilled || 0}/{t.totalSlots} slots · Entry {formatINR(t.entryFee)} · Prize {formatINR(t.prizePool)}
              {t.registrationsLocked ? ' · 🔒 LOCKED' : ''}
            </Text>
            <View style={styles.actions}>
              <ActionBtn icon="create-outline" label="Edit" onPress={() => navigation.navigate('TournamentForm', { tournament: t })} />
              <ActionBtn icon="key-outline" label="Room" onPress={() => navigation.navigate('RoomManager', { tournament: t })} />
              <ActionBtn icon="podium-outline" label="Results" onPress={() => navigation.navigate('Results', { tournament: t })} />
              <ActionBtn icon="people-outline" label="Teams" onPress={() => navigation.navigate('Registrations', { tournament: t })} />
              <ActionBtn icon={t.registrationsLocked ? 'lock-open-outline' : 'lock-closed-outline'}
                label={t.registrationsLocked ? 'Unlock' : 'Lock'} onPress={() => toggleLock(t)} />
              <ActionBtn icon="trash-outline" label="Delete" color={colors.danger} onPress={() => onDelete(t)} />
            </View>
          </GlassCard>
        ))
      )}
    </ScreenContainer>
  );
}

function ActionBtn({ icon, label, onPress, color = colors.neonBlue }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionBtn}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: spacing.md,
  },
  actionBtn: { alignItems: 'center', minWidth: 52, paddingVertical: 4 },
});
