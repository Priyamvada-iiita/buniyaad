/** Live marketplace URL — NOT buniyaad.vercel.app (that domain is a different project). */
export const DEFAULT_APP_URL = 'https://buniyaad-livid.vercel.app';

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_APP_URL;
}
