import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Skeleton, EmptyState } from '../../components/ui';
import TournamentCard from '../../components/TournamentCard';
import { watchTournaments } from '../../services/tournamentService';
import { colors, spacing, radius, typography, GAMES } from '../../theme';

const STATUS_TABS = ['upcoming', 'live', 'completed'];

export default function TournamentsScreen({ navigation }) {
  const [tournaments, setTournaments] = useState(null);
  const [search, setSearch] = useState('');
  const [game, setGame] = useState(null);
  const [statusTab, setStatusTab] = useState('upcoming');

  useEffect(() => watchTournaments(setTournaments), []);

  const filtered = useMemo(() => {
    if (!tournaments) return [];
    return tournaments.filter((t) =>
      t.status === statusTab &&
      (!game || t.game === game) &&
      (!search || t.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [tournaments, search, game, statusTab]);

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Tournaments</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tournaments…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
        <Chip label="All Games" active={!game} onPress={() => setGame(null)} />
        {GAMES.map((g) => <Chip key={g} label={g} active={game === g} onPress={() => setGame(g)} />)}
      </ScrollView>

      <View style={styles.tabs}>
        {STATUS_TABS.map((s) => (
          <TouchableOpacity key={s} style={[styles.tab, statusTab === s && styles.tabActive]}
            onPress={() => setStatusTab(s)}>
            <Text style={[styles.tabText, statusTab === s && { color: '#fff' }]}>{s.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tournaments === null ? (
        <><Skeleton height={220} /><Skeleton height={220} /></>
      ) : filtered.length === 0 ? (
        <EmptyState title="No tournaments" subtitle="Try a different filter or check back later." />
      ) : (
        filtered.map((t) => (
          <TournamentCard key={t.id} tournament={t}
            onPress={() => navigation.navigate('TournamentDetail', { id: t.id })} />
        ))
      )}
    </ScreenContainer>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={{ color: active ? '#fff' : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.md,
  },
  searchInput: { flex: 1, color: colors.text, paddingVertical: 10, fontSize: 15 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, marginRight: 8,
  },
  chipActive: { backgroundColor: colors.neonPurple, borderColor: colors.neonPurple },
  tabs: {
    flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md,
    padding: 4, marginBottom: spacing.lg,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: colors.neonBlue + '33' },
  tabText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
});
