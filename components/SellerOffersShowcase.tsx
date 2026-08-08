'use client';

import Image from 'next/image';
import { parseProductIds, type SellerOffer } from '@/lib/shop-social';

type ProductMini = { id: string; name: string; price: number; unit: string; image_url: string | null };

export default function SellerOffersShowcase({
  offers,
  products,
  editable,
  onEdit,
  onDelete,
  onToggle,
}: {
  offers: SellerOffer[];
  products?: ProductMini[];
  editable?: boolean;
  onEdit?: (offer: SellerOffer) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, active: boolean) => void;
}) {
  const productMap = new Map((products || []).map((p) => [p.id, p]));
  const activeOffers = offers.filter((o) => o.active || editable);

  if (!activeOffers.length) {
    return (
      <div className="rounded-xl border border-dashed border-concrete-300 p-8 text-center text-sm text-graphite-500">
        {editable ? 'No offers yet — add your first deal below' : 'No active offers right now'}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {activeOffers.map((offer) => {
        const linked = parseProductIds(offer.product_ids)
          .map((id) => productMap.get(id))
          .filter(Boolean) as ProductMini[];

        return (
          <div
            key={offer.id}
            className={`relative overflow-hidden rounded-xl border ${
              offer.active ? 'border-rebar-200 bg-white shadow-sm' : 'border-concrete-200 bg-concrete-50 opacity-70'
            }`}
          >
            {offer.image_url ? (
              <div className="relative h-32 bg-concrete-100">
                <Image src={offer.image_url} alt="" fill className="object-cover" sizes="400px" />
                {offer.badge_text ? (
                  <span className="absolute top-3 left-3 tag bg-rebar-600 text-white shadow">{offer.badge_text}</span>
                ) : null}
              </div>
            ) : (
              <div className="h-24 bg-gradient-to-br from-rebar-500 to-rebar-700 flex items-center justify-center px-4">
                {offer.badge_text ? (
                  <span className="font-display text-xl text-white">{offer.badge_text}</span>
                ) : (
                  <span className="font-display text-lg text-white/90">OFFER</span>
                )}
              </div>
            )}

            <div className="p-4">
              <h4 className="font-semibold text-sm mb-1">{offer.title}</h4>
              {offer.description ? (
                <p className="text-xs text-graphite-600 mb-3 line-clamp-2">{offer.description}</p>
              ) : null}

              {linked.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {linked.slice(0, 3).map((p) => (
                    <span
                      key={p.id}
                      className="text-[10px] px-2 py-1 rounded-full bg-concrete-100 text-graphite-700 border border-concrete-200"
                    >
                      {p.name} · ₹{p.price}
                    </span>
                  ))}
                  {linked.length > 3 ? (
                    <span className="text-[10px] text-graphite-500">+{linked.length - 3} more</span>
                  ) : null}
                </div>
              ) : null}

              {editable ? (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-concrete-100">
                  <button type="button" onClick={() => onEdit?.(offer)} className="text-xs font-semibold text-steel-600">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggle?.(offer.id, offer.active)}
                    className="text-xs font-semibold text-graphite-600"
                  >
                    {offer.active ? 'Hide' : 'Show'}
                  </button>
                  <button type="button" onClick={() => onDelete?.(offer.id)} className="text-xs font-semibold text-signal-red">
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
