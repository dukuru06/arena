import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Skeleton, EmptyState, GlassCard } from '../../components/ui';
import { watchLeaderboard } from '../../services/leaderboardService';
import { colors, spacing, radius, typography } from '../../theme';

const RANK_COLORS = { 1: colors.gold, 2: colors.silver, 3: colors.bronze };

export default function LeaderboardScreen({ route }) {
  const { tournamentId, tournamentName } = route.params;
  const [board, setBoard] = useState(undefined);

  useEffect(() => watchLeaderboard(tournamentId, setBoard), [tournamentId]);

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Leaderboard</Text>
      <Text style={[typography.caption, { marginBottom: spacing.lg }]}>{tournamentName}</Text>

      {board === undefined ? (
        <><Skeleton /><Skeleton /><Skeleton /></>
      ) : !board || !board.standings?.length ? (
        <EmptyState icon="podium-outline" title="No results yet" subtitle="Standings appear after the first match results are uploaded." />
      ) : (
        <GlassCard style={{ padding: 0 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.rankCell, styles.headerText]}>#</Text>
                <Text style={[styles.cell, styles.teamCell, styles.headerText]}>TEAM</Text>
                <Text style={[styles.cell, styles.headerText]}>KILLS</Text>
                <Text style={[styles.cell, styles.headerText]}>PLACE PTS</Text>
                <Text style={[styles.cell, styles.headerText]}>TOTAL</Text>
                <Text style={[styles.cell, styles.headerText]}>MATCHES</Text>
              </View>
              {board.standings.map((s) => (
                <View key={s.teamId} style={[styles.row, s.rank <= 3 && { backgroundColor: (RANK_COLORS[s.rank] || '') + '11' }]}>
                  <Text style={[styles.cell, styles.rankCell, { color: RANK_COLORS[s.rank] || colors.text, fontWeight: '800' }]}>
                    {s.rank}
                  </Text>
                  <Text style={[styles.cell, styles.teamCell]} numberOfLines={1}>{s.teamName}</Text>
                  <Text style={styles.cell}>{s.kills}</Text>
                  <Text style={styles.cell}>{s.placementPts}</Text>
                  <Text style={[styles.cell, { color: colors.neonBlue, fontWeight: '800' }]}>{s.totalPts}</Text>
                  <Text style={styles.cell}>{s.matchesPlayed}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </GlassCard>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
    paddingVertical: 12, paddingHorizontal: spacing.md,
  },
  headerRow: { backgroundColor: colors.bgElevated, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  headerText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  cell: { width: 80, color: colors.text, fontSize: 14, textAlign: 'center' },
  rankCell: { width: 36 },
  teamCell: { width: 140, textAlign: 'left', fontWeight: '600' },
});
