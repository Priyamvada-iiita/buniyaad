/** Category tree inspired by Indian building-material marketplaces (e.g. BuilderSmart). */
export type CategoryNode = {
  slug: string;
  name: string;
  children?: { slug: string; name: string }[];
};

export const CATEGORY_TREE: CategoryNode[] = [
  {
    slug: 'cement',
    name: 'Cement & Admixtures',
    children: [
      { slug: 'cement-opc', name: 'OPC Cement (43/53 Grade)' },
      { slug: 'cement-ppc', name: 'PPC Cement' },
      { slug: 'cement-white', name: 'White Cement' },
      { slug: 'cement-admixture', name: 'Admixtures & Waterproofing' },
    ],
  },
  {
    slug: 'steel-tmt',
    name: 'Steel & TMT Bars',
    children: [
      { slug: 'tmt-8-12', name: 'TMT 8mm – 12mm' },
      { slug: 'tmt-16-25', name: 'TMT 16mm – 25mm' },
      { slug: 'tmt-28-32', name: 'TMT 28mm – 32mm' },
      { slug: 'structural-steel', name: 'Structural Steel / Angles' },
    ],
  },
  {
    slug: 'bricks-blocks',
    name: 'Bricks & Blocks',
    children: [
      { slug: 'red-brick', name: 'Red Clay Bricks' },
      { slug: 'fly-ash-brick', name: 'Fly Ash Bricks' },
      { slug: 'aac-block', name: 'AAC Blocks' },
      { slug: 'concrete-block', name: 'Solid / Hollow Blocks' },
    ],
  },
  {
    slug: 'sand-aggregate',
    name: 'Sand, Bajri & Aggregate',
    children: [
      { slug: 'river-sand', name: 'River Sand (Reti)' },
      { slug: 'm-sand', name: 'M-Sand / Manufactured Sand' },
      { slug: 'bajri-gitti', name: 'Bajri / Gitti / Chips' },
      { slug: 'ballast', name: 'Ballast / Murram' },
    ],
  },
  {
    slug: 'tiles-flooring',
    name: 'Tiles & Flooring',
    children: [
      { slug: 'floor-tiles', name: 'Floor Tiles' },
      { slug: 'wall-tiles', name: 'Wall Tiles' },
      { slug: 'vitrified', name: 'Vitrified / PGVT Tiles' },
      { slug: 'granite-marble', name: 'Granite & Marble' },
    ],
  },
  {
    slug: 'paint',
    name: 'Paint & Finishes',
    children: [
      { slug: 'interior-paint', name: 'Interior Emulsion' },
      { slug: 'exterior-paint', name: 'Exterior / Weather Coat' },
      { slug: 'primer-putty', name: 'Primer, Putty & Enamel' },
    ],
  },
  {
    slug: 'plumbing',
    name: 'Plumbing & Pipes',
    children: [
      { slug: 'cpvc-upvc', name: 'CPVC / UPVC Pipes' },
      { slug: 'gi-pipes', name: 'GI Pipes & Fittings' },
      { slug: 'sanitary', name: 'Sanitaryware & Taps' },
    ],
  },
  {
    slug: 'electrical',
    name: 'Electrical & Lighting',
    children: [
      { slug: 'wires-cables', name: 'Wires & Cables' },
      { slug: 'switches-mcb', name: 'Switches, MCB & DB' },
      { slug: 'lighting', name: 'LED & Lighting' },
    ],
  },
  {
    slug: 'hardware-tools',
    name: 'Hardware & Tools',
    children: [
      { slug: 'fasteners', name: 'Nails, Screws & Fasteners' },
      { slug: 'hand-tools', name: 'Hand Tools' },
      { slug: 'safety', name: 'Safety Gear & Scaffolding' },
    ],
  },
  {
    slug: 'doors-windows',
    name: 'Doors, Windows & Ply',
    children: [
      { slug: 'ply-laminate', name: 'Ply & Laminates' },
      { slug: 'doors', name: 'Doors & Frames' },
      { slug: 'windows', name: 'Windows & Grills' },
    ],
  },
  {
    slug: 'roofing',
    name: 'Roofing & Sheets',
    children: [
      { slug: 'gi-sheets', name: 'GI / Colour Coated Sheets' },
      { slug: 'asbestos-fiber', name: 'Fiber / Cement Sheets' },
    ],
  },
  {
    slug: 'others',
    name: 'Others',
    children: [{ slug: 'others-custom', name: 'Describe your product' }],
  },
];

export function flattenCategories() {
  const rows: { slug: string; name: string; parent_slug: string | null }[] = [];
  for (const parent of CATEGORY_TREE) {
    rows.push({ slug: parent.slug, name: parent.name, parent_slug: null });
    for (const child of parent.children ?? []) {
      rows.push({ slug: child.slug, name: child.name, parent_slug: parent.slug });
    }
  }
  return rows;
}
