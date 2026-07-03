import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ScreenContainer, GlassCard, StatusBadge, Skeleton, EmptyState, NeonButton } from '../../components/ui';
import { watchTournamentRegistrations, cancelRegistration, confirmRegistration } from '../../services/registrationService';
import { colors, spacing, radius, typography } from '../../theme';
import { formatDateTime, toCSV } from '../../utils/format';
import { notify, confirm } from '../../utils/notify';

export default function RegistrationsScreen({ route }) {
  const { tournament } = route.params;
  const [regs, setRegs] = useState(null);

  useEffect(() => watchTournamentRegistrations(tournament.id, setRegs), [tournament.id]);

  const exportCSV = async () => {
    const csv = toCSV(regs || [], [
      { label: 'Team', value: (r) => r.teamName },
      { label: 'Captain', value: (r) => r.captainName },
      { label: 'Game UID', value: (r) => r.gameUid },
      { label: 'Phone', value: (r) => r.phone },
      { label: 'Email', value: (r) => r.email },
      { label: 'Status', value: (r) => r.status },
      { label: 'Registered', value: (r) => formatDateTime(r.createdAt) },
    ]);
    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${tournament.name.replace(/\W+/g, '_')}_registrations.csv`;
      a.click();
    } else {
      await Clipboard.setStringAsync(csv);
      notify('Copied', 'CSV copied to clipboard — paste it into Sheets/Excel.');
    }
  };

  const onCancel = async (r, refunded) => {
    if (await confirm(refunded ? 'Refund & cancel?' : 'Cancel registration?', `Team ${r.teamName}`)) {
      await cancelRegistration(r, refunded);
      notify('Done', refunded ? 'Marked as refunded.' : 'Registration cancelled.');
    }
  };

  const onManualConfirm = async (r) => {
    if (await confirm('Confirm without payment?', `Team ${r.teamName} will be confirmed manually.`)) {
      await confirmRegistration(r);
    }
  };

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Registrations</Text>
      <Text style={[typography.caption, { marginBottom: spacing.md }]}>
        {tournament.name} · {(regs || []).length} teams
      </Text>
      <NeonButton title="EXPORT CSV" variant="outline" icon="download-outline" onPress={exportCSV}
        style={{ marginBottom: spacing.lg }} />

      {regs === null ? (
        <><Skeleton /><Skeleton /></>
      ) : regs.length === 0 ? (
        <EmptyState title="No registrations yet" />
      ) : (
        regs.map((r) => (
          <GlassCard key={r.id}>
            <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              {r.teamLogo ? <Image source={{ uri: r.teamLogo }} style={styles.logo} /> : null}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[typography.h3, { flex: 1 }]} numberOfLines={1}>{r.teamName}</Text>
                  <StatusBadge status={r.status} />
                </View>
                <Text style={typography.caption}>Captain: {r.captainName} · UID: {r.gameUid}</Text>
                <Text style={typography.caption}>{r.phone} · {r.email}</Text>
                <Text style={typography.small}>{formatDateTime(r.createdAt)}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              {r.status === 'pending_payment' && (
                <NeonButton title="Confirm" onPress={() => onManualConfirm(r)} style={{ flex: 1 }} />
              )}
              {(r.status === 'confirmed' || r.status === 'pending_payment') && (
                <>
                  <NeonButton title="Cancel" variant="danger" onPress={() => onCancel(r, false)} style={{ flex: 1 }} />
                  <NeonButton title="Refund" variant="outline" onPress={() => onCancel(r, true)} style={{ flex: 1 }} />
                </>
              )}
            </View>
          </GlassCard>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logo: { width: 48, height: 48, borderRadius: radius.sm },
});
