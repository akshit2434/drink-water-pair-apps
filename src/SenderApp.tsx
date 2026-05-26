import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SendPushResult, sendDrinkWaterPush } from './sendPush';
import {
  SendAttempt,
  addSendAttempt,
  getReceiverToken,
  getSendHistory,
  saveReceiverToken,
} from './tokenStore';

type SendState = 'idle' | 'sending' | 'sent' | 'failed';

export function SenderApp() {
  const [token, setToken] = useState('');
  const [draftToken, setDraftToken] = useState('');
  const [sendState, setSendState] = useState<SendState>('idle');
  const [statusText, setStatusText] = useState('Ready.');
  const [history, setHistory] = useState<SendAttempt[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const loadStoredState = useCallback(async () => {
    const [storedToken, storedHistory] = await Promise.all([
      getReceiverToken(),
      getSendHistory(),
    ]);
    setToken(storedToken);
    setDraftToken(storedToken);
    setHistory(storedHistory);
  }, []);

  useEffect(() => {
    loadStoredState();
  }, [loadStoredState]);

  async function recordResult(result: SendPushResult) {
    const sent = result.status === 'sent';
    const message = sent
      ? 'Sent.'
      : result.reason || 'Failed to send.';
    setSendState(sent ? 'sent' : 'failed');
    setStatusText(message);
    setHistory(
      await addSendAttempt({
        status: sent ? 'sent' : 'failed',
        message,
      }),
    );
  }

  async function handleSend() {
    setSendState('sending');
    setStatusText('Sending...');
    const result = await sendDrinkWaterPush({ token, timeoutMs: 12000 });
    await recordResult(result);
  }

  async function handleSaveToken() {
    await saveReceiverToken(draftToken);
    const trimmed = draftToken.trim();
    setToken(trimmed);
    setDraftToken(trimmed);
    setSettingsOpen(false);
    Alert.alert('Saved', 'Receiver token saved on this phone.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.senderHeader}>
        <Text style={styles.senderTitle}>Drink Water Button</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.settingsButton}
          onPress={() => setSettingsOpen(true)}
        >
          <Text style={styles.settingsButtonText}>Token</Text>
        </Pressable>
      </View>

      <View style={styles.senderMain}>
        <Pressable
          accessibilityRole="button"
          disabled={sendState === 'sending'}
          onPress={handleSend}
          style={({ pressed }) => [
            styles.bigButton,
            pressed && styles.bigButtonPressed,
            sendState === 'sending' && styles.bigButtonDisabled,
          ]}
        >
          {sendState === 'sending' ? (
            <ActivityIndicator color="#FFFFFF" size="large" />
          ) : (
            <Text style={styles.bigButtonText}>DRINK</Text>
          )}
        </Pressable>
        <Text
          style={[
            styles.statusText,
            sendState === 'sent' && styles.sentText,
            sendState === 'failed' && styles.failedText,
          ]}
        >
          {statusText}
        </Text>
      </View>

      <View style={styles.historyPanel}>
        <Text style={styles.sectionLabel}>Last attempts</Text>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No sends yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.historyRow}>
              <Text style={item.status === 'sent' ? styles.sentDot : styles.failedDot}>
                {item.status === 'sent' ? 'Sent' : 'Failed'}
              </Text>
              <Text style={styles.historyMessage}>{item.message}</Text>
              <Text style={styles.historyTime}>
                {new Date(item.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          )}
        />
      </View>

      <Modal animationType="slide" transparent visible={settingsOpen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Receiver token</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              value={draftToken}
              onChangeText={setDraftToken}
              placeholder="Paste the receiver app's Expo push token"
              style={styles.tokenInput}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryAction} onPress={() => setSettingsOpen(false)}>
                <Text style={styles.secondaryActionText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryAction} onPress={handleSaveToken}>
                <Text style={styles.primaryActionText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FBFD',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  senderTitle: {
    color: '#102A43',
    fontSize: 24,
    fontWeight: '800',
  },
  settingsButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BCD4E6',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  settingsButtonText: {
    color: '#1C5D8F',
    fontSize: 15,
    fontWeight: '700',
  },
  senderMain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  bigButton: {
    width: '86%',
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C7ED6',
    shadowColor: '#0B4F8A',
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 9,
  },
  bigButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#1864AB',
  },
  bigButtonDisabled: {
    opacity: 0.74,
  },
  bigButtonText: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 0,
  },
  statusText: {
    marginTop: 28,
    color: '#334E68',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  sentText: {
    color: '#1B7F4C',
  },
  failedText: {
    color: '#B42318',
  },
  historyPanel: {
    borderTopWidth: 1,
    borderTopColor: '#D9E8F2',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 20,
    minHeight: 150,
  },
  sectionLabel: {
    color: '#627D98',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  emptyText: {
    color: '#829AB1',
    paddingVertical: 18,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
  },
  sentDot: {
    width: 54,
    color: '#1B7F4C',
    fontWeight: '800',
  },
  failedDot: {
    width: 54,
    color: '#B42318',
    fontWeight: '800',
  },
  historyMessage: {
    flex: 1,
    color: '#243B53',
  },
  historyTime: {
    color: '#829AB1',
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(16, 42, 67, 0.42)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: '#102A43',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  tokenInput: {
    minHeight: 118,
    borderWidth: 1,
    borderColor: '#B6D0E2',
    borderRadius: 8,
    color: '#102A43',
    padding: 12,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  secondaryAction: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B6D0E2',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: '#334E68',
    fontWeight: '800',
  },
  primaryAction: {
    borderRadius: 8,
    backgroundColor: '#1C7ED6',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
