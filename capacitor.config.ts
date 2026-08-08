import type { CapacitorConfig } from '@capacitor/cli';

// Your live Vercel URL — set NEXT_PUBLIC_APP_URL in .env.local before building APK
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buniyaad.vercel.app';

const config: CapacitorConfig = {
  appId: 'in.buniyaad.app',
  appName: 'Buniyaad',
  webDir: 'public',
  server: {
    url: appUrl,
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
