import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Skeleton, EmptyState } from '../../components/ui';
import { watchGallery } from '../../services/cmsService';
import { colors, spacing, radius, typography } from '../../theme';

const { width } = Dimensions.get('window');
const ITEM = (Math.min(width, 700) - spacing.lg * 2 - spacing.sm * 2) / 3;

export default function GalleryScreen() {
  const [items, setItems] = useState(null);
  const [viewing, setViewing] = useState(null);
  useEffect(() => watchGallery(setItems), []);

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Gallery</Text>
      {items === null ? (
        <Skeleton height={300} />
      ) : items.length === 0 ? (
        <EmptyState icon="images-outline" title="Gallery is empty" subtitle="Tournament photos will appear here." />
      ) : (
        <View style={styles.grid}>
          {items.map((g) => (
            <TouchableOpacity key={g.id} onPress={() => setViewing(g)}>
              <Image source={{ uri: g.imageUrl }} style={styles.thumb} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Modal visible={!!viewing} transparent animationType="fade" onRequestClose={() => setViewing(null)}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.close} onPress={() => setViewing(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {viewing && (
            <>
              <Image source={{ uri: viewing.imageUrl }} style={styles.full} resizeMode="contain" />
              {viewing.caption ? <Text style={[typography.body, { textAlign: 'center', padding: spacing.lg }]}>{viewing.caption}</Text> : null}
            </>
          )}
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumb: { width: ITEM, height: ITEM, borderRadius: radius.sm },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  close: { position: 'absolute', top: 50, right: 20, zIndex: 2 },
  full: { width: '100%', height: '70%' },
});
