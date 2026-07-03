import React, { useEffect, useRef, useState } from 'react';
import { View, Image, ScrollView, Dimensions, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors, radius, spacing } from '../theme';

const { width } = Dimensions.get('window');
const BANNER_W = Math.min(width, 700) - spacing.lg * 2;

export default function BannerSlider({ banners = [] }) {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * BANNER_W, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / BANNER_W))}
        snapToInterval={BANNER_W}
        decelerationRate="fast"
      >
        {banners.map((b, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.9}
            disabled={!b.link}
            onPress={() => b.link && Linking.openURL(b.link)}
          >
            <Image source={{ uri: b.imageUrl }} style={styles.banner} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {banners.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { width: BANNER_W, height: BANNER_W * 0.45, borderRadius: radius.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textMuted },
  dotActive: { backgroundColor: colors.neonBlue, width: 18 },
});
