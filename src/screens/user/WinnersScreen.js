import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, GlassCard, Skeleton, EmptyState } from '../../components/ui';
import { watchWinners } from '../../services/cmsService';
import { colors, spacing, radius, typography } from '../../theme';
import { formatDate, formatINR } from '../../utils/format';

export default function WinnersScreen() {
  const [winners, setWinners] = useState(null);
  useEffect(() => watchWinners(setWinners), []);

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>🏆 Hall of Fame</Text>
      {winners === null ? (
        <><Skeleton height={100} /><Skeleton height={100} /></>
      ) : winners.length === 0 ? (
        <EmptyState title="No winners yet" subtitle="Champions will be featured here." />
      ) : (
        winners.map((w) => (
          <GlassCard key={w.id} style={styles.card}>
            {w.photoUrl ? (
              <Image source={{ uri: w.photoUrl }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoFallback]}>
                <Ionicons name="trophy" size={28} color={colors.gold} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: colors.gold }]}>{w.teamName}</Text>
              <Text style={typography.caption}>{w.tournamentName}</Text>
              <Text style={[typography.body, { fontWeight: '700', marginTop: 4 }]}>{formatINR(w.prize)}</Text>
              <Text style={typography.small}>{formatDate(w.date)}</Text>
            </View>
          </GlassCard>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  photo: { width: 64, height: 64, borderRadius: radius.md },
  photoFallback: { backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
});
