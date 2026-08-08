'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { getProfileIdForRole } from '@/lib/profiles';

type Category = { id: string; name: string };
type Rfq = { id: string; description: string; quantity: string; pincode: string; status: string; category_id: string; created_at: string };
type Quote = { id: string; rfq_id: string; price: number; message: string; status: string; profiles: { business_name: string } };

export default function BuyerRfqPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [quotesByRfq, setQuotesByRfq] = useState<Record<string, Quote[]>>({});
  const [form, setForm] = useState({ category_id: '', description: '', quantity: '', pincode: '' });
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const buyerProfileId = await getProfileIdForRole(supabase, user.id, 'buyer');
    const { data: cats } = await supabase.from('categories').select('*').order('name');
    setCategories(cats || []);

    if (!buyerProfileId) {
      setRfqs([]);
      return;
    }

    const { data: myRfqs } = await supabase
      .from('rfqs')
      .select('*')
      .eq('buyer_id', buyerProfileId)
      .order('created_at', { ascending: false });
    setRfqs(myRfqs || []);

    if (myRfqs?.length) {
      const { data: quotes } = await supabase
        .from('quotes')
        .select('*, profiles!quotes_seller_id_fkey(business_name)')
        .in('rfq_id', myRfqs.map((r) => r.id));

      const grouped: Record<string, Quote[]> = {};
      quotes?.forEach((q: any) => {
        grouped[q.rfq_id] = grouped[q.rfq_id] || [];
        grouped[q.rfq_id].push(q);
      });
      setQuotesByRfq(grouped);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const buyerProfileId = await getProfileIdForRole(supabase, user.id, 'buyer');
    if (!buyerProfileId) {
      setMessage('Buyer profile not found. Please sign up as a buyer first.');
      return;
    }

    const { error } = await supabase.from('rfqs').insert({ ...form, buyer_id: buyerProfileId });
    if (error) { setMessage(error.message); return; }
    setForm({ category_id: '', description: '', quantity: '', pincode: '' });
    setMessage('Requirement posted — sellers can now quote.');
    load();
  };

  const acceptQuote = async (quoteId: string, rfqId: string) => {
    await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quoteId);
    await supabase.from('quotes').update({ status: 'rejected' }).eq('rfq_id', rfqId).neq('id', quoteId);
    await supabase.from('rfqs').update({ status: 'fulfilled' }).eq('id', rfqId);
    setMessage('Quote accepted. Coordinate payment & delivery directly with the seller, or add their catalog item to cart if listed.');
    load();
  };

  return (
    <>
      <Navbar role="buyer" />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display text-2xl mb-6">POST A REQUIREMENT</h1>

        <form onSubmit={handleSubmit} className="card p-5 space-y-3 mb-10">
          <select required className="input-field" value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea required placeholder="Describe what you need (grade, brand preference, etc.)" className="input-field" rows={3}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3">
            <input required placeholder="Quantity (e.g. 200 bags)" className="input-field"
              value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <input required placeholder="Delivery pincode" className="input-field" maxLength={6}
              value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          </div>
          {message && <p className="text-sm text-rebar-600 font-medium">{message}</p>}
          <button className="btn-primary">Post requirement</button>
        </form>

        <h2 className="font-display text-lg mb-4">YOUR REQUIREMENTS & QUOTES</h2>
        <div className="space-y-4">
          {rfqs.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">{r.quantity} — {r.description}</p>
                <span className="tag bg-concrete-200">{r.status}</span>
              </div>
              <p className="text-xs text-graphite-600 mb-3">Pincode {r.pincode}</p>

              {(quotesByRfq[r.id] || []).length === 0 ? (
                <p className="text-xs text-graphite-600">No quotes yet.</p>
              ) : (
                <div className="space-y-2">
                  {quotesByRfq[r.id].map((q) => (
                    <div key={q.id} className="flex items-center justify-between border-t border-concrete-100 pt-2">
                      <div>
                        <p className="text-sm font-medium">{q.profiles?.business_name} — ₹{q.price}</p>
                        {q.message && <p className="text-xs text-graphite-600">{q.message}</p>}
                      </div>
                      {q.status === 'accepted' ? (
                        <span className="tag bg-signal-green text-white">Accepted</span>
                      ) : q.status === 'rejected' ? (
                        <span className="tag bg-concrete-200">Declined</span>
                      ) : (
                        <button onClick={() => acceptQuote(q.id, r.id)} className="btn-primary text-xs py-1.5 px-3">Accept</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
