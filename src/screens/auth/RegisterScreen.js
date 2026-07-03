import React, { useState } from 'react';
import { Text, Alert, TouchableOpacity, Platform } from 'react-native';
import { ScreenContainer, Input, NeonButton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme';
import { isEmail, isRequired, minLen, isPhone, validate } from '../../utils/validators';
import { friendlyAuthError } from './LoginScreen';

const notify = (title, msg) =>
  Platform.OS === 'web' ? window.alert(`${title}\n${msg}`) : Alert.alert(title, msg);

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', phone: '', gameUid: '', password: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const onRegister = async () => {
    const err = validate(form, {
      username: [{ test: (v) => minLen(v, 3), msg: 'Username must be at least 3 characters' }],
      email: [{ test: isEmail, msg: 'Enter a valid email' }],
      phone: [{ test: isPhone, msg: 'Enter a valid 10-digit phone number' }],
      password: [{ test: (v) => minLen(v, 6), msg: 'Password must be at least 6 characters' }],
    });
    if (err) return notify('Check details', err);
    setLoading(true);
    try {
      await register(form);
    } catch (e) {
      notify('Registration failed', friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ justifyContent: 'center', flexGrow: 1 }}>
      <Text style={[typography.h1, { marginBottom: spacing.xs }]}>Create Account</Text>
      <Text style={[typography.caption, { marginBottom: spacing.xl }]}>Join the arena and start competing</Text>

      <Input label="Username" value={form.username} onChangeText={set('username')} placeholder="ProGamer99" />
      <Input label="Email" value={form.email} onChangeText={set('email')} placeholder="you@example.com"
        autoCapitalize="none" keyboardType="email-address" />
      <Input label="Phone" value={form.phone} onChangeText={set('phone')} placeholder="9876543210" keyboardType="phone-pad" />
      <Input label="Game UID (optional)" value={form.gameUid} onChangeText={set('gameUid')} placeholder="Your in-game ID" />
      <Input label="Password" value={form.password} onChangeText={set('password')} placeholder="Min 6 characters" secureTextEntry />

      <NeonButton title="CREATE ACCOUNT" onPress={onRegister} loading={loading} />
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          Already registered? <Text style={{ color: colors.neonBlue, fontWeight: '700' }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
