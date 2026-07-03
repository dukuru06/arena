import React, { useEffect, useState } from 'react';
import { View, Text, Image, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, GlassCard, NeonButton, StatusBadge, Skeleton, EmptyState, Input } from '../../components/ui';
import { watchPayments, approvePayment, rejectPayment } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius, typography } from '../../theme';
import { formatINR, formatDateTime } from '../../utils/format';
import { notify, confirm } from '../../utils/notify';

const TABS = ['pending', 'approved', 'rejected'];

export default function PaymentsScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState('pending');
  const [payments, setPayments] = useState(null);
  const [viewing, setViewing] = useState(null); // full-size screenshot
  const [rejecting, setRejecting] = useState(null); // payment being rejected
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    setPayments(null);
    return watchPayments(setPayments, tab);
  }, [tab]);

  const onApprove = async (p) => {
    if (!(await confirm('Approve payment?', `${p.teamName} · ${formatINR(p.amount)} · ${p.txnId}`))) return;
    setBusy(p.id);
    try {
      await approvePayment(p, user.uid);
      notify('Approved ✅', 'Registration confirmed and user notified.');
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setBusy(null);
    }
  };

  const onReject = async () => {
    const p = rejecting;
    setBusy(p.id);
    setRejecting(null);
    try {
      await rejectPayment(p, user.uid, reason);
      notify('Rejected', 'User has been notified.');
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setBusy(null);
      setReason('');
    }
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Payments</Text>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {payments === null ? (
        <><Skeleton height={140} /><Skeleton height={140} /></>
      ) : payments.length === 0 ? (
        <EmptyState icon="card-outline" title={`No ${tab} payments`} />
      ) : (
        payments.map((p) => (
          <GlassCard key={p.id}>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity onPress={() => setViewing(p.screenshotUrl)}>
                <Image source={{ uri: p.screenshotUrl }} style={styles.thumb} />
                <View style={styles.zoomBadge}><Ionicons name="expand" size={12} color="#fff" /></View>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[typography.h3, { flex: 1 }]} numberOfLines={1}>{p.teamName}</Text>
                  <StatusBadge status={p.status} />
                </View>
                <Text style={typography.caption}>{p.userName}</Text>
                <Text style={typography.caption} numberOfLines={1}>{p.tournamentName}</Text>
                <Text style={[typography.body, { color: colors.gold, fontWeight: '700', marginTop: 2 }]}>{formatINR(p.amount)}</Text>
                <Text style={typography.small}>Txn: {p.txnId}</Text>
                <Text style={typography.small}>Uploaded: {formatDateTime(p.createdAt)}</Text>
              </View>
            </View>
            {p.status === 'pending' && (
              <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
                <NeonButton title="APPROVE" onPress={() => onApprove(p)} loading={busy === p.id} style={{ flex: 1 }} />
                <NeonButton title="REJECT" variant="danger" onPress={() => setRejecting(p)} style={{ flex: 1 }} />
              </View>
            )}
            {p.status === 'rejected' && p.rejectReason ? (
              <Text style={[typography.small, { color: colors.danger, marginTop: spacing.sm }]}>Reason: {p.rejectReason}</Text>
            ) : null}
          </GlassCard>
        ))
      )}

      {/* Full-size screenshot viewer */}
      <Modal visible={!!viewing} transparent animationType="fade" onRequestClose={() => setViewing(null)}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.close} onPress={() => setViewing(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {viewing && <Image source={{ uri: viewing }} style={styles.full} resizeMode="contain" />}
        </View>
      </Modal>

      {/* Reject reason dialog */}
      <Modal visible={!!rejecting} transparent animationType="slide" onRequestClose={() => setRejecting(null)}>
        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <Text style={[typography.h3, { marginBottom: spacing.md }]}>Reject payment</Text>
            <Input label="Reason (optional)" value={reason} onChangeText={setReason} placeholder="e.g. Wrong amount / fake screenshot" />
            <NeonButton title="CONFIRM REJECT" variant="danger" onPress={onReject} />
            <NeonButton title="Cancel" variant="outline" onPress={() => setRejecting(null)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md, padding: 4, marginBottom: spacing.lg },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: colors.neonBlue + '33' },
  tabText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  thumb: { width: 80, height: 100, borderRadius: radius.sm, backgroundColor: colors.bgElevated },
  zoomBadge: {
    position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4, padding: 2,
  },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  close: { position: 'absolute', top: 50, right: 20, zIndex: 2 },
  full: { width: '100%', height: '85%' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.bgElevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.xl, paddingBottom: 40,
  },
});
