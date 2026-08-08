'use client';

import Link from 'next/link';
import { useState } from 'react';
import SellerImage from '@/components/SellerImage';
import { sellerTypeLabel } from '@/lib/profile-types';
import { resolveSellerCover, resolveSellerThumbnails } from '@/lib/seller-images';
import { sellerShopHref, type SellerProfile } from '@/lib/sellers';
import { formatRating, starsDisplay } from '@/lib/shop-social';
import { formatDeliveryArea } from '@/lib/delivery-scope';
import { phoneTelHref } from '@/lib/phone';

export default function SellerCard({
  seller,
}: {
  seller: SellerProfile & {
    shop_cover_url?: string | null;
    shop_photo_urls?: unknown;
    rating_avg?: number | null;
    rating_count?: number;
  };
}) {
  const name = seller.business_name || 'Seller';
  const typeLabel = sellerTypeLabel(seller.account_type || 'building_shop');
  const thumbnails = resolveSellerThumbnails(seller);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = thumbnails[activeIndex] || resolveSellerCover(seller);

  return (
    <Link
      href={sellerShopHref(seller.id)}
      className="card overflow-hidden hover:border-rebar-500 transition-colors block h-full group"
    >
      <div className="relative aspect-[16/10] bg-concrete-200 overflow-hidden">
        <SellerImage
          src={activeImage}
          alt={name}
          fill
          className="group-hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent pointer-events-none" />
        {seller.verified ? (
          <span className="absolute top-2 right-2 tag bg-signal-green text-white text-[10px] shadow-sm">
            Verified
          </span>
        ) : null}
      </div>

      {thumbnails.length > 1 ? (
        <div className="flex gap-1 p-2 bg-concrete-50 border-b border-concrete-100">
          {thumbnails.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveIndex(i);
              }}
              className={`relative h-11 flex-1 min-w-0 rounded-md overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? 'border-rebar-500 ring-1 ring-rebar-300'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
              aria-label={`Photo ${i + 1}`}
            >
              <SellerImage src={url} alt="" fill />
            </button>
          ))}
        </div>
      ) : null}

      <div className="p-4">
        <div className="mb-2 min-w-0">
          <h2 className="font-semibold text-base leading-tight truncate">{name}</h2>
          <p className="text-xs text-graphite-600 mt-1">{typeLabel}</p>
          {(seller.rating_count ?? 0) > 0 && seller.rating_avg != null ? (
            <p className="text-xs text-rebar-600 mt-1">
              {starsDisplay(seller.rating_avg)} {formatRating(seller.rating_avg)} ({seller.rating_count})
            </p>
          ) : null}
        </div>

        {seller.account_type === 'other' && seller.account_type_description ? (
          <p className="text-xs text-graphite-600 mb-3 line-clamp-2">{seller.account_type_description}</p>
        ) : null}

        <div className="text-xs text-graphite-600 space-y-1 mb-3">
          <p>
            {[seller.city, seller.district].filter(Boolean).join(', ') || 'Bihar'}
            {seller.pincode ? ` · Pin ${seller.pincode}` : ''}
          </p>
          <p className="text-steel-700 font-medium">{formatDeliveryArea(seller)}</p>
          {seller.phone ? (
            <p>
              <a
                href={phoneTelHref(seller.phone) || undefined}
                onClick={(e) => e.stopPropagation()}
                className="text-rebar-600 font-semibold hover:underline"
              >
                📞 {seller.phone}
              </a>
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-concrete-100">
          <span className="text-xs font-medium text-steel-600">
            {seller.product_count ?? 0} listing{(seller.product_count ?? 0) === 1 ? '' : 's'}
          </span>
          <span className="text-xs font-semibold text-rebar-600 group-hover:underline">View shop →</span>
        </div>
      </div>
    </Link>
  );
}
