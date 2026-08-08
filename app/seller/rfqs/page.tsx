'use client';

import { useEffect, useState } from 'react';
import SellerShell from '@/components/SellerShell';
import { createClient } from '@/lib/supabase/client';
import { useSellerSession } from '@/lib/seller-session';

type Rfq = { id: string; description: string; quantity: string; pincode: string; status: string; categories: { name: string } };

export default function SellerRfqsPage() {
  const supabase = createClient();
  const { sellerProfileId, ready } = useSellerSession();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [myQuotes, setMyQuotes] = useState<Record<string, boolean>>({});
  const [quoteForm, setQuoteForm] = useState<Record<string, { price: string; message: string }>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: openRfqs }, quotesRes] = await Promise.all([
      supabase.from('rfqs').select('*, categories(name)').eq('status', 'open').order('created_at', { ascending: false }),
      sellerProfileId
        ? supabase.from('quotes').select('rfq_id').eq('seller_id', sellerProfileId)
        : Promise.resolve({ data: [] as { rfq_id: string }[] }),
    ]);
    setRfqs(openRfqs || []);
    const map: Record<string, boolean> = {};
    quotesRes.data?.forEach((q) => {
      map[q.rfq_id] = true;
    });
    setMyQuotes(map);
    setLoading(false);
  };

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, sellerProfileId]);

  const submitQuote = async (rfqId: string) => {
    const values = quoteForm[rfqId];
    if (!values?.price) {
      setMessage('Enter a price first.');
      return;
    }
    if (!sellerProfileId) {
      setMessage('Seller profile not found.');
      return;
    }

    const { error } = await supabase.from('quotes').insert({
      rfq_id: rfqId,
      seller_id: sellerProfileId,
      price: Number(values.price),
      message: values.message || null,
    });

    if (error) { setMessage(error.message); return; }
    setMessage('Quote submitted.');
    load();
  };

  return (
    <SellerShell
      title="QUOTE REQUESTS"
      subtitle="Buyers post material requirements (RFQs). Submit your price quote — not the same as product orders."
    >
      {message && <p className="text-sm text-rebar-600 font-medium mb-4">{message}</p>}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="card h-24 bg-concrete-50" />
            <div className="card h-24 bg-concrete-50" />
          </div>
        ) : !rfqs.length ? (
          <div className="card p-10 text-center"><p className="font-semibold">No open requirements right now</p></div>
        ) : (
          <div className="space-y-4">
            {rfqs.map((r) => (
              <div key={r.id} className="card p-5">
                <p className="tag bg-steel-500 text-white mb-2">{r.categories?.name}</p>
                <p className="font-semibold text-sm mb-1">{r.quantity} — {r.description}</p>
                <p className="text-xs text-graphite-600 mb-3">Delivery pincode {r.pincode}</p>

                {myQuotes[r.id] ? (
                  <p className="text-xs text-signal-green font-medium">You've already quoted this requirement.</p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      placeholder="Your price (₹)"
                      type="number"
                      className="input-field w-32"
                      onChange={(e) => setQuoteForm({ ...quoteForm, [r.id]: { ...quoteForm[r.id], price: e.target.value } })}
                    />
                    <input
                      placeholder="Note (optional)"
                      className="input-field flex-1"
                      onChange={(e) => setQuoteForm({ ...quoteForm, [r.id]: { ...quoteForm[r.id], message: e.target.value } })}
                    />
                    <button onClick={() => submitQuote(r.id)} className="btn-primary text-sm">Quote</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </SellerShell>
  );
}
