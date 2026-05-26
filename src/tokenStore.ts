import AsyncStorage from '@react-native-async-storage/async-storage';

const RECEIVER_TOKEN_KEY = 'receiverPushToken';
const SEND_HISTORY_KEY = 'sendHistory';
const RECEIVER_ENABLED_KEY = 'receiverNotificationsEnabled';

export type SendAttempt = {
  id: string;
  status: 'sent' | 'failed';
  message: string;
  createdAt: string;
};

export async function getReceiverToken(): Promise<string> {
  return (await AsyncStorage.getItem(RECEIVER_TOKEN_KEY)) ?? '';
}

export async function saveReceiverToken(token: string): Promise<void> {
  await AsyncStorage.setItem(RECEIVER_TOKEN_KEY, token.trim());
}

export async function getReceiverEnabled(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(RECEIVER_ENABLED_KEY);
  return stored !== 'off';
}

export async function saveReceiverEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(RECEIVER_ENABLED_KEY, enabled ? 'on' : 'off');
}

export async function getSendHistory(): Promise<SendAttempt[]> {
  const raw = await AsyncStorage.getItem(SEND_HISTORY_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
}

export async function addSendAttempt(attempt: Omit<SendAttempt, 'id' | 'createdAt'>) {
  const nextAttempt: SendAttempt = {
    ...attempt,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  const history = await getSendHistory();
  const nextHistory = [nextAttempt, ...history].slice(0, 10);
  await AsyncStorage.setItem(SEND_HISTORY_KEY, JSON.stringify(nextHistory));
  return nextHistory;
}
