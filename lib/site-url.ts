/** Live marketplace URL — NOT buniyaad.vercel.app (that domain is Buniyaad Academy). */
export const DEFAULT_APP_URL = 'https://buniyaad-livid.vercel.app';

const BLOCKED_APP_URLS = ['https://buniyaad.vercel.app', 'http://buniyaad.vercel.app'];

/** Marketplace URL for APK + download page — ignores misconfigured Academy domain. */
export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv && !BLOCKED_APP_URLS.includes(fromEnv.replace(/\/$/, ''))) {
    return fromEnv.replace(/\/$/, '');
  }
  return DEFAULT_APP_URL;
}

export function apkDownloadUrl(): string {
  return `${getAppUrl()}/downloads/buniyaad-marketplace.apk`;
}

export const APK_FILENAME = 'buniyaad-marketplace.apk';
