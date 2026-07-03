import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Input, NeonButton, GlassCard, SectionHeader } from '../../components/ui';
import { createTournament, updateTournament } from '../../services/tournamentService';
import { pickImage, uploadImage } from '../../services/storageService';
import { colors, spacing, radius, typography, GAMES, MODES } from '../../theme';
import { isRequired, validate } from '../../utils/validators';
import { notify } from '../../utils/notify';
import { toDate } from '../../utils/format';
import { DEFAULT_PLACEMENT_POINTS, DEFAULT_KILL_POINT } from '../../utils/points';

export default function TournamentFormScreen({ route, navigation }) {
  const existing = route.params?.tournament;
  const [form, setForm] = useState(() => ({
    name: existing?.name || '',
    game: existing?.game || GAMES[0],
    mode: existing?.mode || 'Squad',
    entryFee: String(existing?.entryFee ?? ''),
    prizePool: String(existing?.prizePool ?? ''),
    date: existing?.date ? toISOLocal(toDate(existing.date)) : '',
    registrationDeadline: existing?.registrationDeadline ? toISOLocal(toDate(existing.registrationDeadline)) : '',
    totalSlots: String(existing?.totalSlots ?? ''),
    numMatches: String(existing?.numMatches ?? '3'),
    map: existing?.map || '',
    rules: existing?.rules || '',
    status: existing?.status || 'upcoming',
    killPoint: String(existing?.pointSystem?.killPoint ?? DEFAULT_KILL_POINT),
    placementPoints: existing?.pointSystem?.placementPoints
      ? placementToText(existing.pointSystem.placementPoints)
      : placementToText(DEFAULT_PLACEMENT_POINTS),
  }));
  const [bannerAsset, setBannerAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const pickBanner = async () => {
    try {
      const asset = await pickImage([16, 9]);
      if (asset) setBannerAsset(asset);
    } catch (e) {
      notify('Error', e.message);
    }
  };

  const onSave = async () => {
    const err = validate(form, {
      name: [{ test: isRequired, msg: 'Tournament name is required' }],
      entryFee: [{ test: (v) => !isNaN(Number(v)), msg: 'Entry fee must be a number' }],
      prizePool: [{ test: (v) => !isNaN(Number(v)), msg: 'Prize pool must be a number' }],
      totalSlots: [{ test: (v) => Number(v) > 0, msg: 'Total slots must be greater than 0' }],
      date: [{ test: (v) => !!parseLocal(v), msg: 'Enter date as YYYY-MM-DD HH:MM (e.g. 2026-07-15 18:00)' }],
      registrationDeadline: [{ test: (v) => !!parseLocal(v), msg: 'Enter deadline as YYYY-MM-DD HH:MM' }],
    });
    if (err) return notify('Check details', err);

    setLoading(true);
    try {
      let bannerUrl = existing?.bannerUrl || null;
      if (bannerAsset) bannerUrl = await uploadImage(bannerAsset, 'tournaments');
      const data = {
        name: form.name.trim(),
        game: form.game,
        mode: form.mode,
        entryFee: Number(form.entryFee || 0),
        prizePool: Number(form.prizePool || 0),
        date: parseLocal(form.date),
        registrationDeadline: parseLocal(form.registrationDeadline),
        totalSlots: Number(form.totalSlots),
        numMatches: Number(form.numMatches || 1),
        map: form.map.trim(),
        rules: form.rules.trim(),
        status: form.status,
        bannerUrl,
        pointSystem: {
          killPoint: Number(form.killPoint || 1),
          placementPoints: textToPlacement(form.placementPoints),
        },
      };
      if (existing) {
        await updateTournament(existing.id, data);
        notify('Saved', 'Tournament updated.');
      } else {
        await createTournament(data);
        notify('Created 🎉', 'Tournament is live on the app.');
      }
      navigation.goBack();
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const bannerUri = bannerAsset?.uri || existing?.bannerUrl;

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>
        {existing ? 'Edit Tournament' : 'Create Tournament'}
      </Text>

      <GlassCard onPress={pickBanner} style={styles.bannerPicker}>
        {bannerUri ? (
          <Image source={{ uri: bannerUri }} style={styles.bannerImg} />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="image-outline" size={32} color={colors.textMuted} />
            <Text style={typography.caption}>Tap to add banner (16:9)</Text>
          </View>
        )}
      </GlassCard>

      <Input label="Tournament Name" value={form.name} onChangeText={set('name')} placeholder="Friday Night Showdown" />

      <Text style={styles.label}>Game</Text>
      <ChipRow options={GAMES} value={form.game} onChange={set('game')} />
      <Text style={styles.label}>Mode</Text>
      <ChipRow options={MODES} value={form.mode} onChange={set('mode')} />
      <Text style={styles.label}>Status</Text>
      <ChipRow options={['upcoming', 'live', 'completed']} value={form.status} onChange={set('status')} />

      <View style={{ height: spacing.md }} />
      <Input label="Entry Fee (₹)" value={form.entryFee} onChangeText={set('entryFee')} keyboardType="numeric" placeholder="50" />
      <Input label="Prize Pool (₹)" value={form.prizePool} onChangeText={set('prizePool')} keyboardType="numeric" placeholder="1000" />
      <Input label="Date & Time (YYYY-MM-DD HH:MM)" value={form.date} onChangeText={set('date')} placeholder="2026-07-15 18:00" />
      <Input label="Registration Deadline (YYYY-MM-DD HH:MM)" value={form.registrationDeadline} onChangeText={set('registrationDeadline')} placeholder="2026-07-15 16:00" />
      <Input label="Total Slots" value={form.totalSlots} onChangeText={set('totalSlots')} keyboardType="numeric" placeholder="48" />
      <Input label="Number of Matches" value={form.numMatches} onChangeText={set('numMatches')} keyboardType="numeric" placeholder="3" />
      <Input label="Map" value={form.map} onChangeText={set('map')} placeholder="Bermuda / Erangel" />
      <Input label="Rules" value={form.rules} onChangeText={set('rules')} multiline
        style={{ height: 120, textAlignVertical: 'top' }} placeholder="1. No emulators…" />

      <SectionHeader title="Point System" />
      <Input label="Points per Kill" value={form.killPoint} onChangeText={set('killPoint')} keyboardType="numeric" />
      <Input label="Placement Points (rank:points, comma separated)" value={form.placementPoints}
        onChangeText={set('placementPoints')} placeholder="1:12, 2:9, 3:8, 4:7, 5:6" />

      <NeonButton title={existing ? 'SAVE CHANGES' : 'CREATE TOURNAMENT'} onPress={onSave} loading={loading} />
    </ScreenContainer>
  );
}

function ChipRow({ options, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
      {options.map((o) => (
        <TouchableOpacity key={o} onPress={() => onChange(o)}
          style={[styles.chip, value === o && styles.chipActive]}>
          <Text style={{ color: value === o ? '#fff' : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{o}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function toISOLocal(d) {
  if (!d) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function parseLocal(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(String(s).trim());
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return isNaN(d.getTime()) ? null : d;
}

function placementToText(map) {
  return Object.entries(map).map(([k, v]) => `${k}:${v}`).join(', ');
}

function textToPlacement(text) {
  const out = {};
  String(text).split(',').forEach((pair) => {
    const [rank, pts] = pair.split(':').map((x) => Number(String(x).trim()));
    if (rank > 0 && !isNaN(pts)) out[rank] = pts;
  });
  return Object.keys(out).length ? out : DEFAULT_PLACEMENT_POINTS;
}

const styles = StyleSheet.create({
  bannerPicker: { alignItems: 'center', justifyContent: 'center', height: 150, padding: 0, overflow: 'hidden' },
  bannerImg: { width: '100%', height: '100%' },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, marginRight: 8,
  },
  chipActive: { backgroundColor: colors.neonPurple, borderColor: colors.neonPurple },
});
