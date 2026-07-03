import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, GlassCard, Skeleton, EmptyState } from '../../components/ui';
import { watchAllUsers, setUserBlocked } from '../../services/userService';
import { colors, spacing, radius, typography } from '../../theme';
import { formatDate } from '../../utils/format';
import { confirm } from '../../utils/notify';

export default function UsersScreen() {
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => watchAllUsers(setUsers), []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.toLowerCase();
    return users.filter((u) =>
      !q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q)
    );
  }, [users, search]);

  const toggleBlock = async (u) => {
    const action = u.blocked ? 'Unblock' : 'Block';
    if (await confirm(`${action} ${u.username}?`, u.blocked ? 'User will regain access.' : 'User will be locked out of the app.')) {
      await setUserBlocked(u.uid, !u.blocked);
    }
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.md }]}>Users</Text>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Search name, email, phone…"
          placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch} />
      </View>

      {users === null ? (
        <><Skeleton height={70} /><Skeleton height={70} /></>
      ) : filtered.length === 0 ? (
        <EmptyState icon="people-outline" title="No users found" />
      ) : (
        filtered.map((u) => (
          <GlassCard key={u.uid} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md }}>
            {u.photoURL ? (
              <Image source={{ uri: u.photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person" size={18} color={colors.textMuted} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { fontWeight: '700' }]}>
                {u.username} {u.role === 'admin' ? '👑' : ''} {u.blocked ? '🚫' : ''}
              </Text>
              <Text style={typography.small}>{u.email} · {u.phone || 'no phone'}</Text>
              <Text style={typography.small}>Joined {formatDate(u.createdAt)}</Text>
            </View>
            {u.role !== 'admin' && (
              <TouchableOpacity onPress={() => toggleBlock(u)}
                style={[styles.blockBtn, u.blocked && { backgroundColor: colors.success + '22', borderColor: colors.success }]}>
                <Text style={{ color: u.blocked ? colors.success : colors.danger, fontSize: 12, fontWeight: '700' }}>
                  {u.blocked ? 'UNBLOCK' : 'BLOCK'}
                </Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.lg,
  },
  searchInput: { flex: 1, color: colors.text, paddingVertical: 10, fontSize: 15 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  blockBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.danger, backgroundColor: colors.danger + '22',
  },
});
