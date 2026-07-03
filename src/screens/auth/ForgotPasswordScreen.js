import React, { useState } from 'react';
import { Text, Alert, Platform } from 'react-native';
import { ScreenContainer, Input, NeonButton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { spacing, typography } from '../../theme';
import { isEmail } from '../../utils/validators';

const notify = (title, msg) =>
  Platform.OS === 'web' ? window.alert(`${title}\n${msg}`) : Alert.alert(title, msg);

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onReset = async () => {
    if (!isEmail(email)) return notify('Check details', 'Enter a valid email');
    setLoading(true);
    try {
      const res = await resetPassword(email);
      notify('Password reset', res?.message || 'Check your inbox for the password reset link.');
      navigation.goBack();
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ justifyContent: 'center', flexGrow: 1 }}>
      <Text style={[typography.h1, { marginBottom: spacing.xs }]}>Reset Password</Text>
      <Text style={[typography.caption, { marginBottom: spacing.xl }]}>
        We'll email you a link to reset your password.
      </Text>
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com"
        autoCapitalize="none" keyboardType="email-address" />
      <NeonButton title="SEND RESET LINK" onPress={onReset} loading={loading} />
    </ScreenContainer>
  );
}
