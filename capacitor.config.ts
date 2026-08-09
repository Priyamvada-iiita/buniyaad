import type { CapacitorConfig } from '@capacitor/cli';
import { DEFAULT_APP_URL } from './lib/site-url';

// Set NEXT_PUBLIC_APP_URL in .env.local before `npx cap sync android`
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_APP_URL;

const config: CapacitorConfig = {
  appId: 'in.buniyaad.marketplace',
  appName: 'Buniyaad Market',
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
