export type SellerOffer = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  badge_text: string | null;
  image_url: string | null;
  product_ids: string[];
  active: boolean;
  sort_order: number;
  created_at?: string;
};

export function parseProductIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === 'string');
}

export type SellerRating = {
  id: string;
  seller_id: string;
  buyer_id: string;
  order_id: string | null;
  rating: number;
  review: string | null;
  created_at?: string;
};

export function formatRating(avg: number | null | undefined) {
  if (avg == null || Number.isNaN(avg)) return null;
  return avg.toFixed(1);
}

export function starsDisplay(rating: number) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}
