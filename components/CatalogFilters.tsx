'use client';

import Link from 'next/link';
import type { CatalogSort } from '@/lib/catalog';
import { catalogHref } from '@/lib/catalog';
import { BIHAR_DISTRICTS } from '@/lib/profile-types';

export default function CatalogFilters({
  category,
  district,
  sort,
  q,
  verified,
}: {
  category?: string;
  district?: string;
  sort?: CatalogSort;
  q?: string;
  verified?: boolean;
}) {
  const currentSort = sort || 'newest';
  const hasFilters = Boolean(category || district || q || verified || (sort && sort !== 'newest'));

  return (
    <div className="card p-4 mb-8 space-y-4">
      <form className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end" method="get">
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <div>
          <label className="block text-xs font-semibold uppercase text-graphite-600 mb-1.5">
            Search products
          </label>
          <input
            name="q"
            defaultValue={q || ''}
            placeholder="e.g. UltraTech, TMT 12mm, river sand"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-graphite-600 mb-1.5">
            Deliver to district
          </label>
          <select name="district" defaultValue={district || ''} className="input-field w-full md:w-44">
            <option value="">All Bihar</option>
            {BIHAR_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary text-sm h-[42px]">
          Apply
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <form method="get" className="flex items-center gap-2">
          {category ? <input type="hidden" name="category" value={category} /> : null}
          {district ? <input type="hidden" name="district" value={district} /> : null}
          {q ? <input type="hidden" name="q" value={q} /> : null}
          {verified ? <input type="hidden" name="verified" value="1" /> : null}
          <label className="text-xs font-semibold uppercase text-graphite-600">Sort</label>
          <select
            name="sort"
            defaultValue={currentSort}
            className="input-field w-auto text-sm py-2"
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
          >
            <option value="newest">Newest first</option>
            <option value="price_low">Price: low to high</option>
            <option value="price_high">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </form>

        <Link
          href={catalogHref({ category, district, sort: currentSort, q, verified: !verified })}
          className={`text-xs px-3 py-2 rounded-full border ${
            verified
              ? 'bg-signal-green text-white border-signal-green'
              : 'bg-white border-concrete-300 hover:border-signal-green'
          }`}
        >
          {verified ? '✓ Verified sellers only' : 'Verified sellers only'}
        </Link>

        {hasFilters ? (
          <Link href="/catalog" className="text-sm text-rebar-600 font-medium hover:underline ml-auto">
            Clear all filters
          </Link>
        ) : null}
      </div>
    </div>
  );
}
