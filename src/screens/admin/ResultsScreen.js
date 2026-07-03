import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, GlassCard, NeonButton, SectionHeader, EmptyState } from '../../components/ui';
import { watchTournamentRegistrations } from '../../services/registrationService';
import { saveMatchResults, watchMatches, deleteMatch, watchLeaderboard, overrideLeaderboard } from '../../services/leaderboardService';
import { pickImage, uploadImage } from '../../services/storageService';
import { colors, spacing, radius, typography } from '../../theme';
import { notify, confirm } from '../../utils/notify';

export default function ResultsScreen({ route }) {
  const { tournament } = route.params;
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [board, setBoard] = useState(null);
  const [rows, setRows] = useState({}); // teamId → {placement, kills}
  const [scoreboardAsset, setScoreboardAsset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editBoard, setEditBoard] = useState(null); // manual leaderboard edits

  useEffect(() => watchTournamentRegistrations(tournament.id, (regs) =>
    setTeams(regs.filter((r) => r.status === 'confirmed'))
  ), [tournament.id]);
  useEffect(() => watchMatches(tournament.id, setMatches), [tournament.id]);
  useEffect(() => watchLeaderboard(tournament.id, setBoard), [tournament.id]);

  const setRow = (teamId, field, value) =>
    setRows((r) => ({ ...r, [teamId]: { ...r[teamId], [field]: value } }));

  const pickScoreboard = async () => {
    try {
      const asset = await pickImage();
      if (asset) setScoreboardAsset(asset);
    } catch (e) {
      notify('Error', e.message);
    }
  };

  const onSaveMatch = async () => {
    const results = teams
      .filter((t) => rows[t.id]?.placement)
      .map((t) => ({
        teamId: t.id,
        teamName: t.teamName,
        placement: Number(rows[t.id].placement),
        kills: Number(rows[t.id].kills || 0),
      }));
    if (!results.length) return notify('Missing', 'Enter placement for at least one team.');
    setSaving(true);
    try {
      let scoreboardUrl = null;
      if (scoreboardAsset) scoreboardUrl = await uploadImage(scoreboardAsset, `scoreboards/${tournament.id}`);
      await saveMatchResults({ tournament, matchNumber: matches.length + 1, results, scoreboardUrl });
      setRows({});
      setScoreboardAsset(null);
      notify('Saved ✅', `Match ${matches.length + 1} results saved. Leaderboard updated.`);
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const onDeleteMatch = async (m) => {
    if (await confirm(`Delete Match ${m.matchNumber}?`, 'Leaderboard will be recalculated.')) {
      await deleteMatch(m.id, tournament);
    }
  };

  const saveManualBoard = async () => {
    try {
      await overrideLeaderboard(tournament.id, editBoard);
      setEditBoard(null);
      notify('Saved', 'Leaderboard manually updated.');
    } catch (e) {
      notify('Error', e.message);
    }
  };

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Match Results</Text>
      <Text style={[typography.caption, { marginBottom: spacing.lg }]}>
        {tournament.name} · {matches.length}/{tournament.numMatches || '?'} matches recorded
      </Text>

      {teams.length === 0 ? (
        <EmptyState title="No confirmed teams" subtitle="Approve payments first, then record results." />
      ) : (
        <>
          <SectionHeader title={`Enter Match ${matches.length + 1} Results`} />
          <GlassCard style={{ padding: 0 }}>
            <View style={[styles.row, { backgroundColor: colors.bgElevated }]}>
              <Text style={[styles.teamCol, styles.headTxt]}>TEAM</Text>
              <Text style={[styles.numCol, styles.headTxt]}>PLACE</Text>
              <Text style={[styles.numCol, styles.headTxt]}>KILLS</Text>
            </View>
            {teams.map((t) => (
              <View key={t.id} style={styles.row}>
                <Text style={styles.teamCol} numberOfLines={1}>{t.teamName}</Text>
                <TextInput style={styles.numInput} keyboardType="numeric" placeholder="—"
                  placeholderTextColor={colors.textMuted}
                  value={rows[t.id]?.placement || ''} onChangeText={(v) => setRow(t.id, 'placement', v)} />
                <TextInput style={styles.numInput} keyboardType="numeric" placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={rows[t.id]?.kills || ''} onChangeText={(v) => setRow(t.id, 'kills', v)} />
              </View>
            ))}
          </GlassCard>

          <GlassCard onPress={pickScoreboard} style={{ alignItems: 'center' }}>
            {scoreboardAsset ? (
              <Image source={{ uri: scoreboardAsset.uri }} style={styles.scoreboard} resizeMode="contain" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="camera-outline" size={20} color={colors.neonBlue} />
                <Text style={typography.caption}>Attach scoreboard screenshot (optional)</Text>
              </View>
            )}
          </GlassCard>

          <NeonButton title={`SAVE MATCH ${matches.length + 1} RESULTS`} onPress={onSaveMatch} loading={saving} />
        </>
      )}

      {matches.length > 0 && (
        <>
          <SectionHeader title="Recorded Matches" />
          {matches.map((m) => (
            <GlassCard key={m.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md }}>
              <Text style={typography.body}>Match {m.matchNumber} · {m.results?.length || 0} teams</Text>
              <TouchableOpacity onPress={() => onDeleteMatch(m)}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </GlassCard>
          ))}
        </>
      )}

      {board?.standings?.length > 0 && (
        <>
          <SectionHeader title="Leaderboard (manual edit)" action={editBoard ? null : 'Edit points'}
            onAction={() => setEditBoard(board.standings.map((s) => ({ ...s })))} />
          {editBoard ? (
            <GlassCard style={{ padding: 0 }}>
              {editBoard.map((s, i) => (
                <View key={s.teamId} style={styles.row}>
                  <Text style={styles.teamCol} numberOfLines={1}>{s.teamName}</Text>
                  <TextInput style={styles.numInput} keyboardType="numeric"
                    value={String(s.kills)} onChangeText={(v) =>
                      setEditBoard((b) => b.map((x, j) => (j === i ? { ...x, kills: Number(v || 0) } : x)))} />
                  <TextInput style={styles.numInput} keyboardType="numeric"
                    value={String(s.totalPts)} onChangeText={(v) =>
                      setEditBoard((b) => b.map((x, j) => (j === i ? { ...x, totalPts: Number(v || 0) } : x)))} />
                </View>
              ))}
              <View style={{ padding: spacing.md, gap: spacing.sm }}>
                <NeonButton title="SAVE MANUAL POINTS" onPress={saveManualBoard} />
                <NeonButton title="Cancel" variant="outline" onPress={() => setEditBoard(null)} />
              </View>
            </GlassCard>
          ) : (
            board.standings.slice(0, 10).map((s) => (
              <GlassCard key={s.teamId} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md }}>
                <Text style={typography.body}>#{s.rank} {s.teamName}</Text>
                <Text style={[typography.body, { color: colors.neonBlue, fontWeight: '700' }]}>{s.totalPts} pts</Text>
              </GlassCard>
            ))
          )}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  headTxt: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  teamCol: { flex: 1, color: colors.text, fontWeight: '600' },
  numCol: { width: 64, textAlign: 'center' },
  numInput: {
    width: 64, textAlign: 'center', color: colors.text,
    backgroundColor: colors.inputBg, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.cardBorder, paddingVertical: 6,
  },
  scoreboard: { width: '100%', height: 160, borderRadius: radius.md },
});
