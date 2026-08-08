'use client';

import Link from 'next/link';
import { BIHAR_DISTRICTS, SELLER_TYPES } from '@/lib/profile-types';
import { sellersHref, type SellerSort } from '@/lib/sellers';

export default function SellerFilters({
  q,
  district,
  delivers_to,
  type,
  verified,
  sort,
}: {
  q?: string;
  district?: string;
  delivers_to?: string;
  type?: string;
  verified?: boolean;
  sort?: SellerSort;
}) {
  const currentSort = sort || 'name';
  const hasFilters = Boolean(q || district || delivers_to || type || verified || (sort && sort !== 'name'));

  return (
    <div className="card p-4 mb-8 space-y-4">
      <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 md:items-end" method="get">
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold uppercase text-graphite-600 mb-1.5">
            Search shops
          </label>
          <input
            name="q"
            defaultValue={q || ''}
            placeholder="Dukan ka naam, area…"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-graphite-600 mb-1.5">
            Shop district
          </label>
          <select name="district" defaultValue={district || ''} className="input-field">
            <option value="">All districts</option>
            {BIHAR_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-graphite-600 mb-1.5">
            Delivers to
          </label>
          <select name="delivers_to" defaultValue={delivers_to || ''} className="input-field">
            <option value="">Anywhere in Bihar</option>
            {BIHAR_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-graphite-600 mb-1.5">
            Seller type
          </label>
          <select name="type" defaultValue={type || ''} className="input-field">
            <option value="">All types</option>
            {SELLER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary text-sm h-[42px] lg:col-span-3">
          Search sellers
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <form method="get" className="flex items-center gap-2">
          {q ? <input type="hidden" name="q" value={q} /> : null}
          {district ? <input type="hidden" name="district" value={district} /> : null}
          {delivers_to ? <input type="hidden" name="delivers_to" value={delivers_to} /> : null}
          {type ? <input type="hidden" name="type" value={type} /> : null}
          {verified ? <input type="hidden" name="verified" value="1" /> : null}
          <label className="text-xs font-semibold uppercase text-graphite-600">Sort</label>
          <select
            name="sort"
            defaultValue={currentSort}
            className="input-field w-auto text-sm py-2"
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
          >
            <option value="name">Name A–Z</option>
            <option value="products">Most listings</option>
            <option value="verified">Verified first</option>
          </select>
        </form>

        <Link
          href={sellersHref({
            q,
            district,
            delivers_to,
            type,
            sort: currentSort,
            verified: !verified,
          })}
          className={`text-xs px-3 py-2 rounded-full border ${
            verified
              ? 'bg-signal-green text-white border-signal-green'
              : 'bg-white border-concrete-300 hover:border-signal-green'
          }`}
        >
          {verified ? '✓ Verified only' : 'Verified only'}
        </Link>

        {hasFilters ? (
          <Link href="/sellers" className="text-sm text-rebar-600 font-medium hover:underline ml-auto">
            Clear filters
          </Link>
        ) : null}
      </div>
    </div>
  );
}
