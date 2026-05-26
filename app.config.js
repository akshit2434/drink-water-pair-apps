const { getVariantConfig } = require('./src/variantConfig');

const variant = getVariantConfig(process.env.APP_VARIANT ?? process.env.EXPO_PUBLIC_APP_VARIANT);
const projectId = process.env.EXPO_PROJECT_ID?.trim();
const googleServicesFile = process.env.GOOGLE_SERVICES_JSON_PATH?.trim();
const isReceiver = variant.variant === 'receiver';

module.exports = {
  expo: {
    name: variant.name,
    slug: variant.slug,
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: variant.slug,
    newArchEnabled: true,
    android: {
      package: variant.packageName,
      versionCode: 1,
      ...(isReceiver && googleServicesFile ? { googleServicesFile } : {}),
      permissions: ['POST_NOTIFICATIONS', 'VIBRATE'],
      adaptiveIcon: {
        backgroundColor: '#EAF7FF',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#1C7ED6',
          defaultChannel: 'water-reminders',
        },
      ],
    ],
    extra: {
      appVariant: variant.variant,
      eas: projectId ? { projectId } : undefined,
    },
  },
};
