import type { SupabaseClient } from '@supabase/supabase-js';

export type ProfileRole = 'buyer' | 'seller' | 'admin';

export async function getProfileIdForRole(
  supabase: SupabaseClient,
  userId: string,
  role: ProfileRole
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();
  return data?.id ?? null;
}

export async function getUserProfileRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileRole[]> {
  const { data } = await supabase.from('profiles').select('role').eq('user_id', userId);
  return (data?.map((p) => p.role as ProfileRole) ?? []);
}

export function destinationForRole(role: ProfileRole | null | undefined): string {
  if (role === 'seller') return '/seller/dashboard';
  if (role === 'admin') return '/buyer/catalog';
  return '/catalog';
}

export function isEmailAlreadyRegistered(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes('already registered') || m.includes('already been registered');
}
