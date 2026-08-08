'use client';

import Link from 'next/link';
import { sellerTypeLabel } from '@/lib/profile-types';
import { sellerShopHref, type SellerProfile } from '@/lib/sellers';
import { formatRating, starsDisplay } from '@/lib/shop-social';
import { formatDeliveryArea } from '@/lib/delivery-scope';
import { phoneTelHref } from '@/lib/phone';

export default function SellerCard({
  seller,
}: {
  seller: SellerProfile & { rating_avg?: number | null; rating_count?: number };
}) {
  const name = seller.business_name || 'Seller';
  const typeLabel = sellerTypeLabel(seller.account_type || 'building_shop');

  return (
    <Link href={sellerShopHref(seller.id)} className="card p-5 hover:border-rebar-500 transition-colors block h-full">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-base leading-tight truncate">{name}</h2>
          <p className="text-xs text-graphite-600 mt-1">{typeLabel}</p>
          {(seller.rating_count ?? 0) > 0 && seller.rating_avg != null ? (
            <p className="text-xs text-rebar-600 mt-1">
              {starsDisplay(seller.rating_avg)} {formatRating(seller.rating_avg)} ({seller.rating_count})
            </p>
          ) : null}
        </div>
        {seller.verified ? (
          <span className="tag bg-signal-green text-white shrink-0 text-xs">Verified</span>
        ) : null}
      </div>

      {seller.account_type === 'other' && seller.account_type_description ? (
        <p className="text-xs text-graphite-600 mb-3 line-clamp-2">{seller.account_type_description}</p>
      ) : null}

      <div className="text-xs text-graphite-600 space-y-1 mb-4">
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
        <span className="text-xs font-semibold text-rebar-600">View shop →</span>
      </div>
    </Link>
  );
}
