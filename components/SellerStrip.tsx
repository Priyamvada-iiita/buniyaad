'use client';

import Link from 'next/link';
import { useRef } from 'react';
import SellerImage from '@/components/SellerImage';
import { resolveSellerCover } from '@/lib/seller-images';
import { sellerShopHref, type SellerProfile } from '@/lib/sellers';

export default function SellerStrip({
  sellers,
}: {
  sellers: (SellerProfile & { shop_cover_url?: string | null; shop_photo_urls?: unknown })[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!sellers.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-graphite-600">Shops near you</h2>
        <div className="hidden sm:flex gap-1">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
            className="h-8 w-8 rounded-full border border-concrete-300 text-graphite-600 hover:bg-concrete-100"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
            className="h-8 w-8 rounded-full border border-concrete-300 text-graphite-600 hover:bg-concrete-100"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin"
      >
        {sellers.map((seller) => {
          const name = seller.business_name || 'Shop';
          const cover = resolveSellerCover(seller);
          return (
            <Link
              key={seller.id}
              href={sellerShopHref(seller.id)}
              className="snap-start shrink-0 w-[88px] sm:w-[96px] group text-center"
            >
              <div className="relative mx-auto h-[72px] w-[72px] sm:h-20 sm:w-20 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-1 ring-concrete-200 group-hover:ring-rebar-400 transition-all">
                <SellerImage src={cover} alt={name} fill className="group-hover:scale-105 transition-transform duration-300" />
              </div>
              <p className="mt-2 text-[11px] sm:text-xs font-medium text-ink line-clamp-2 leading-tight px-0.5">
                {name}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
