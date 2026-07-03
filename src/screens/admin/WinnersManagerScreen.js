import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Input, NeonButton, GlassCard, SectionHeader } from '../../components/ui';
import { addWinner, watchWinners, deleteWinner } from '../../services/cmsService';
import { sendNotification } from '../../services/notificationService';
import { pickImage, uploadImage } from '../../services/storageService';
import { colors, spacing, radius, typography } from '../../theme';
import { isRequired, validate } from '../../utils/validators';
import { notify, confirm } from '../../utils/notify';
import { formatDate, formatINR } from '../../utils/format';

export default function WinnersManagerScreen() {
  const [form, setForm] = useState({ tournamentName: '', teamName: '', prize: '' });
  const [photoAsset, setPhotoAsset] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => watchWinners(setWinners), []);

  const pickPhoto = async () => {
    try {
      const asset = await pickImage([1, 1]);
      if (asset) setPhotoAsset(asset);
    } catch (e) {
      notify('Error', e.message);
    }
  };

  const onDeclare = async () => {
    const err = validate(form, {
      tournamentName: [{ test: isRequired, msg: 'Tournament name required' }],
      teamName: [{ test: isRequired, msg: 'Winner team required' }],
      prize: [{ test: (v) => !isNaN(Number(v)) && Number(v) >= 0, msg: 'Prize must be a number' }],
    });
    if (err) return notify('Check details', err);
    setLoading(true);
    try {
      let photoUrl = null;
      if (photoAsset) photoUrl = await uploadImage(photoAsset, 'winners');
      await addWinner({
        tournamentName: form.tournamentName.trim(),
        teamName: form.teamName.trim(),
        prize: Number(form.prize),
        photoUrl,
        date: new Date(),
      });
      await sendNotification({
        title: '🏆 Winner Announcement!',
        body: `${form.teamName} wins ${form.tournamentName} — prize ${formatINR(form.prize)}! GG!`,
        type: 'winner',
      });
      notify('Declared 🏆', 'Winner published and users notified.');
      setForm({ tournamentName: '', teamName: '', prize: '' });
      setPhotoAsset(null);
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Declare Winner</Text>

      <Input label="Tournament" value={form.tournamentName} onChangeText={set('tournamentName')} placeholder="Friday Night Showdown" />
      <Input label="Winner Team" value={form.teamName} onChangeText={set('teamName')} placeholder="Team Phoenix" />
      <Input label="Prize (₹)" value={form.prize} onChangeText={set('prize')} keyboardType="numeric" placeholder="1000" />

      <GlassCard onPress={pickPhoto} style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
        {photoAsset ? (
          <Image source={{ uri: photoAsset.uri }} style={styles.photo} />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="image-outline" size={28} color={colors.textMuted} />
            <Text style={typography.caption}>Winner photo (optional)</Text>
          </View>
        )}
      </GlassCard>

      <NeonButton title="DECLARE & ANNOUNCE 🏆" onPress={onDeclare} loading={loading} />

      <SectionHeader title="Published Winners" />
      {winners.map((w) => (
        <GlassCard key={w.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.body, { fontWeight: '700', color: colors.gold }]}>{w.teamName}</Text>
            <Text style={typography.small}>{w.tournamentName} · {formatINR(w.prize)} · {formatDate(w.date)}</Text>
          </View>
          <NeonButton title="Delete" variant="danger"
            onPress={async () => (await confirm('Delete winner entry?')) && deleteWinner(w.id)} />
        </GlassCard>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  photo: { width: 90, height: 90, borderRadius: radius.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
});
