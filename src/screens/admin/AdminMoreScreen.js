import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, GlassCard, NeonButton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme';

const ITEMS = [
  { icon: 'color-palette-outline', title: 'Home Page CMS', subtitle: 'Banners, announcements, news, sponsors', route: 'HomeCMS' },
  { icon: 'megaphone-outline', title: 'Send Notification', subtitle: 'Broadcast to all users', route: 'SendNotification' },
  { icon: 'trophy-outline', title: 'Declare Winners', subtitle: 'Publish champions & prizes', route: 'WinnersManager' },
  { icon: 'images-outline', title: 'Gallery Manager', subtitle: 'Tournament photos & posters', route: 'GalleryManager' },
  { icon: 'settings-outline', title: 'App Settings', subtitle: 'UPI details, rules, pages', route: 'AdminSettings' },
];

export default function AdminMoreScreen({ navigation }) {
  const { logout, profile } = useAuth();
  return (
    <ScreenContainer>
      <Text style={typography.h1}>More</Text>
      <Text style={[typography.caption, { marginBottom: spacing.lg }]}>Signed in as {profile?.username} (admin)</Text>
      {ITEMS.map((item) => (
        <GlassCard key={item.route} onPress={() => navigation.navigate(item.route)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <Ionicons name={item.icon} size={24} color={colors.neonBlue} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.body, { fontWeight: '700' }]}>{item.title}</Text>
            <Text style={typography.small}>{item.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </GlassCard>
      ))}
      <NeonButton title="LOGOUT" variant="danger" icon="log-out-outline" onPress={logout} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  );
}
