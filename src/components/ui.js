import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  StyleSheet, Animated, ScrollView, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows, STATUS_COLORS } from '../theme';

export function ScreenContainer({ children, scroll = true, onRefresh, refreshing = false, style }) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[{ padding: spacing.lg, paddingBottom: 100 }, style]}
      refreshControl={onRefresh ? (
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neonBlue} />
      ) : undefined}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: spacing.lg }, style]}>{children}</View>
  );
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>{content}</SafeAreaView>;
}

export function GlassCard({ children, style, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} activeOpacity={0.8} style={[styles.glassCard, style]}>
      {children}
    </Wrapper>
  );
}

export function NeonButton({ title, onPress, loading, disabled, variant = 'primary', icon, style }) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const inner = loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {icon ? <Ionicons name={icon} size={18} color={isOutline ? colors.neonBlue : '#fff'} /> : null}
      <Text style={[styles.btnText, isOutline && { color: colors.neonBlue }]}>{title}</Text>
    </View>
  );
  if (isOutline) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}
        style={[styles.btnOutline, (disabled || loading) && { opacity: 0.5 }, style]}>
        {inner}
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.85}
      style={[(disabled || loading) && { opacity: 0.5 }, style]}>
      <LinearGradient
        colors={isDanger ? ['#EF4444', '#B91C1C'] : colors.gradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.btn, !isDanger && shadows.neon]}
      >
        {inner}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function Input({ label, error, style, ...props }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error && { borderColor: colors.danger }, style]}
        {...props}
      />
      {error ? <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}

export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || colors.textMuted;
  const label = String(status || '').replace(/_/g, ' ').toUpperCase();
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={typography.h3}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ color: colors.neonBlue, fontWeight: '600' }}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Skeleton({ height = 80, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[styles.skeleton, { height, opacity }, style]} />;
}

export function EmptyState({ icon = 'trophy-outline', title, subtitle }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={[typography.h3, { marginTop: spacing.md }]}>{title}</Text>
      {subtitle ? <Text style={[typography.caption, { textAlign: 'center', marginTop: 4 }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function CountdownTimer({ target, label = 'Starts in' }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const targetMs = target?.toDate ? target.toDate().getTime() : new Date(target).getTime();
  const diff = Math.max(0, targetMs - now);
  if (!targetMs || isNaN(targetMs)) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const cell = (v, u) => (
    <View style={styles.countCell} key={u}>
      <Text style={styles.countNum}>{String(v).padStart(2, '0')}</Text>
      <Text style={styles.countUnit}>{u}</Text>
    </View>
  );
  return (
    <View style={{ alignItems: 'center', marginVertical: spacing.md }}>
      <Text style={[typography.caption, { marginBottom: spacing.sm }]}>{diff === 0 ? 'Started' : label}</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {cell(d, 'DAYS')}{cell(h, 'HRS')}{cell(m, 'MIN')}{cell(s, 'SEC')}
      </View>
    </View>
  );
}

export function StatCard({ label, value, icon, color = colors.neonBlue }) {
  return (
    <GlassCard style={styles.statCard}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[typography.h2, { marginTop: spacing.sm }]}>{value}</Text>
      <Text style={typography.caption}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    paddingVertical: 13,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.neonBlue,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  inputLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  skeleton: { backgroundColor: colors.card, borderRadius: radius.lg, marginBottom: spacing.md },
  empty: { alignItems: 'center', paddingVertical: 60 },
  countCell: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.neonBlue + '55',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    minWidth: 56,
    alignItems: 'center',
  },
  countNum: { color: colors.neonBlue, fontSize: 20, fontWeight: '800' },
  countUnit: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },
  statCard: { flex: 1, minWidth: '45%', alignItems: 'flex-start' },
});
