import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, GlassCard, NeonButton, SectionHeader, Input, Skeleton } from '../../components/ui';
import { watchHomeContent, updateHomeContent } from '../../services/cmsService';
import { watchTournaments } from '../../services/tournamentService';
import { pickAndUpload } from '../../services/storageService';
import { colors, spacing, radius, typography } from '../../theme';
import { notify, confirm } from '../../utils/notify';

export default function HomeCMSScreen() {
  const [content, setContent] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [news, setNews] = useState({ title: '', body: '' });
  const [sponsor, setSponsor] = useState('');
  const [socials, setSocials] = useState(null);

  useEffect(() => watchHomeContent(setContent), []);
  useEffect(() => watchTournaments(setTournaments, { status: 'upcoming' }), []);
  useEffect(() => {
    if (content && socials === null) setSocials(content.socials || {});
  }, [content]);

  if (content === null) return <ScreenContainer><Skeleton height={200} /><Skeleton height={200} /></ScreenContainer>;

  const banners = content.banners || [];
  const announcements = content.announcements || [];
  const newsList = content.news || [];
  const sponsors = content.sponsors || [];

  const addBanner = async () => {
    try {
      const url = await pickAndUpload('banners', [16, 7]);
      if (url) await updateHomeContent({ banners: [...banners, { imageUrl: url }] });
    } catch (e) {
      notify('Error', e.message);
    }
  };

  const removeBanner = async (i) => {
    if (await confirm('Remove banner?')) {
      await updateHomeContent({ banners: banners.filter((_, j) => j !== i) });
    }
  };

  const addAnnouncement = async () => {
    if (!announcement.trim()) return;
    await updateHomeContent({ announcements: [...announcements, announcement.trim()] });
    setAnnouncement('');
  };

  const addNews = async () => {
    if (!news.title.trim()) return notify('Missing', 'News title required');
    await updateHomeContent({ news: [{ ...news }, ...newsList] });
    setNews({ title: '', body: '' });
  };

  const addSponsor = async () => {
    if (!sponsor.trim()) return;
    try {
      const url = await pickAndUpload('sponsors', [1, 1]);
      await updateHomeContent({ sponsors: [...sponsors, { name: sponsor.trim(), logoUrl: url }] });
      setSponsor('');
    } catch (e) {
      notify('Error', e.message);
    }
  };

  const saveSocials = async () => {
    await updateHomeContent({ socials });
    notify('Saved', 'Social links updated.');
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.md }]}>Home Page CMS</Text>
      <Text style={typography.caption}>Changes go live instantly — no app update needed.</Text>

      <SectionHeader title="🖼 Banner Slider" />
      {banners.map((b, i) => (
        <GlassCard key={i} style={{ padding: 0, overflow: 'hidden' }}>
          <Image source={{ uri: b.imageUrl }} style={styles.banner} />
          <TouchableOpacity style={styles.removeBtn} onPress={() => removeBanner(i)}>
            <Ionicons name="trash" size={16} color="#fff" />
          </TouchableOpacity>
        </GlassCard>
      ))}
      <NeonButton title="+ ADD BANNER" variant="outline" onPress={addBanner} />

      <SectionHeader title="📢 Announcements" />
      {announcements.map((a, i) => (
        <GlassCard key={i} style={styles.rowCard}>
          <Text style={[typography.body, { flex: 1 }]}>{a}</Text>
          <TouchableOpacity onPress={() => updateHomeContent({ announcements: announcements.filter((_, j) => j !== i) })}>
            <Ionicons name="close-circle" size={20} color={colors.danger} />
          </TouchableOpacity>
        </GlassCard>
      ))}
      <Input value={announcement} onChangeText={setAnnouncement} placeholder="New announcement…" />
      <NeonButton title="+ ADD ANNOUNCEMENT" variant="outline" onPress={addAnnouncement} />

      <SectionHeader title="⭐ Featured Tournament" />
      {tournaments.map((t) => (
        <GlassCard key={t.id} style={styles.rowCard}
          onPress={() => updateHomeContent({ featuredTournamentId: content.featuredTournamentId === t.id ? null : t.id })}>
          <Text style={[typography.body, { flex: 1 }]}>{t.name}</Text>
          <Ionicons
            name={content.featuredTournamentId === t.id ? 'star' : 'star-outline'}
            size={20} color={colors.gold} />
        </GlassCard>
      ))}

      <SectionHeader title="📰 News" />
      {newsList.map((n, i) => (
        <GlassCard key={i} style={styles.rowCard}>
          <Text style={[typography.body, { flex: 1 }]} numberOfLines={1}>{n.title}</Text>
          <TouchableOpacity onPress={() => updateHomeContent({ news: newsList.filter((_, j) => j !== i) })}>
            <Ionicons name="close-circle" size={20} color={colors.danger} />
          </TouchableOpacity>
        </GlassCard>
      ))}
      <Input value={news.title} onChangeText={(v) => setNews((n) => ({ ...n, title: v }))} placeholder="News title" />
      <Input value={news.body} onChangeText={(v) => setNews((n) => ({ ...n, body: v }))} placeholder="News body" multiline />
      <NeonButton title="+ ADD NEWS" variant="outline" onPress={addNews} />

      <SectionHeader title="🤝 Sponsors" />
      {sponsors.map((s, i) => (
        <GlassCard key={i} style={styles.rowCard}>
          {s.logoUrl ? <Image source={{ uri: s.logoUrl }} style={styles.sponsorLogo} /> : null}
          <Text style={[typography.body, { flex: 1 }]}>{s.name}</Text>
          <TouchableOpacity onPress={() => updateHomeContent({ sponsors: sponsors.filter((_, j) => j !== i) })}>
            <Ionicons name="close-circle" size={20} color={colors.danger} />
          </TouchableOpacity>
        </GlassCard>
      ))}
      <Input value={sponsor} onChangeText={setSponsor} placeholder="Sponsor name (logo picked next)" />
      <NeonButton title="+ ADD SPONSOR (PICKS LOGO)" variant="outline" onPress={addSponsor} />

      <SectionHeader title="🔗 Social Links" />
      {socials !== null && (
        <>
          <Input label="YouTube" value={socials.youtube || ''} onChangeText={(v) => setSocials((s) => ({ ...s, youtube: v }))} placeholder="https://youtube.com/@…" autoCapitalize="none" />
          <Input label="Instagram" value={socials.instagram || ''} onChangeText={(v) => setSocials((s) => ({ ...s, instagram: v }))} placeholder="https://instagram.com/…" autoCapitalize="none" />
          <Input label="Discord" value={socials.discord || ''} onChangeText={(v) => setSocials((s) => ({ ...s, discord: v }))} placeholder="https://discord.gg/…" autoCapitalize="none" />
          <Input label="WhatsApp" value={socials.whatsapp || ''} onChangeText={(v) => setSocials((s) => ({ ...s, whatsapp: v }))} placeholder="https://wa.me/…" autoCapitalize="none" />
          <NeonButton title="SAVE SOCIAL LINKS" onPress={saveSocials} />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 120 },
  removeBtn: {
    position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.full, padding: 8,
  },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  sponsorLogo: { width: 32, height: 32, borderRadius: radius.sm },
});
