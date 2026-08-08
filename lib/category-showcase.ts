export type CategoryShowcaseItem = {
  name: string;
  slug: string;
  image: string;
  badge?: string;
};

export const CATEGORY_SHOWCASE: CategoryShowcaseItem[] = [
  { name: 'Cement', slug: 'cement', image: '/carousel/carousel-cement.png', badge: 'Bulk prices' },
  { name: 'TMT & Steel', slug: 'steel-tmt', image: '/carousel/carousel-tmt.png', badge: 'Bulk prices' },
  { name: 'Sand & Bajri', slug: 'sand-aggregate', image: '/carousel/carousel-sand.png' },
  { name: 'Bricks & Blocks', slug: 'bricks-blocks', image: '/carousel/carousel-bricks.png' },
  { name: 'Tiles & Flooring', slug: 'tiles-flooring', image: '/carousel/carousel-bricks.png' },
  { name: 'Paint', slug: 'paint', image: '/carousel/carousel-cement.png' },
  { name: 'Plumbing', slug: 'plumbing', image: '/carousel/carousel-sand.png' },
  { name: 'Electrical', slug: 'electrical', image: '/carousel/carousel-tmt.png' },
  { name: 'Hardware & Tools', slug: 'hardware-tools', image: '/carousel/carousel-tmt.png' },
  { name: 'Ply & Doors', slug: 'doors-windows', image: '/carousel/carousel-bricks.png' },
  { name: 'Roofing', slug: 'roofing', image: '/carousel/carousel-sand.png' },
  { name: 'More materials', slug: 'others', image: '/carousel/carousel-cement.png' },
];
