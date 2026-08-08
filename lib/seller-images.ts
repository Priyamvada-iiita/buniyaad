import { parseShopPhotos } from '@/lib/seller-profile';

/** Local placeholder storefront images — rotated per seller */
export const SELLER_PLACEHOLDER_IMAGES = [
  '/carousel/carousel-sellers.png',
  '/carousel/carousel-cement.png',
  '/carousel/carousel-bricks.png',
  '/carousel/carousel-tmt.png',
] as const;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 9973;
  return h;
}

export function sellerPlaceholderForId(id: string, offset = 0): string {
  const idx = (hashSeed(id) + offset) % SELLER_PLACEHOLDER_IMAGES.length;
  return SELLER_PLACEHOLDER_IMAGES[idx];
}

export type SellerImageFields = {
  id: string;
  shop_cover_url?: string | null;
  shop_photo_urls?: unknown;
};

export function resolveSellerCover(seller: SellerImageFields): string {
  const photos = parseShopPhotos(seller.shop_photo_urls);
  return seller.shop_cover_url || photos[0] || sellerPlaceholderForId(seller.id);
}

/** Up to 4 thumbnails for card strip — real photos or placeholder gallery */
export function resolveSellerThumbnails(seller: SellerImageFields): string[] {
  const photos = parseShopPhotos(seller.shop_photo_urls);
  const hasReal = Boolean(seller.shop_cover_url || photos.length);

  if (hasReal) {
    const seen = new Set<string>();
    const ordered: string[] = [];
    if (seller.shop_cover_url) {
      seen.add(seller.shop_cover_url);
      ordered.push(seller.shop_cover_url);
    }
    for (const url of photos) {
      if (!seen.has(url)) {
        seen.add(url);
        ordered.push(url);
      }
      if (ordered.length >= 4) break;
    }
    return ordered;
  }

  return SELLER_PLACEHOLDER_IMAGES.map((_, i) => sellerPlaceholderForId(seller.id, i));
}

export function isLocalImage(src: string): boolean {
  return src.startsWith('/');
}
