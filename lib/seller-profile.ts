import type { SupabaseClient } from '@supabase/supabase-js';
import type { DeliveryScope } from '@/lib/delivery-scope';

export type AadhaarStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export type SellerProfileRecord = {
  id: string;
  user_id: string;
  role: string;
  account_type: string | null;
  account_type_description: string | null;
  contact_name: string | null;
  business_name: string | null;
  phone: string | null;
  district: string | null;
  city: string | null;
  pincode: string | null;
  address: string | null;
  gstin: string | null;
  verified: boolean;
  profile_complete: boolean;
  shop_description: string | null;
  shop_cover_url: string | null;
  shop_photo_urls: string[] | null;
  certification_url: string | null;
  registration_doc_url: string | null;
  aadhaar_doc_url: string | null;
  aadhaar_status: AadhaarStatus;
  map_lat: number | null;
  map_lng: number | null;
  google_maps_url: string | null;
  accepts_cod: boolean;
  accepts_online: boolean;
  delivery_scope?: DeliveryScope | string | null;
  delivery_districts?: string[] | null;
};

export const AADHAAR_STATUS_LABEL: Record<AadhaarStatus, string> = {
  not_submitted: 'Not submitted',
  pending: 'Under review',
  verified: 'Verified',
  rejected: 'Rejected — re-upload',
};

export const AADHAAR_STATUS_CLASS: Record<AadhaarStatus, string> = {
  not_submitted: 'bg-concrete-200 text-graphite-700',
  pending: 'bg-steel-500 text-white',
  verified: 'bg-signal-green text-white',
  rejected: 'bg-signal-red text-white',
};

export function parseShopPhotos(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((u): u is string => typeof u === 'string');
  return [];
}

function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export async function uploadShopPhoto(supabase: SupabaseClient, userId: string, file: File) {
  const path = `seller-shop/${userId}/${Date.now()}-${safeFilename(file.name)}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPrivateDoc(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  kind: 'aadhaar' | 'registration' | 'certification'
) {
  const path = `${userId}/${kind}-${Date.now()}-${safeFilename(file.name)}`;
  const { error } = await supabase.storage.from('seller-documents').upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function getPrivateDocSignedUrl(supabase: SupabaseClient, path: string) {
  const { data, error } = await supabase.storage.from('seller-documents').createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
