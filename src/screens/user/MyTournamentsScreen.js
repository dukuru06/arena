import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { ScreenContainer, GlassCard, StatusBadge, Skeleton, EmptyState, NeonButton } from '../../components/ui';
import { watchUserRegistrations } from '../../services/registrationService';
import { watchUserPayments } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { spacing, typography, colors } from '../../theme';
import { formatDateTime, timeAgo } from '../../utils/format';

export default function MyTournamentsScreen({ navigation }) {
  const { user } = useAuth();
  const [regs, setRegs] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => (user ? watchUserRegistrations(user.uid, setRegs) : undefined), [user]);
  useEffect(() => (user ? watchUserPayments(user.uid, setPayments) : undefined), [user]);

  const paymentFor = (regId) => payments.find((p) => p.registrationId === regId);

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>My Tournaments</Text>
      {regs === null ? (
        <><Skeleton /><Skeleton /><Skeleton /></>
      ) : regs.length === 0 ? (
        <EmptyState title="No registrations yet" subtitle="Join a tournament to see it here." />
      ) : (
        regs.map((r) => {
          const pay = paymentFor(r.id);
          return (
            <GlassCard key={r.id} onPress={() => navigation.navigate('TournamentDetail', { id: r.tournamentId })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[typography.h3, { flex: 1 }]} numberOfLines={1}>{r.tournamentName}</Text>
                <StatusBadge status={r.status} />
              </View>
              <Text style={[typography.caption, { marginTop: 4 }]}>
                Team {r.teamName} · {r.game} · registered {timeAgo(r.createdAt)}
              </Text>
              {pay && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm }}>
                  <Text style={typography.caption}>Payment · {pay.txnId}</Text>
                  <StatusBadge status={pay.status} />
                </View>
              )}
              {r.status === 'pending_payment' && !pay && (
                <NeonButton title="UPLOAD PAYMENT" style={{ marginTop: spacing.md }}
                  onPress={() => navigation.navigate('PaymentUpload', { registration: { ...r, entryFee: r.entryFee } })} />
              )}
              {r.status === 'confirmed' && (
                <Text style={[typography.caption, { color: colors.success, marginTop: spacing.sm }]}>
                  ✅ Slot confirmed — Room ID appears on the tournament page before the match.
                </Text>
              )}
            </GlassCard>
          );
        })
      )}
    </ScreenContainer>
  );
}
