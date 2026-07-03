import { Platform } from 'react-native';
import { api } from '../config/api';

// Registers the device for push and stores the Expo push token on the
// backend (server/push.js delivers to it via the Expo push API).
export async function registerForPushNotifications() {
  if (Platform.OS === 'web') return; // Web uses in-app polling instead of push.
  const Notifications = await import('expo-notifications');
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Tournaments',
      importance: Notifications.AndroidImportance.MAX,
      lightColor: '#00D4FF',
    });
  }
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await api.post('/users/me/push-token', { token });
}
