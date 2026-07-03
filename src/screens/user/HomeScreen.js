import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, GlassCard, SectionHeader, Skeleton } from '../../components/ui';
import BannerSlider from '../../components/BannerSlider';
import TournamentCard from '../../components/TournamentCard';
import { watchHomeContent, watchWinners } from '../../services/cmsService';
import { watchTournaments, getTournament } from '../../services/tournamentService';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, radius } from '../../theme';
import { formatINR, formatDate } from '../../utils/format';

export default function HomeScreen({ navigation }) {
  const { profile } = useAuth();
  const [content, setContent] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [winners, setWinners] = useState([]);

  useEffect(() => watchHomeContent(setContent), []);
  useEffect(() => watchTournaments((list) => setUpcoming(list.slice(0, 5)), { status: 'upcoming' }), []);
  useEffect(() => watchWinners((list) => setWinners(list.slice(0, 5))), []);
  useEffect(() => {
    if (content?.featuredTournamentId) {
      getTournament(content.featuredTournamentId).then(setFeatured).catch(() => setFeatured(null));
    } else setFeatured(null);
  }, [content?.featuredTournamentId]);

  if (content === null) {
    return (
      <ScreenContainer>
        <Skeleton height={160} /><Skeleton height={40} /><Skeleton height={200} /><Skeleton height={200} />
      </ScreenContainer>
    );
  }

  const socials = content.socials || {};
  const socialIcons = { youtube: 'logo-youtube', instagram: 'logo-instagram', discord: 'logo-discord', whatsapp: 'logo-whatsapp' };

  return (
    <ScreenContainer>
      <View style={styles.topRow}>
        <View>
          <Text style={typography.caption}>Welcome back,</Text>
          <Text style={typography.h2}>{profile?.username || 'Player'} 🎮</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <TouchableOpacity onPress={() => navigation.navigate('Gallery')}>
            <Ionicons name="images-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <BannerSlider banners={content.banners || []} />

      {(content.announcements || []).length > 0 && (
        <GlassCard style={{ marginTop: spacing.lg, borderColor: colors.neonPurple + '66' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Ionicons name="megaphone" size={16} color={colors.neonPurple} />
            <Text style={[typography.caption, { color: colors.neonPurple, fontWeight: '700' }]}>ANNOUNCEMENTS</Text>
          </View>
          {content.announcements.map((a, i) => (
            <Text key={i} style={[typography.body, { marginTop: 4 }]}>• {a}</Text>
          ))}
        </GlassCard>
      )}

      {featured && (
        <>
          <SectionHeader title="⭐ Featured Tournament" />
          <TournamentCard tournament={featured}
            onPress={() => navigation.navigate('TournamentDetail', { id: featured.id })} />
        </>
      )}

      <SectionHeader title="🔥 Upcoming Tournaments" action="See all"
        onAction={() => navigation.navigate('Tournaments')} />
      {upcoming.length === 0 ? (
        <Text style={typography.caption}>No upcoming tournaments yet. Check back soon!</Text>
      ) : (
        upcoming.map((t) => (
          <TournamentCard key={t.id} tournament={t}
            onPress={() => navigation.navigate('TournamentDetail', { id: t.id })} />
        ))
      )}

      {(content.news || []).length > 0 && (
        <>
          <SectionHeader title="📰 News" />
          {content.news.map((n, i) => (
            <GlassCard key={i}>
              {n.imageUrl ? <Image source={{ uri: n.imageUrl }} style={styles.newsImg} /> : null}
              <Text style={typography.h3}>{n.title}</Text>
              <Text style={[typography.caption, { marginTop: 4 }]}>{n.body}</Text>
            </GlassCard>
          ))}
        </>
      )}

      {winners.length > 0 && (
        <>
          <SectionHeader title="🏆 Recent Winners" action="See all"
            onAction={() => navigation.navigate('Winners')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {winners.map((w) => (
              <GlassCard key={w.id} style={styles.winnerCard}>
                {w.photoUrl ? (
                  <Image source={{ uri: w.photoUrl }} style={styles.winnerImg} />
                ) : (
                  <Ionicons name="trophy" size={40} color={colors.gold} />
                )}
                <Text style={[typography.body, { fontWeight: '700', marginTop: 8 }]} numberOfLines={1}>{w.teamName}</Text>
                <Text style={typography.small} numberOfLines={1}>{w.tournamentName}</Text>
                <Text style={{ color: colors.gold, fontWeight: '700', marginTop: 4 }}>{formatINR(w.prize)}</Text>
                <Text style={typography.small}>{formatDate(w.date)}</Text>
              </GlassCard>
            ))}
          </ScrollView>
        </>
      )}

      {(content.sponsors || []).length > 0 && (
        <>
          <SectionHeader title="Sponsors" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {content.sponsors.map((s, i) => (
              <View key={i} style={styles.sponsor}>
                {s.logoUrl ? <Image source={{ uri: s.logoUrl }} style={styles.sponsorImg} /> : null}
                <Text style={typography.small}>{s.name}</Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      <View style={styles.socialRow}>
        {Object.entries(socialIcons).map(([key, icon]) =>
          socials[key] ? (
            <TouchableOpacity key={key} onPress={() => Linking.openURL(socials[key])} style={styles.socialBtn}>
              <Ionicons name={icon} size={22} color={colors.neonBlue} />
            </TouchableOpacity>
          ) : null
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  newsImg: { width: '100%', height: 120, borderRadius: radius.md, marginBottom: spacing.sm },
  winnerCard: { width: 150, marginRight: spacing.md, alignItems: 'center' },
  winnerImg: { width: 60, height: 60, borderRadius: 30 },
  sponsor: { alignItems: 'center', marginRight: spacing.xl },
  sponsorImg: { width: 56, height: 56, borderRadius: radius.md, marginBottom: 4 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.xxl },
  socialBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center',
  },
});
