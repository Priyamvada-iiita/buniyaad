/** Common selling units for building materials in Bihar / Hindi belt markets. */

export type ProductUnit = {
  value: string;
  label: string;
  labelHi: string;
  hint: string;
  group: 'weight' | 'volume_load' | 'count' | 'length' | 'area' | 'liquid';
};

export const PRODUCT_UNIT_GROUPS: Record<ProductUnit['group'], string> = {
  weight: 'Weight — वज़न',
  volume_load: 'Volume / load — मात्रा / ट्रैक्टर',
  count: 'Count — गिनती',
  length: 'Length — लंबाई',
  area: 'Area — वर्ग फुट',
  liquid: 'Liquid — लीटर / बाल्टी',
};

export const PRODUCT_UNITS: ProductUnit[] = [
  { value: 'bag', label: 'Bag', labelHi: 'बोरी', hint: 'Cement, putty — usually 50 kg bag', group: 'weight' },
  { value: 'quintal', label: 'Quintal', labelHi: 'क्विंटल', hint: 'Steel saria — 1 quintal = 100 kg', group: 'weight' },
  { value: 'ton', label: 'Ton', labelHi: 'टन', hint: 'Bulk steel, sand — 1000 kg', group: 'weight' },
  { value: 'kg', label: 'Kilogram', labelHi: 'किलो', hint: 'Small quantity by weight', group: 'weight' },

  {
    value: 'tractor',
    label: 'Tractor load',
    labelHi: 'ट्रैक्टर',
    hint: 'Sand, bajri, gitti — ek tractor bhara (very common in Bihar)',
    group: 'volume_load',
  },
  {
    value: 'trolley',
    label: 'Trolley load',
    labelHi: 'ट्रॉली',
    hint: 'Sand, murram — chhoti trolley / tractor trolley trip',
    group: 'volume_load',
  },
  { value: 'cft', label: 'Cubic ft', labelHi: 'घन फुट', hint: 'Reti, bajri by volume (cft)', group: 'volume_load' },
  {
    value: 'brass',
    label: 'Brass',
    labelHi: 'ब्रास',
    hint: 'Aggregate — local measure (~100 cft in many markets)',
    group: 'volume_load',
  },

  { value: 'thousand', label: 'Per 1000', labelHi: 'हज़ार ईंट', hint: 'Bricks — rate per 1000 pieces', group: 'count' },
  { value: 'piece', label: 'Piece', labelHi: 'नग / पीस', hint: 'Single brick, fitting, door, sheet item', group: 'count' },
  { value: 'bundle', label: 'Bundle', labelHi: 'बंडल', hint: 'TMT bars — one bundle', group: 'count' },
  { value: 'box', label: 'Box', labelHi: 'डिब्बा', hint: 'Tiles — per box', group: 'count' },
  { value: 'sheet', label: 'Sheet', labelHi: 'शीट', hint: 'GI roofing, plywood — per sheet', group: 'count' },

  { value: 'metre', label: 'Metre', labelHi: 'मीटर', hint: 'Pipe, rod, wire sold by length', group: 'length' },
  { value: 'coil', label: 'Coil', labelHi: 'कॉइल', hint: 'Wire — full coil', group: 'length' },
  { value: 'roll', label: 'Roll', labelHi: 'रोल', hint: 'Mesh, tarpaulin, tape', group: 'length' },

  { value: 'sq_ft', label: 'Sq ft', labelHi: 'वर्ग फुट', hint: 'Tiles, flooring, roofing by area', group: 'area' },

  { value: 'litre', label: 'Litre', labelHi: 'लीटर', hint: 'Paint, primer, admixture', group: 'liquid' },
  { value: 'bucket', label: 'Bucket', labelHi: 'बाल्टी', hint: 'Paint — per bucket (often 10–20 L)', group: 'liquid' },
];

/** Legacy values stored before this list expanded */
const LEGACY_UNIT_LABELS: Record<string, string> = {
  cubic_ft: 'cft',
};

const unitByValue = new Map(PRODUCT_UNITS.map((u) => [u.value, u]));

export const PRODUCT_UNIT_VALUES = new Set(PRODUCT_UNITS.map((u) => u.value));

/** Suggested default units when seller picks a main (parent) category slug */
export const UNITS_BY_PARENT_SLUG: Record<string, string[]> = {
  cement: ['bag', 'ton', 'kg'],
  'steel-tmt': ['quintal', 'ton', 'bundle', 'piece', 'kg'],
  'bricks-blocks': ['thousand', 'piece'],
  'sand-aggregate': ['tractor', 'trolley', 'cft', 'brass', 'ton'],
  'tiles-flooring': ['sq_ft', 'box', 'piece'],
  paint: ['litre', 'bucket', 'kg'],
  plumbing: ['piece', 'metre', 'kg'],
  electrical: ['coil', 'metre', 'piece', 'roll'],
  'hardware-tools': ['piece', 'kg', 'box'],
  'doors-windows': ['sheet', 'piece', 'sq_ft'],
  roofing: ['sheet', 'sq_ft', 'piece'],
  others: ['piece', 'bag', 'tractor', 'quintal', 'sq_ft'],
};

export function formatUnitLabel(unit: string | null | undefined): string {
  if (!unit) return '';
  const normalized = LEGACY_UNIT_LABELS[unit] || unit;
  const found = unitByValue.get(normalized);
  if (found) return `${found.label} (${found.labelHi})`;
  return unit.replace(/_/g, ' ');
}

export function formatUnitShort(unit: string | null | undefined): string {
  if (!unit) return '';
  const normalized = LEGACY_UNIT_LABELS[unit] || unit;
  const found = unitByValue.get(normalized);
  if (found) return found.labelHi;
  return unit;
}

export function getUnitOptionLabel(u: ProductUnit) {
  return `${u.label} — ${u.labelHi} (${u.hint.split('—')[0].trim()})`;
}

export function getSuggestedUnitsForParentSlug(parentSlug: string | undefined): ProductUnit[] {
  if (!parentSlug) return PRODUCT_UNITS;
  const preferred = UNITS_BY_PARENT_SLUG[parentSlug];
  if (!preferred) return PRODUCT_UNITS;
  const preferredSet = new Set(preferred);
  const suggested = PRODUCT_UNITS.filter((u) => preferredSet.has(u.value));
  const rest = PRODUCT_UNITS.filter((u) => !preferredSet.has(u.value));
  return [...suggested, ...rest];
}

export function getDefaultUnitForParentSlug(parentSlug: string | undefined): string {
  const list = UNITS_BY_PARENT_SLUG[parentSlug || ''];
  return list?.[0] || 'bag';
}

export function isKnownUnit(unit: string): boolean {
  const normalized = LEGACY_UNIT_LABELS[unit] || unit;
  return PRODUCT_UNIT_VALUES.has(normalized) || unit in LEGACY_UNIT_LABELS;
}

export const CUSTOM_UNIT_VALUE = '__custom__';

export const BULK_UNIT_HINT =
  'bag, quintal, ton, tractor, trolley, cft, brass, thousand, piece, bundle, sq_ft, box, litre, metre, coil, sheet — ya apna custom (e.g. peti, dozen)';

/** Sanitize custom unit for storage (letters, numbers, Hindi, spaces, hyphen) */
export function sanitizeCustomUnitInput(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 32);
}

export function resolveCustomUnit(raw: string): string | null {
  const cleaned = sanitizeCustomUnitInput(raw);
  if (cleaned.length < 2) return null;
  if (isKnownUnit(cleaned)) return cleaned;
  return cleaned;
}

/** Map DB unit → form dropdown + custom text field */
export function splitUnitForForm(stored: string): { unit: string; unit_custom: string } {
  if (!stored || stored === CUSTOM_UNIT_VALUE) {
    return { unit: CUSTOM_UNIT_VALUE, unit_custom: '' };
  }
  if (isKnownUnit(stored)) {
    return { unit: LEGACY_UNIT_LABELS[stored] || stored, unit_custom: '' };
  }
  return { unit: CUSTOM_UNIT_VALUE, unit_custom: stored };
}
