import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../config/api';

// Opens the gallery, compresses (quality 0.6) and returns a local asset or null.
export async function pickImage(aspect) {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Gallery permission is required to pick an image.');
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.6,
    allowsEditing: !!aspect,
    aspect,
  });
  return result.canceled ? null : result.assets[0];
}

// Uploads a picked asset to the backend's /uploads-api endpoint and returns its URL.
export async function uploadImage(asset, folder) {
  const formData = new FormData();
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    formData.append('file', blob, 'upload.jpg');
  } else {
    formData.append('file', { uri: asset.uri, name: 'upload.jpg', type: 'image/jpeg' });
  }
  const res = await api.postForm(`/uploads-api?folder=${encodeURIComponent(folder)}`, formData);
  return res.url;
}

export async function pickAndUpload(folder, aspect) {
  const asset = await pickImage(aspect);
  if (!asset) return null;
  return uploadImage(asset, folder);
}
