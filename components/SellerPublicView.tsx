import Link from 'next/link';
import Image from 'next/image';
import { sellerTypeLabel } from '@/lib/profile-types';
import { parseShopPhotos, type AadhaarStatus } from '@/lib/seller-profile';
import { sellerShopHref } from '@/lib/sellers';
import { ShopMapFromProfile } from '@/components/ShopMapEmbed';
import PhoneLink from '@/components/PhoneLink';
import { formatDeliveryArea } from '@/lib/delivery-scope';
import { SellerRatingBadge } from '@/components/RateSellerForm';
import SellerOffersShowcase from '@/components/SellerOffersShowcase';
import { type SellerOffer } from '@/lib/shop-social';

export type SellerPublicProfile = {
  id: string;
  business_name: string | null;
  account_type: string | null;
  account_type_description: string | null;
  contact_name: string | null;
  phone: string | null;
  district: string | null;
  city: string | null;
  pincode: string | null;
  address: string | null;
  gstin: string | null;
  verified: boolean;
  shop_description?: string | null;
  shop_cover_url?: string | null;
  shop_photo_urls?: unknown;
  aadhaar_status?: AadhaarStatus | string | null;
  certification_url?: string | null;
  map_lat?: number | null;
  map_lng?: number | null;
  google_maps_url?: string | null;
  accepts_cod?: boolean | null;
  accepts_online?: boolean | null;
  delivery_scope?: string | null;
  delivery_districts?: string[] | null;
};

type ProductMini = { id: string; name: string; price: number; unit: string; image_url: string | null };

export default function SellerPublicView({
  seller,
  productCount,
  products,
  offers,
  offerProducts,
  ratingAvg,
  ratingCount,
  certifiedRatings,
  preview,
}: {
  seller: SellerPublicProfile;
  productCount?: number;
  products?: React.ReactNode;
  offers?: SellerOffer[];
  offerProducts?: ProductMini[];
  ratingAvg?: number | null;
  ratingCount?: number;
  certifiedRatings?: boolean;
  preview?: boolean;
}) {
  const name = seller.business_name || 'Seller';
  const typeLabel = sellerTypeLabel(seller.account_type || 'building_shop');
  const photos = parseShopPhotos(seller.shop_photo_urls);
  const cover = seller.shop_cover_url || photos[0] || null;
  const aadhaarStatus = (seller.aadhaar_status || 'not_submitted') as AadhaarStatus;
  const showTrust = seller.verified || aadhaarStatus === 'verified' || seller.certification_url;
  const offerList = (offers || []).filter((o) => o.active);

  return (
    <div className={preview ? 'pointer-events-none' : undefined}>
      {preview && (
        <p className="text-xs font-semibold uppercase tracking-wider text-steel-600 mb-3">
          Customer preview — yahi buyers ko dikhega
        </p>
      )}

      <div className="card overflow-hidden mb-8">
        {cover ? (
          <div className="relative h-44 md:h-56 bg-concrete-200">
            <Image src={cover} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 896px" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
              <div className="flex items-end gap-4">
                <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden border-2 border-white shadow-lg shrink-0 bg-graphite-800">
                  {photos[1] || photos[0] ? (
                    <Image src={photos[1] || photos[0]} alt="" fill className="object-cover" sizes="80px" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-white font-display text-xl">
                      {name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 text-white">
                  <h2 className="font-display text-2xl md:text-3xl leading-tight truncate">{name}</h2>
                  <p className="text-sm text-concrete-200">{typeLabel}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-28 bg-gradient-to-br from-graphite-800 to-ink flex items-end p-6">
            <h2 className="font-display text-2xl text-white">{name}</h2>
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {seller.verified ? <span className="tag bg-signal-green text-white">Verified</span> : null}
                <SellerRatingBadge avg={ratingAvg ?? null} count={ratingCount ?? 0} certified={certifiedRatings} />
              </div>

              <div className="flex flex-wrap gap-2">
                {seller.accepts_online !== false ? (
                  <span className="tag bg-steel-50 text-steel-800 border border-steel-200">💳 Online pay</span>
                ) : null}
                {seller.accepts_cod !== false ? (
                  <span className="tag bg-rebar-50 text-rebar-800 border border-rebar-200">💵 Cash on delivery</span>
                ) : null}
              </div>

              {seller.shop_description ? (
                <p className="text-sm text-graphite-700 leading-relaxed max-w-2xl">{seller.shop_description}</p>
              ) : null}

              <div className="text-sm text-graphite-600 space-y-1">
                {seller.contact_name ? <p>Contact: {seller.contact_name}</p> : null}
                {seller.phone ? (
                  <p>
                    <PhoneLink phone={seller.phone} />
                    <span className="text-graphite-500 text-xs ml-1">— tap to call</span>
                  </p>
                ) : null}
                {(seller.address || seller.city || seller.district) && (
                  <p>
                    {[seller.address, seller.city, seller.district].filter(Boolean).join(', ')}
                    {seller.pincode ? ` — ${seller.pincode}` : ''}
                  </p>
                )}
                {seller.gstin ? <p className="text-xs">GST: {seller.gstin}</p> : null}
                <p className="text-xs font-medium text-steel-700">{formatDeliveryArea(seller)}</p>
              </div>

              {showTrust ? (
                <div className="flex flex-wrap gap-2">
                  {aadhaarStatus === 'verified' ? (
                    <span className="tag bg-steel-50 text-steel-800 border border-steel-200">✓ Aadhaar verified</span>
                  ) : null}
                  {seller.certification_url ? (
                    <span className="tag bg-concrete-100 text-graphite-700 border border-concrete-200">Certificate on file</span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              <p className="font-mono text-2xl font-semibold">{productCount ?? '—'}</p>
              <p className="text-xs text-graphite-600 uppercase tracking-wide">Listings</p>
              {!preview ? (
                <Link href={sellerShopHref(seller.id)} className="text-xs text-rebar-600 font-semibold mt-2 inline-block hover:underline">
                  Share shop →
                </Link>
              ) : null}
            </div>
          </div>

          {photos.length > 0 ? (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase text-graphite-600 mb-3">Shop gallery</p>
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
                {photos.map((url) => (
                  <div
                    key={url}
                    className="relative h-28 w-36 md:h-32 md:w-44 shrink-0 rounded-xl overflow-hidden border border-concrete-200 snap-start"
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="176px" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-semibold uppercase text-graphite-600 mb-3">Shop location</p>
            <ShopMapFromProfile lat={seller.map_lat} lng={seller.map_lng} />
          </div>
        </div>
      </div>

      {offerList.length > 0 ? (
        <div className="mb-8">
          <h3 className="font-display text-lg mb-4">DEALS & OFFERS</h3>
          <SellerOffersShowcase offers={offerList} products={offerProducts} />
        </div>
      ) : null}

      {products !== undefined ? (
        <>
          <h3 className="font-display text-lg mb-4">PRODUCTS</h3>
          {products}
        </>
      ) : null}
    </div>
  );
}
