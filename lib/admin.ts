import type { SupabaseClient } from '@supabase/supabase-js';
import { getProfileIdForRole } from '@/lib/profiles';

/** Secret path segment — set ADMIN_PATH in .env.local (e.g. buniyaad-ops-x7k9). Not linked on public site. */
export function getAdminPathSlug(): string | null {
  const slug = process.env.ADMIN_PATH?.trim();
  return slug || null;
}

export function getAdminBasePath(): string | null {
  const slug = getAdminPathSlug();
  if (!slug) return null;
  return `/internal/${slug}`;
}

export function getAdminLoginPath(): string | null {
  const base = getAdminBasePath();
  return base ? `${base}/login` : null;
}

export function isValidAdminSlug(slug: string): boolean {
  const configured = getAdminPathSlug();
  return Boolean(configured && configured === slug);
}

export async function userIsPlatformAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const profileId = await getProfileIdForRole(supabase, userId, 'admin');
  return Boolean(profileId);
}
