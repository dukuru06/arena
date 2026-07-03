import React, { useState } from 'react';
import { Text, Image, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Input, NeonButton, GlassCard } from '../../components/ui';
import { createRegistration } from '../../services/registrationService';
import { pickImage, uploadImage } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius, typography } from '../../theme';
import { isRequired, isPhone, isEmail, validate } from '../../utils/validators';
import { notify } from '../../utils/notify';
import { formatINR } from '../../utils/format';

export default function JoinTournamentScreen({ route, navigation }) {
  const { tournament } = route.params;
  const { user, profile } = useAuth();
  const [form, setForm] = useState({
    teamName: '',
    captainName: profile?.username || '',
    gameUid: profile?.gameUid || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
  });
  const [logoAsset, setLogoAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const pickLogo = async () => {
    try {
      const asset = await pickImage([1, 1]);
      if (asset) setLogoAsset(asset);
    } catch (e) {
      notify('Error', e.message);
    }
  };

  const onSubmit = async () => {
    const err = validate(form, {
      teamName: [{ test: isRequired, msg: 'Team name is required' }],
      captainName: [{ test: isRequired, msg: 'Captain name is required' }],
      gameUid: [{ test: isRequired, msg: 'Game UID is required' }],
      phone: [{ test: isPhone, msg: 'Enter a valid 10-digit phone number' }],
      email: [{ test: isEmail, msg: 'Enter a valid email' }],
    });
    if (err) return notify('Check details', err);
    setLoading(true);
    try {
      let teamLogo = null;
      if (logoAsset) teamLogo = await uploadImage(logoAsset, `teams/${user.uid}`);
      const ref = await createRegistration({ tournament, user, team: { ...form, teamLogo } });
      if (tournament.entryFee > 0) {
        navigation.replace('PaymentUpload', {
          registration: { id: ref.id, tournamentId: tournament.id, tournamentName: tournament.name, entryFee: tournament.entryFee, ...form },
        });
      } else {
        notify('Registered!', 'Your free registration is submitted.');
        navigation.goBack();
      }
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Register Team</Text>
      <Text style={[typography.caption, { marginBottom: spacing.xl }]}>
        {tournament.name} · Entry {tournament.entryFee > 0 ? formatINR(tournament.entryFee) : 'FREE'}
      </Text>

      <Input label="Team Name" value={form.teamName} onChangeText={set('teamName')} placeholder="Team Phoenix" />
      <Input label="Captain Name" value={form.captainName} onChangeText={set('captainName')} placeholder="Your name" />
      <Input label={`Game UID (${tournament.game})`} value={form.gameUid} onChangeText={set('gameUid')} placeholder="In-game ID" />
      <Input label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="9876543210" />
      <Input label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />

      <GlassCard onPress={pickLogo} style={styles.logoPicker}>
        {logoAsset ? (
          <Image source={{ uri: logoAsset.uri }} style={styles.logo} />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="image-outline" size={32} color={colors.textMuted} />
            <Text style={[typography.caption, { marginTop: 4 }]}>Team Logo (optional) — tap to pick</Text>
          </View>
        )}
      </GlassCard>

      <NeonButton
        title={tournament.entryFee > 0 ? 'CONTINUE TO PAYMENT' : 'REGISTER FREE'}
        onPress={onSubmit} loading={loading} style={{ marginTop: spacing.md }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoPicker: { alignItems: 'center', paddingVertical: spacing.xl },
  logo: { width: 80, height: 80, borderRadius: radius.md },
});
