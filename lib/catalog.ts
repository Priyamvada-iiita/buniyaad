export const HOME_CATEGORY_LINKS = [
  { num: '01', name: 'Cement', desc: 'OPC, PPC, white cement', slug: 'cement' },
  { num: '02', name: 'TMT Bars', desc: '8mm to 32mm', slug: 'steel-tmt' },
  { num: '03', name: 'Bricks & Blocks', desc: 'Red brick, AAC, fly ash', slug: 'bricks-blocks' },
  { num: '04', name: 'Sand & Aggregate', desc: 'River sand, chips, ballast', slug: 'sand-aggregate' },
] as const;

export type CatalogSort = 'newest' | 'price_low' | 'price_high' | 'name';

export function catalogHref(params: {
  category?: string;
  district?: string;
  sort?: CatalogSort;
  q?: string;
  verified?: boolean;
}) {
  const p = new URLSearchParams();
  if (params.category) p.set('category', params.category);
  if (params.district) p.set('district', params.district);
  if (params.sort && params.sort !== 'newest') p.set('sort', params.sort);
  if (params.q) p.set('q', params.q);
  if (params.verified) p.set('verified', '1');
  const s = p.toString();
  return `/catalog${s ? `?${s}` : ''}`;
}

export function sortProducts<T extends { name: string; price: number; created_at?: string }>(
  products: T[],
  sort: CatalogSort
): T[] {
  const list = [...products];
  switch (sort) {
    case 'price_low':
      return list.sort((a, b) => a.price - b.price);
    case 'price_high':
      return list.sort((a, b) => b.price - a.price);
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
    default:
      return list.sort((a, b) => {
        const at = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bt - at;
      });
  }
}
