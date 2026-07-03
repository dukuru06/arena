import React, { useEffect, useState } from 'react';
import { Text, Image, StyleSheet } from 'react-native';
import { ScreenContainer, Input, NeonButton, GlassCard, SectionHeader, Skeleton } from '../../components/ui';
import { watchSettings, updateSettings } from '../../services/cmsService';
import { pickAndUpload } from '../../services/storageService';
import { spacing, radius, typography, colors } from '../../theme';
import { notify } from '../../utils/notify';

const PAGES = [
  { key: 'rules', label: 'Default Rules' },
  { key: 'aboutUs', label: 'About Us' },
  { key: 'contact', label: 'Contact Details' },
  { key: 'faq', label: 'FAQ' },
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'privacy', label: 'Privacy Policy' },
];

export default function AdminSettingsScreen() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => watchSettings((s) => {
    setSettings(s);
    setForm((f) => f ?? { ...s });
  }), []);

  if (form === null) return <ScreenContainer><Skeleton height={300} /></ScreenContainer>;
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const changeQr = async () => {
    try {
      const url = await pickAndUpload('settings', [1, 1]);
      if (url) {
        await updateSettings({ qrCodeUrl: url });
        setForm((f) => ({ ...f, qrCodeUrl: url }));
      }
    } catch (e) {
      notify('Error', e.message);
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      notify('Saved ✅', 'Settings updated across the app.');
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>App Settings</Text>

      <SectionHeader title="💳 UPI Payment Details" />
      <Input label="UPI ID" value={form.upiId || ''} onChangeText={set('upiId')} placeholder="yourname@upi" autoCapitalize="none" />
      <Input label="UPI Display Name" value={form.upiName || ''} onChangeText={set('upiName')} placeholder="Arena Esports" />
      <GlassCard onPress={changeQr} style={{ alignItems: 'center' }}>
        {form.qrCodeUrl ? (
          <Image source={{ uri: form.qrCodeUrl }} style={styles.qr} />
        ) : (
          <Text style={typography.caption}>Tap to upload payment QR code</Text>
        )}
      </GlassCard>

      <SectionHeader title="📄 Content Pages" />
      {PAGES.map((p) => (
        <Input key={p.key} label={p.label} value={form[p.key] || ''} onChangeText={set(p.key)}
          multiline style={{ height: 90, textAlignVertical: 'top' }} placeholder={`${p.label}…`} />
      ))}

      <NeonButton title="SAVE ALL SETTINGS" onPress={onSave} loading={saving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  qr: { width: 140, height: 140, borderRadius: radius.md },
});
