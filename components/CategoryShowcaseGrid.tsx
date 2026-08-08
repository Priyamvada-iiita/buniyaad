import Image from 'next/image';
import Link from 'next/link';
import { CATEGORY_SHOWCASE } from '@/lib/category-showcase';

export default function CategoryShowcaseGrid() {
  return (
    <section className="mb-8">
      <div className="text-center mb-6">
        <p className="section-label">What you can order</p>
        <h2 className="font-display text-2xl md:text-3xl">BUILDING MATERIALS ON YOUR PHONE</h2>
        <p className="text-sm text-graphite-600 mt-2 max-w-lg mx-auto">
          Cement, steel, sand, tiles, paint, plumbing, electrical — browse and order from local dealers across Bihar.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORY_SHOWCASE.map((item) => (
          <Link
            key={item.slug}
            href={`/catalog?category=${item.slug}`}
            className="group flex flex-col items-center gap-2 text-center"
          >
            <div className="relative w-full aspect-square rounded-2xl bg-[#d9eef7] border border-[#b8dce8] overflow-hidden shadow-sm group-hover:shadow-md group-hover:border-rebar-300 transition-all">
              {item.badge ? (
                <span className="absolute top-2 left-2 z-10 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold text-ink leading-tight">
                  {item.badge}
                </span>
              ) : null}
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                className="object-cover object-center scale-110 group-hover:scale-100 transition-transform duration-300"
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-graphite-800 leading-tight px-1 group-hover:text-rebar-700">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
