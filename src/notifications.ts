import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export const WATER_CHANNEL_ID = 'water-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureWaterNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(WATER_CHANNEL_ID, {
    name: 'Water reminders',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 200, 250],
    lightColor: '#1C7ED6',
    sound: 'default',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function getReceiverExpoPushToken(projectIdOverride?: string): Promise<string> {
  await ensureWaterNotificationChannel();

  if (!Device.isDevice) {
    throw new Error('Push notifications need a physical Android phone.');
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    throw new Error('Notification permission is off.');
  }

  const configuredProjectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const projectId = projectIdOverride?.trim() || configuredProjectId;

  if (!projectId) {
    throw new Error('Expo project id is missing.');
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export async function showLocalDrinkWaterNotification() {
  await ensureWaterNotificationChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Drink water',
      body: 'Time for water.',
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { kind: 'drink-water-local-test' },
    },
    trigger: null,
  });
}
