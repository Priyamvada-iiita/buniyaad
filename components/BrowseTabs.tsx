import Link from 'next/link';

export default function BrowseTabs({ active }: { active: 'products' | 'sellers' }) {
  return (
    <div className="flex gap-2 mb-6 p-1 bg-concrete-100 rounded-lg w-fit">
      <Link
        href="/catalog"
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
          active === 'products'
            ? 'bg-white text-ink shadow-sm'
            : 'text-graphite-600 hover:text-ink'
        }`}
      >
        Products
        <span className="block text-xs font-normal text-graphite-500">Material dekhein</span>
      </Link>
      <Link
        href="/sellers"
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
          active === 'sellers'
            ? 'bg-white text-ink shadow-sm'
            : 'text-graphite-600 hover:text-ink'
        }`}
      >
        Sellers
        <span className="block text-xs font-normal text-graphite-500">Dukan / dealer</span>
      </Link>
    </div>
  );
}
