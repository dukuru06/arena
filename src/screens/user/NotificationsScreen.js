import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, GlassCard, Skeleton, EmptyState } from '../../components/ui';
import { watchUserNotifications } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme';
import { timeAgo } from '../../utils/format';

const TYPE_ICONS = {
  payment_approved: { icon: 'checkmark-circle', color: colors.success },
  payment_rejected: { icon: 'close-circle', color: colors.danger },
  room_released: { icon: 'key', color: colors.neonBlue },
  reminder: { icon: 'alarm', color: colors.warning },
  match_starting: { icon: 'play-circle', color: colors.neonPink },
  winner: { icon: 'trophy', color: colors.gold },
  custom: { icon: 'notifications', color: colors.neonPurple },
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => (user ? watchUserNotifications(user.uid, setItems) : undefined), [user]);

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Notifications</Text>
      {items === null ? (
        <><Skeleton height={70} /><Skeleton height={70} /><Skeleton height={70} /></>
      ) : items.length === 0 ? (
        <EmptyState icon="notifications-off-outline" title="No notifications" subtitle="You're all caught up!" />
      ) : (
        items.map((n) => {
          const t = TYPE_ICONS[n.type] || TYPE_ICONS.custom;
          return (
            <GlassCard key={n.id} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
              <Ionicons name={t.icon} size={24} color={t.color} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { fontWeight: '700' }]}>{n.title}</Text>
                <Text style={[typography.caption, { marginTop: 2 }]}>{n.body}</Text>
                <Text style={[typography.small, { marginTop: 4 }]}>{timeAgo(n.createdAt)}</Text>
              </View>
            </GlassCard>
          );
        })
      )}
    </ScreenContainer>
  );
}
