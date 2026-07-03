import React, { useEffect, useState } from 'react';
import { Text, Image, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { ScreenContainer, Input, NeonButton, GlassCard } from '../../components/ui';
import { submitPayment } from '../../services/paymentService';
import { pickImage } from '../../services/storageService';
import { watchSettings } from '../../services/cmsService';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius, typography } from '../../theme';
import { isRequired } from '../../utils/validators';
import { notify } from '../../utils/notify';
import { formatINR } from '../../utils/format';

export default function PaymentUploadScreen({ route, navigation }) {
  const { registration } = route.params;
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [txnId, setTxnId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => watchSettings(setSettings), []);
  const amount = registration.entryFee;

  const pickScreenshot = async () => {
    try {
      const asset = await pickImage();
      if (asset) setScreenshot(asset);
    } catch (e) {
      notify('Error', e.message);
    }
  };

  const copyUpi = async () => {
    if (!settings.upiId) return;
    await Clipboard.setStringAsync(settings.upiId);
    notify('Copied', settings.upiId);
  };

  const onSubmit = async () => {
    if (!isRequired(txnId)) return notify('Missing', 'Enter the UPI Transaction ID');
    if (!screenshot) return notify('Missing', 'Upload the payment screenshot');
    setLoading(true);
    try {
      await submitPayment({ registration, user, screenshotAsset: screenshot, txnId, amount });
      notify('Submitted ✅', 'Your payment is under review. You will be notified once approved.');
      navigation.popToTop();
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Payment</Text>
      <Text style={[typography.caption, { marginBottom: spacing.xl }]}>
        {registration.tournamentName} · Pay {formatINR(amount)}
      </Text>

      <GlassCard style={{ alignItems: 'center', borderColor: colors.neonBlue + '66' }}>
        <Text style={[typography.h3, { marginBottom: spacing.sm }]}>Pay via UPI</Text>
        {settings.qrCodeUrl ? (
          <Image source={{ uri: settings.qrCodeUrl }} style={styles.qr} />
        ) : (
          <View style={[styles.qr, styles.qrFallback]}>
            <Ionicons name="qr-code-outline" size={64} color={colors.textMuted} />
          </View>
        )}
        {settings.upiId ? (
          <TouchableOpacity onPress={copyUpi} style={styles.upiRow}>
            <Text style={[typography.h3, { color: colors.neonBlue }]}>{settings.upiId}</Text>
            <Ionicons name="copy-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
        {settings.upiName ? <Text style={typography.caption}>{settings.upiName}</Text> : null}
        <Text style={[typography.h2, { color: colors.gold, marginTop: spacing.sm }]}>{formatINR(amount)}</Text>
      </GlassCard>

      <Text style={[typography.caption, { marginVertical: spacing.md }]}>
        1. Pay the exact amount to the UPI above.{'\n'}
        2. Enter the transaction ID and upload the screenshot.{'\n'}
        3. Admin verifies and confirms your slot.
      </Text>

      <Input label="UPI Transaction ID" value={txnId} onChangeText={setTxnId} placeholder="e.g. 415223367890" />

      <GlassCard onPress={pickScreenshot} style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
        {screenshot ? (
          <Image source={{ uri: screenshot.uri }} style={styles.preview} resizeMode="contain" />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="cloud-upload-outline" size={36} color={colors.neonBlue} />
            <Text style={[typography.caption, { marginTop: 6 }]}>Tap to upload payment screenshot</Text>
          </View>
        )}
      </GlassCard>

      <NeonButton title="SUBMIT FOR VERIFICATION" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  qr: { width: 180, height: 180, borderRadius: radius.md, marginBottom: spacing.md },
  qrFallback: { backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  upiRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  preview: { width: '100%', height: 260, borderRadius: radius.md },
});
