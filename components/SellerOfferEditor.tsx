'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { SupabaseClient } from '@supabase/supabase-js';
import SellerOffersShowcase from '@/components/SellerOffersShowcase';
import { uploadShopPhoto } from '@/lib/seller-profile';
import { parseProductIds, type SellerOffer } from '@/lib/shop-social';

type ProductMini = { id: string; name: string; price: number; unit: string; image_url: string | null };

const emptyOffer = () => ({
  title: '',
  description: '',
  badge_text: '',
  product_ids: [] as string[],
});

export default function SellerOfferEditor({
  supabase,
  userId,
  sellerId,
  offers,
  products,
  onChanged,
}: {
  supabase: SupabaseClient;
  userId: string;
  sellerId: string;
  offers: SellerOffer[];
  products: ProductMini[];
  onChanged: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyOffer());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const normalizedOffers = offers.map((o) => ({ ...o, product_ids: parseProductIds(o.product_ids) }));

  const startNew = () => {
    setEditingId('new');
    setForm(emptyOffer());
    setImageFile(null);
    setError('');
  };

  const startEdit = (offer: SellerOffer) => {
    setEditingId(offer.id);
    setForm({
      title: offer.title,
      description: offer.description || '',
      badge_text: offer.badge_text || '',
      product_ids: parseProductIds(offer.product_ids),
    });
    setImageFile(null);
    setError('');
  };

  const toggleProduct = (id: string) => {
    setForm((f) => ({
      ...f,
      product_ids: f.product_ids.includes(id) ? f.product_ids.filter((x) => x !== id) : [...f.product_ids, id],
    }));
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError('Offer title required');
      return;
    }
    setSaving(true);
    setError('');

    let image_url: string | null | undefined;
    if (imageFile) {
      try {
        image_url = await uploadShopPhoto(supabase, userId, imageFile);
      } catch (e: any) {
        setError(e.message);
        setSaving(false);
        return;
      }
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      badge_text: form.badge_text.trim() || null,
      product_ids: form.product_ids,
      ...(image_url ? { image_url } : {}),
    };

    if (editingId === 'new') {
      const { error: insertError } = await supabase.from('seller_offers').insert({
        seller_id: sellerId,
        ...payload,
        active: true,
      });
      if (insertError) setError(insertError.message);
      else {
        setEditingId(null);
        onChanged();
      }
    } else if (editingId) {
      const { error: updateError } = await supabase.from('seller_offers').update(payload).eq('id', editingId);
      if (updateError) setError(updateError.message);
      else {
        setEditingId(null);
        onChanged();
      }
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this offer?')) return;
    await supabase.from('seller_offers').delete().eq('id', id);
    onChanged();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from('seller_offers').update({ active: !active }).eq('id', id);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-graphite-600">Instagram-style deal cards — link your star products.</p>
        <button type="button" onClick={startNew} className="btn-primary text-sm shrink-0">
          + New offer
        </button>
      </div>

      <SellerOffersShowcase
        offers={normalizedOffers}
        products={products}
        editable
        onEdit={startEdit}
        onDelete={remove}
        onToggle={toggle}
      />

      {editingId ? (
        <div className="card p-5 border-2 border-rebar-200 space-y-4">
          <p className="font-semibold text-sm">{editingId === 'new' ? 'Create offer' : 'Edit offer'}</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="input-field sm:col-span-2"
              placeholder="Offer title — e.g. Monsoon cement sale"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="input-field"
              placeholder="Badge — e.g. 10% OFF"
              value={form.badge_text}
              onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
            />
            <label className="text-sm flex items-center gap-2 border border-concrete-300 rounded-md px-3 py-2 cursor-pointer">
              <span className="text-xs text-graphite-600 shrink-0">Banner image</span>
              <input type="file" accept="image/*" className="text-xs" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </label>
            <textarea
              className="input-field sm:col-span-2 min-h-[72px]"
              placeholder="Short description for buyers"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-graphite-600 mb-2">Link products (tap to select)</p>
            <div className="flex flex-wrap gap-2">
              {products.map((p) => {
                const selected = form.product_ids.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className={`flex items-center gap-2 text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                      selected ? 'border-rebar-600 bg-rebar-50 text-rebar-800' : 'border-concrete-200 bg-white'
                    }`}
                  >
                    {p.image_url ? (
                      <span className="relative w-8 h-8 rounded overflow-hidden shrink-0">
                        <Image src={p.image_url} alt="" fill className="object-cover" sizes="32px" />
                      </span>
                    ) : null}
                    <span>
                      {p.name}
                      <span className="block text-graphite-500">₹{p.price}/{p.unit}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <p className="text-sm text-signal-red">{error}</p> : null}

          <div className="flex gap-2">
            <button type="button" disabled={saving} onClick={save} className="btn-primary text-sm">
              {saving ? 'Saving…' : 'Save offer'}
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="btn-outline text-sm">
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
