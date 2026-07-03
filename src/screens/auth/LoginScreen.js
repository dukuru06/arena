import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Input, NeonButton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme';
import { isEmail, validate, isRequired } from '../../utils/validators';

const notify = (title, msg) =>
  Platform.OS === 'web' ? window.alert(`${title}\n${msg}`) : Alert.alert(title, msg);

export default function LoginScreen({ navigation }) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    const err = validate({ email, password }, {
      email: [{ test: isEmail, msg: 'Enter a valid email' }],
      password: [{ test: isRequired, msg: 'Enter your password' }],
    });
    if (err) return notify('Check details', err);
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      notify('Login failed', friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      notify('Google login', e.message);
    }
  };

  return (
    <ScreenContainer style={{ justifyContent: 'center', flexGrow: 1 }}>
      <View style={{ alignItems: 'center', marginBottom: spacing.xxl }}>
        <Ionicons name="trophy" size={56} color={colors.neonBlue} />
        <Text style={[typography.h1, { marginTop: spacing.md }]}>ARENA ESPORTS</Text>
        <Text style={typography.caption}>Compete. Win. Dominate.</Text>
      </View>

      <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com"
        autoCapitalize="none" keyboardType="email-address" />
      <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

      <NeonButton title="LOGIN" onPress={onLogin} loading={loading} />
      <NeonButton title="Continue with Google" icon="logo-google" variant="outline"
        onPress={onGoogle} style={{ marginTop: spacing.md }} />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ marginTop: spacing.lg }}>
        <Text style={{ color: colors.neonBlue, textAlign: 'center' }}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: spacing.md }}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          New player? <Text style={{ color: colors.neonPurple, fontWeight: '700' }}>Create account</Text>
        </Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

export function friendlyAuthError(e) {
  const code = e?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Incorrect email or password.';
  if (code.includes('user-not-found')) return 'No account found with this email.';
  if (code.includes('email-already-in-use')) return 'This email is already registered.';
  if (code.includes('weak-password')) return 'Password must be at least 6 characters.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Try again later.';
  return e?.message || 'Something went wrong.';
}
