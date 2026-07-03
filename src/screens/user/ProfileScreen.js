import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, GlassCard, NeonButton, StatCard, SectionHeader, StatusBadge, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { watchUserRegistrations } from '../../services/registrationService';
import { updateUserProfile } from '../../services/userService';
import { pickImage, uploadImage } from '../../services/storageService';
import { watchSettings } from '../../services/cmsService';
import { colors, spacing, typography } from '../../theme';
import { notify } from '../../utils/notify';
import { formatDate } from '../../utils/format';

export default function ProfileScreen() {
  const { user, profile, logout } = useAuth();
  const [regs, setRegs] = useState([]);
  const [settings, setSettings] = useState({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => (user ? watchUserRegistrations(user.uid, setRegs) : undefined), [user]);
  useEffect(() => watchSettings(setSettings), []);
  useEffect(() => {
    setForm({ username: profile?.username || '', gameUid: profile?.gameUid || '', phone: profile?.phone || '' });
  }, [profile]);

  const stats = profile?.stats || {};
  const confirmed = regs.filter((r) => r.status === 'confirmed');

  const changePhoto = async () => {
    try {
      const asset = await pickImage([1, 1]);
      if (!asset) return;
      const url = await uploadImage(asset, `avatars/${user.uid}`);
      await updateUserProfile(user.uid, { photoURL: url });
    } catch (e) {
      notify('Error', e.message);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile(user.uid, form);
      setEditing(false);
      notify('Saved', 'Profile updated.');
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={changePhoto}>
          {profile?.photoURL ? (
            <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons name="person" size={40} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.camBadge}><Ionicons name="camera" size={12} color="#fff" /></View>
        </TouchableOpacity>
        <Text style={[typography.h2, { marginTop: spacing.md }]}>{profile?.username}</Text>
        <Text style={typography.caption}>{profile?.email}</Text>
        {profile?.gameUid ? <Text style={[typography.caption, { color: colors.neonBlue }]}>UID: {profile.gameUid}</Text> : null}
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Tournaments" value={confirmed.length} icon="game-controller-outline" />
        <StatCard label="Wins" value={stats.wins || 0} icon="trophy-outline" color={colors.gold} />
        <StatCard label="Kills" value={stats.kills || 0} icon="skull-outline" color={colors.neonPink} />
      </View>

      {editing ? (
        <GlassCard>
          <Input label="Username" value={form.username} onChangeText={(v) => setForm((f) => ({ ...f, username: v }))} />
          <Input label="Game UID" value={form.gameUid} onChangeText={(v) => setForm((f) => ({ ...f, gameUid: v }))} />
          <Input label="Phone" value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} keyboardType="phone-pad" />
          <NeonButton title="SAVE" onPress={saveProfile} loading={saving} />
          <NeonButton title="Cancel" variant="outline" onPress={() => setEditing(false)} style={{ marginTop: spacing.sm }} />
        </GlassCard>
      ) : (
        <NeonButton title="EDIT PROFILE" variant="outline" icon="create-outline" onPress={() => setEditing(true)} />
      )}

      <SectionHeader title="Tournament History" />
      {regs.length === 0 ? (
        <Text style={typography.caption}>No tournaments played yet.</Text>
      ) : (
        regs.map((r) => (
          <GlassCard key={r.id} style={{ paddingVertical: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { fontWeight: '600' }]} numberOfLines={1}>{r.tournamentName}</Text>
                <Text style={typography.small}>{r.teamName} · {formatDate(r.createdAt)}</Text>
              </View>
              <StatusBadge status={r.status} />
            </View>
          </GlassCard>
        ))
      )}

      {settings.contact ? (
        <>
          <SectionHeader title="Contact Admin" />
          <GlassCard><Text style={typography.body}>{settings.contact}</Text></GlassCard>
        </>
      ) : null}

      <NeonButton title="LOGOUT" variant="danger" icon="log-out-outline" onPress={logout} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: colors.neonBlue },
  avatarFallback: { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  camBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.neonPurple,
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
});
