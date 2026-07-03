import React, { useState } from 'react';
import { Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenContainer, Input, NeonButton, GlassCard } from '../../components/ui';
import { sendNotification } from '../../services/notificationService';
import { colors, spacing, radius, typography } from '../../theme';
import { isRequired, validate } from '../../utils/validators';
import { notify } from '../../utils/notify';

const TEMPLATES = [
  { type: 'reminder', label: '⏰ Reminder', title: 'Tournament Reminder', body: 'Your tournament starts soon — be ready!' },
  { type: 'room_released', label: '🔑 Room ID', title: 'Room ID Released!', body: 'Room details are live. Check the tournament page.' },
  { type: 'match_starting', label: '🎮 Match Starting', title: 'Match Starting!', body: 'Join the room now — the match begins in 10 minutes.' },
  { type: 'winner', label: '🏆 Winner', title: 'Winner Announcement', body: 'Congratulations to the champions! Check the Winners page.' },
  { type: 'custom', label: '✏️ Custom', title: '', body: '' },
];

export default function SendNotificationScreen() {
  const [template, setTemplate] = useState(TEMPLATES[4]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const applyTemplate = (t) => {
    setTemplate(t);
    setTitle(t.title);
    setBody(t.body);
  };

  const onSend = async () => {
    const err = validate({ title, body }, {
      title: [{ test: isRequired, msg: 'Title is required' }],
      body: [{ test: isRequired, msg: 'Message is required' }],
    });
    if (err) return notify('Check details', err);
    setLoading(true);
    try {
      await sendNotification({ title, body, type: template.type });
      notify('Sent 📣', 'Notification broadcast to all users.');
      setTitle(''); setBody('');
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Send Notification</Text>

      <Text style={styles.label}>Template</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
        {TEMPLATES.map((t) => (
          <TouchableOpacity key={t.type} onPress={() => applyTemplate(t)}
            style={[styles.chip, template.type === t.type && styles.chipActive]}>
            <Text style={{ color: template.type === t.type ? '#fff' : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Input label="Title" value={title} onChangeText={setTitle} placeholder="Notification title" />
      <Input label="Message" value={body} onChangeText={setBody} multiline
        style={{ height: 100, textAlignVertical: 'top' }} placeholder="Notification message…" />

      <GlassCard style={{ borderColor: colors.neonPurple + '66' }}>
        <Text style={[typography.caption, { color: colors.neonPurple, fontWeight: '700', marginBottom: 4 }]}>PREVIEW</Text>
        <Text style={[typography.body, { fontWeight: '700' }]}>{title || 'Title'}</Text>
        <Text style={typography.caption}>{body || 'Message body'}</Text>
      </GlassCard>

      <NeonButton title="SEND TO ALL USERS" onPress={onSend} loading={loading} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, marginRight: 8,
  },
  chipActive: { backgroundColor: colors.neonPurple, borderColor: colors.neonPurple },
});
