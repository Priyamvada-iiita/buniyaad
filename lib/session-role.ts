export type SessionRole = 'buyer' | 'seller';

const STORAGE_KEY = 'buniyaad_active_role';
const COOKIE_NAME = 'buniyaad_active_role';

export function getActiveRole(): SessionRole | null {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(STORAGE_KEY);
  return value === 'buyer' || value === 'seller' ? value : null;
}

export function setActiveRole(role: SessionRole) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, role);
  document.cookie = `${COOKIE_NAME}=${role}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

export function clearActiveRole() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function parseSessionRole(value: string | undefined | null): SessionRole | null {
  return value === 'buyer' || value === 'seller' ? value : null;
}

/** Short label for navbar / UI chips */
export function roleBadgeLabel(role: SessionRole): string {
  return role === 'seller' ? 'Selling' : 'Buying';
}
