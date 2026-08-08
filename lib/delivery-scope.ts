import { BIHAR_DISTRICTS } from '@/lib/profile-types';

export type DeliveryScope = 'all_bihar' | 'my_district' | 'my_city' | 'custom_districts';

export const DELIVERY_SCOPE_OPTIONS: {
  value: DeliveryScope;
  label: string;
  hint: string;
}[] = [
  {
    value: 'all_bihar',
    label: 'All over Bihar',
    hint: 'Poora Bihar deliver karte hain — buyers kahi se bhi order kar sakte hain',
  },
  {
    value: 'my_district',
    label: 'My district only',
    hint: 'Sirf aapke shop wale district mein — profile mein jo district select hai',
  },
  {
    value: 'my_city',
    label: 'My city / local area',
    hint: 'Sirf aapke city ya nearby area — profile mein jo city likhi hai',
  },
  {
    value: 'custom_districts',
    label: 'Selected districts',
    hint: 'Kuch specific districts chuno — neeche list se tick karein',
  },
];

export function formatDeliveryArea(seller: {
  delivery_scope?: DeliveryScope | string | null;
  district?: string | null;
  city?: string | null;
  delivery_districts?: string[] | null;
}): string {
  const scope = (seller.delivery_scope || 'my_district') as DeliveryScope;
  switch (scope) {
    case 'all_bihar':
      return 'Delivers: All Bihar';
    case 'my_city':
      return seller.city ? `Delivers: ${seller.city} area` : 'Delivers: Local city area';
    case 'custom_districts': {
      const list = parseDeliveryDistricts(seller.delivery_districts);
      if (!list.length) return 'Delivers: Selected districts (set in shop profile)';
      if (list.length <= 2) return `Delivers: ${list.join(', ')}`;
      return `Delivers: ${list.slice(0, 2).join(', ')} +${list.length - 2} more`;
    }
    default:
      return seller.district ? `Delivers: ${seller.district} district` : 'Delivers: District (set in shop profile)';
  }
}

export function parseDeliveryDistricts(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((d): d is string => typeof d === 'string' && d.trim().length > 0);
}

export function sellerDeliversToDistrict(
  seller: {
    delivery_scope?: DeliveryScope | string | null;
    district?: string | null;
    delivery_districts?: unknown;
  },
  buyerDistrict: string
): boolean {
  if (!buyerDistrict.trim()) return true;
  const scope = (seller.delivery_scope || 'my_district') as DeliveryScope;
  const d = buyerDistrict.trim();
  if (scope === 'all_bihar') return true;
  if (scope === 'my_district') return seller.district === d;
  if (scope === 'my_city') return seller.district === d;
  if (scope === 'custom_districts') return parseDeliveryDistricts(seller.delivery_districts).includes(d);
  return true;
}

export { BIHAR_DISTRICTS };
