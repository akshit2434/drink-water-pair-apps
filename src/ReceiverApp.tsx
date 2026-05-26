import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import {
  getReceiverExpoPushToken,
  showLocalDrinkWaterNotification,
} from './notifications';
import {
  getReceiverEnabled,
  saveReceiverEnabled,
} from './tokenStore';

export function ReceiverApp() {
  const [enabled, setEnabled] = useState(true);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('Setting up notifications...');
  const [loading, setLoading] = useState(true);

  const refreshToken = useCallback(async () => {
    setLoading(true);
    try {
      const storedEnabled = await getReceiverEnabled();
      setEnabled(storedEnabled);
      const nextToken = await getReceiverExpoPushToken();
      setToken(nextToken);
      setStatus(storedEnabled ? 'Notifications are on.' : 'Notifications are off.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not set up notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshToken();
  }, [refreshToken]);

  async function toggleEnabled(nextEnabled: boolean) {
    setEnabled(nextEnabled);
    await saveReceiverEnabled(nextEnabled);
    setStatus(nextEnabled ? 'Notifications are on.' : 'Notifications are off.');
  }

  async function copyToken() {
    await Clipboard.setStringAsync(token);
    Alert.alert('Copied', 'Paste this token into the sender app.');
  }

  async function sendLocalTest() {
    await showLocalDrinkWaterNotification();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Drink Water Reminder</Text>
            <Text style={styles.status}>{status}</Text>
          </View>
          <Switch value={enabled} onValueChange={toggleEnabled} />
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#1C7ED6" />
            <Text style={styles.loadingText}>Preparing token...</Text>
          </View>
        ) : (
          <View style={styles.tokenBox}>
            <Text style={styles.label}>Receiver token</Text>
            <Text selectable style={styles.tokenText}>
              {token || 'No token yet.'}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={!token}
            style={[styles.primaryAction, !token && styles.disabledAction]}
            onPress={copyToken}
          >
            <Text style={styles.primaryActionText}>Copy token</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={refreshToken}>
            <Text style={styles.secondaryActionText}>Refresh</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={sendLocalTest}>
            <Text style={styles.secondaryActionText}>Test notification</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FBFD',
  },
  content: {
    flexGrow: 1,
    padding: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    paddingTop: 18,
  },
  title: {
    color: '#102A43',
    fontSize: 26,
    fontWeight: '900',
  },
  status: {
    marginTop: 6,
    color: '#526D82',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingBox: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#526D82',
    fontWeight: '700',
  },
  tokenBox: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#C9DDEA',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  label: {
    color: '#627D98',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  tokenText: {
    color: '#102A43',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  primaryAction: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1C7ED6',
    paddingVertical: 14,
  },
  disabledAction: {
    opacity: 0.5,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryAction: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B6D0E2',
    paddingVertical: 14,
  },
  secondaryActionText: {
    color: '#1C5D8F',
    fontSize: 16,
    fontWeight: '800',
  },
});
