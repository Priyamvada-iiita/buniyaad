'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getProfileIdForRole } from '@/lib/profiles';
import { formatRating, starsDisplay } from '@/lib/shop-social';

export default function RateSellerForm({
  sellerId,
  sellerName,
  orderId,
  certified = true,
}: {
  sellerId: string;
  sellerName: string;
  orderId: string;
  certified?: boolean;
}) {
  const supabase = createClient();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const submit = async () => {
    setError('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const buyerId = await getProfileIdForRole(supabase, user.id, 'buyer');
    if (!buyerId) return;

    const { error: saveError } = await supabase.from('seller_ratings').upsert(
      {
        seller_id: sellerId,
        buyer_id: buyerId,
        order_id: orderId,
        rating,
        review: review.trim() || null,
        certified,
      },
      { onConflict: 'seller_id,buyer_id' }
    );

    if (saveError) {
      setError(saveError.message);
      return;
    }
    setDone(true);
    setOpen(false);
  };

  if (done) {
    return <p className="text-xs text-signal-green font-medium mt-2">Thanks for rating {sellerName}!</p>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold text-rebar-600 mt-2">
        Rate this shop →
      </button>
    );
  }

  return (
    <div className="mt-3 p-3 rounded-lg bg-concrete-50 border border-concrete-200 space-y-2">
      <p className="text-xs font-semibold">Rate {sellerName}</p>
      {certified ? (
        <p className="text-[10px] text-steel-700 font-medium">✓ Certified buyer review — you ordered from this shop</p>
      ) : null}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-xl ${n <= rating ? 'text-rebar-500' : 'text-concrete-300'}`}
          >
            ★
          </button>
        ))}
        <span className="text-xs text-graphite-600 ml-2 self-center">{formatRating(rating)}</span>
      </div>
      <textarea
        className="input-field text-xs min-h-[60px]"
        placeholder="Optional review — delivery, quality, service…"
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      {error ? <p className="text-xs text-signal-red">{error}</p> : null}
      <div className="flex gap-2">
        <button type="button" onClick={submit} className="btn-primary text-xs py-1.5 px-3">
          Submit rating
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-graphite-600">
          Cancel
        </button>
      </div>
    </div>
  );
}

export function SellerRatingBadge({
  avg,
  count,
  certified,
}: {
  avg: number | null;
  count: number;
  certified?: boolean;
}) {
  if (!count || avg == null) {
    return <span className="text-xs text-graphite-500">No ratings yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm flex-wrap">
      <span className="text-rebar-500 font-semibold">{starsDisplay(avg)}</span>
      <span className="font-mono font-semibold">{formatRating(avg)}</span>
      <span className="text-xs text-graphite-500">({count})</span>
      {certified ? (
        <span className="tag bg-steel-50 text-steel-800 border border-steel-200 text-[10px] py-0">
          Certified buyers
        </span>
      ) : null}
    </span>
  );
}
