/** Format phone for tel: links (basic India-friendly). */
export function phoneTelHref(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const normalized = digits.length === 10 ? `+91${digits}` : digits.startsWith('91') ? `+${digits}` : `+${digits}`;
  return `tel:${normalized}`;
}
