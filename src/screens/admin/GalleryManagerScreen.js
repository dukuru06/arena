import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Input, NeonButton, EmptyState } from '../../components/ui';
import { watchGallery, addGalleryItem, deleteGalleryItem } from '../../services/cmsService';
import { pickImage, uploadImage } from '../../services/storageService';
import { colors, spacing, radius, typography } from '../../theme';
import { notify, confirm } from '../../utils/notify';

const { width } = Dimensions.get('window');
const ITEM = (Math.min(width, 700) - spacing.lg * 2 - spacing.sm * 2) / 3;

export default function GalleryManagerScreen() {
  const [items, setItems] = useState([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => watchGallery(setItems), []);

  const onUpload = async () => {
    setLoading(true);
    try {
      const asset = await pickImage();
      if (asset) {
        const url = await uploadImage(asset, 'gallery');
        await addGalleryItem({ imageUrl: url, caption: caption.trim() });
        setCaption('');
        notify('Uploaded ✅');
      }
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (g) => {
    if (await confirm('Delete image?')) await deleteGalleryItem(g.id);
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Gallery Manager</Text>
      <Input label="Caption (optional)" value={caption} onChangeText={setCaption} placeholder="e.g. Sunday Cup Finals" />
      <NeonButton title="UPLOAD PHOTO" icon="cloud-upload-outline" onPress={onUpload} loading={loading}
        style={{ marginBottom: spacing.xl }} />

      {items.length === 0 ? (
        <EmptyState icon="images-outline" title="No photos yet" />
      ) : (
        <View style={styles.grid}>
          {items.map((g) => (
            <View key={g.id}>
              <Image source={{ uri: g.imageUrl }} style={styles.thumb} />
              <TouchableOpacity style={styles.del} onPress={() => onDelete(g)}>
                <Ionicons name="trash" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumb: { width: ITEM, height: ITEM, borderRadius: radius.sm },
  del: {
    position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.full, padding: 6,
  },
});
