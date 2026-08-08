export type SellerSort = 'name' | 'products' | 'verified';

export function sellersHref(params: {
  q?: string;
  district?: string;
  delivers_to?: string;
  type?: string;
  verified?: boolean;
  sort?: SellerSort;
}) {
  const p = new URLSearchParams();
  if (params.q) p.set('q', params.q);
  if (params.district) p.set('district', params.district);
  if (params.delivers_to) p.set('delivers_to', params.delivers_to);
  if (params.type) p.set('type', params.type);
  if (params.verified) p.set('verified', '1');
  if (params.sort && params.sort !== 'name') p.set('sort', params.sort);
  const s = p.toString();
  return `/sellers${s ? `?${s}` : ''}`;
}

export function sellerShopHref(sellerId: string) {
  return `/sellers/${sellerId}`;
}

export type SellerProfile = {
  id: string;
  business_name: string | null;
  account_type: string | null;
  account_type_description: string | null;
  contact_name: string | null;
  phone: string | null;
  district: string | null;
  city: string | null;
  pincode: string | null;
  address: string | null;
  verified: boolean;
  shop_cover_url?: string | null;
  shop_photo_urls?: unknown;
  delivery_scope?: string | null;
  delivery_districts?: string[] | null;
  product_count?: number;
};

export function sortSellers(sellers: SellerProfile[], sort: SellerSort): SellerProfile[] {
  const list = [...sellers];
  switch (sort) {
    case 'products':
      return list.sort((a, b) => (b.product_count ?? 0) - (a.product_count ?? 0));
    case 'verified':
      return list.sort((a, b) => {
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        return (a.business_name ?? '').localeCompare(b.business_name ?? '');
      });
    case 'name':
    default:
      return list.sort((a, b) => (a.business_name ?? '').localeCompare(b.business_name ?? ''));
  }
}
