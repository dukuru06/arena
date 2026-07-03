import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer, StatCard, Skeleton, GlassCard, SectionHeader } from '../../components/ui';
import { getDashboardStats } from '../../services/statsService';
import { colors, spacing, typography } from '../../theme';
import { formatINR } from '../../utils/format';
import { notify } from '../../utils/notify';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setStats(await getDashboardStats());
    } catch (e) {
      notify('Error loading stats', e.message);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScreenContainer onRefresh={onRefresh} refreshing={refreshing}>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Admin Dashboard</Text>
      {!stats ? (
        <><Skeleton height={90} /><Skeleton height={90} /><Skeleton height={90} /></>
      ) : (
        <>
          <View style={styles.grid}>
            <StatCard label="Total Users" value={stats.totalUsers} icon="people-outline" />
            <StatCard label="Total Teams" value={stats.totalTeams} icon="shield-outline" color={colors.neonPurple} />
            <StatCard label="Tournaments" value={stats.totalTournaments} icon="game-controller-outline" />
            <StatCard label="Pending Payments" value={stats.pendingPayments} icon="hourglass-outline" color={colors.warning} />
            <StatCard label="Approved Payments" value={stats.approvedPayments} icon="checkmark-circle-outline" color={colors.success} />
            <StatCard label="Live Matches" value={stats.liveMatches} icon="flash-outline" color={colors.danger} />
            <StatCard label="Completed" value={stats.completedMatches} icon="flag-outline" color={colors.textMuted} />
            <StatCard label="Revenue" value={formatINR(stats.revenue)} icon="wallet-outline" color={colors.gold} />
          </View>

          <SectionHeader title="Quick Actions" />
          <QuickAction title="⏳ Review Pending Payments" badge={stats.pendingPayments}
            onPress={() => navigation.navigate('Payments')} />
          <QuickAction title="➕ Create Tournament" onPress={() => navigation.navigate('TournamentForm', {})} />
          <QuickAction title="📢 Send Notification" onPress={() => navigation.navigate('SendNotification')} />
          <QuickAction title="🎨 Edit Home Page" onPress={() => navigation.navigate('HomeCMS')} />
        </>
      )}
    </ScreenContainer>
  );
}

function QuickAction({ title, badge, onPress }) {
  return (
    <GlassCard onPress={onPress} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg }}>
      <Text style={[typography.body, { fontWeight: '600' }]}>{title}</Text>
      {badge ? (
        <View style={styles.badge}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{badge}</Text></View>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  badge: {
    backgroundColor: colors.danger, minWidth: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
});
