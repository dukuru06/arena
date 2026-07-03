import { Alert, Platform } from 'react-native';

export const notify = (title, msg = '') =>
  Platform.OS === 'web' ? window.alert(msg ? `${title}\n${msg}` : title) : Alert.alert(title, msg);

// Cross-platform confirm dialog → Promise<boolean>
export const confirm = (title, msg = '') =>
  new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve(window.confirm(msg ? `${title}\n${msg}` : title));
    } else {
      Alert.alert(title, msg, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Confirm', onPress: () => resolve(true) },
      ]);
    }
  });
