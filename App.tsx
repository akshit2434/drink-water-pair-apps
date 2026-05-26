import Constants from 'expo-constants';
import { SenderApp } from './src/SenderApp';
import { ReceiverApp } from './src/ReceiverApp';

export default function App() {
  const variant = Constants.expoConfig?.extra?.appVariant ?? process.env.EXPO_PUBLIC_APP_VARIANT;
  return variant === 'receiver' ? <ReceiverApp /> : <SenderApp />;
}
