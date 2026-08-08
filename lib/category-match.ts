import { BULK_UNIT_HINT } from './product-units';

/** Lightweight keyword map for category suggestions (no ML packages). */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  cement: ['cement', 'opc', 'ppc', 'ultratech', 'acc', 'ambuja', 'shree', 'jk', 'dalmia', 'admixture'],
  'cement-opc': ['opc', '53', '43', 'grade', 'cement'],
  'cement-ppc': ['ppc', 'portland', 'ultratech', 'acc', 'cement', '50kg'],
  'cement-white': ['white', 'cement', 'putty'],
  'steel-tmt': ['tmt', 'saria', 'steel', 'rod', 'bar', 'iron'],
  'tmt-8-12': ['8mm', '10mm', '12mm', 'tmt', 'tiscon', 'sail', 'jindal'],
  'tmt-16-25': ['16mm', '20mm', '25mm', 'tmt', 'saria'],
  'bricks-blocks': ['brick', 'eeta', 'block', 'aac', 'fly ash'],
  'red-brick': ['red', 'brick', 'eeta', 'clay'],
  'fly-ash-brick': ['fly ash', 'brick', 'aac'],
  'sand-aggregate': ['sand', 'reti', 'bajri', 'gitti', 'aggregate', 'murram', 'ballast'],
  'river-sand': ['river', 'sand', 'reti', 'fine'],
  'm-sand': ['m sand', 'msand', 'manufactured'],
  'bajri-gitti': ['bajri', 'gitti', 'chips', '20mm', '10mm'],
  'tiles-flooring': ['tile', 'tiles', 'flooring', 'kajaria', 'somany', 'vitrified', 'pgvt'],
  'floor-tiles': ['floor', 'tile', '2x2', '600'],
  vitrified: ['vitrified', 'pgvt', 'gvt', 'glazed'],
  paint: ['paint', 'emulsion', 'asian', 'berger', 'primer', 'putty', 'enamel'],
  'interior-paint': ['interior', 'emulsion', 'paint', 'apex', 'trucare'],
  plumbing: ['pipe', 'cpvc', 'upvc', 'pvc', 'fitting', 'tap', 'sanitary', 'supreme', 'astral'],
  'cpvc-upvc': ['cpvc', 'upvc', 'pipe', 'plumbing'],
  electrical: ['wire', 'cable', 'switch', 'mcb', 'led', 'polycab', 'havells', 'anchor'],
  'wires-cables': ['wire', 'cable', '1.5', '2.5', 'coil', 'fr'],
  'hardware-tools': ['nail', 'screw', 'tool', 'hammer', 'plier', 'safety', 'helmet'],
  'hand-tools': ['trowel', 'plumb', 'mason', 'tool', 'kit'],
  'doors-windows': ['door', 'window', 'ply', 'plywood', 'laminate', 'century', 'greenply'],
  'ply-laminate': ['ply', 'plywood', 'laminate', 'bwp', 'marine'],
  roofing: ['sheet', 'gi', 'colour', 'coated', 'asbestos', 'fiber', 'tata bluescope'],
  'gi-sheets': ['gi', 'sheet', 'profile', 'colour coated'],
  others: ['other', 'custom', 'misc', 'general'],
  'others-custom': ['other', 'custom', 'special'],
};

export type DbCategory = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

export type CategorySuggestion = {
  category: DbCategory;
  parentName: string | null;
  score: number;
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Score 0–100 based on keyword overlap + substring match */
export function suggestCategories(
  query: string,
  categories: DbCategory[],
  limit = 5
): CategorySuggestion[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const tokens = tokenize(query);
  const byId = new Map(categories.map((c) => [c.id, c]));
  const parents = categories.filter((c) => !c.parent_id);

  const scoreCategory = (cat: DbCategory): number => {
    let score = 0;
    const keywords = CATEGORY_KEYWORDS[cat.slug] ?? [];
    const haystack = `${cat.name} ${cat.slug} ${keywords.join(' ')}`.toLowerCase();

    if (haystack.includes(q)) score += 40;
    for (const t of tokens) {
      if (t.length < 2) continue;
      if (haystack.includes(t)) score += 12;
      if (keywords.some((k) => k.includes(t) || t.includes(k))) score += 8;
    }
    if (cat.parent_id) score += 5;
    return score;
  };

  const leafCats = categories.filter((c) => c.parent_id);
  const ranked = leafCats
    .map((cat) => {
      const parent = cat.parent_id ? byId.get(cat.parent_id) : null;
      return {
        category: cat,
        parentName: parent?.name ?? null,
        score: scoreCategory(cat) + (parent ? scoreCategory(parent) * 0.3 : 0),
      };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (ranked.length === 0 && q.length > 2) {
    const others = leafCats.find((c) => c.slug === 'others-custom');
    if (others) {
      return [{
        category: others,
        parentName: 'Others',
        score: 1,
      }];
    }
  }

  return ranked;
}

/** Bulk upload column definitions (pipe-separated, one product per line). */
export const BULK_FORMAT_COLUMNS = [
  {
    key: 'product_name',
    label: 'Product name',
    meaning: 'Dukan par dikhega naam — brand, size, weight (e.g. UltraTech PPC 50kg)',
  },
  {
    key: 'category_slug',
    label: 'Category slug',
    meaning: 'Buniyaad ki category code — cement-ppc, river-sand, tmt-8-12 (slug list neeche)',
  },
  {
    key: 'price',
    label: 'Price (₹)',
    meaning: 'Ek unit ki keemat — numbers only (e.g. 385)',
  },
  {
    key: 'stock',
    label: 'Stock',
    meaning: 'Kitna maal available hai — quantity number (e.g. 500)',
  },
  {
    key: 'unit',
    label: 'Unit',
    meaning: `Selling unit — ${BULK_UNIT_HINT}`,
  },
] as const;

export const BULK_FORMAT_SEPARATOR = ' | ';

export const BULK_FORMAT_HEADER = BULK_FORMAT_COLUMNS.map((c) => c.key).join(' | ');

/** Parse bulk lines: name | category_slug | price | stock | unit */
export type BulkRow = {
  name: string;
  category_slug: string;
  price: number;
  stock: number;
  unit: string;
  line: number;
  error?: string;
};

export function parseBulkLines(text: string): BulkRow[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.map((line, i) => {
    if (line === BULK_FORMAT_HEADER || line.startsWith('product_name |')) {
      return {
        name: '',
        category_slug: '',
        price: 0,
        stock: 0,
        unit: 'bag',
        line: i + 1,
        error: 'Header row — replace with your product data or delete this line',
      };
    }
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length < 5) {
      return {
        name: parts[0] || '',
        category_slug: '',
        price: 0,
        stock: 0,
        unit: 'bag',
        line: i + 1,
        error: 'Format: name | category_slug | price | stock | unit',
      };
    }
    const [name, category_slug, priceStr, stockStr, unit] = parts;
    const price = Number(priceStr);
    const stock = Number(stockStr);
    if (!name || !category_slug || !price || !stock) {
      return { name, category_slug, price, stock, unit, line: i + 1, error: 'Missing or invalid values' };
    }
    return { name, category_slug, price, stock, unit, line: i + 1 };
  });
}

export const BULK_EXAMPLE = `${BULK_FORMAT_HEADER}
UltraTech PPC Cement 50kg | cement-ppc | 385 | 500 | bag
River Sand Reti | river-sand | 4500 | 25 | tractor
TMT Saria 12mm | tmt-8-12 | 5200 | 80 | quintal
Red Clay Brick | red-brick | 6500 | 40 | thousand
Asian Paint 20L | interior-paint | 2800 | 15 | bucket`;
