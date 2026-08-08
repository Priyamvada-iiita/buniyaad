'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SellerShell from '@/components/SellerShell';
import SellerPublicView from '@/components/SellerPublicView';
import { createClient } from '@/lib/supabase/client';
import { useSellerSession } from '@/lib/seller-session';
import {
  AADHAAR_STATUS_CLASS,
  AADHAAR_STATUS_LABEL,
  getPrivateDocSignedUrl,
  parseShopPhotos,
  uploadPrivateDoc,
  uploadShopPhoto,
  type SellerProfileRecord,
} from '@/lib/seller-profile';
import { BIHAR_DISTRICTS, SELLER_TYPES } from '@/lib/profile-types';
import { sellerShopHref } from '@/lib/sellers';
import { parseGoogleMapsUrl } from '@/lib/maps';
import { ShopMapFromProfile } from '@/components/ShopMapEmbed';
import SellerPayoutFields from '@/components/SellerPayoutFields';
import SellerOfferEditor from '@/components/SellerOfferEditor';
import DeliveryCoverageFields, { deliveryScopeFromProfile } from '@/components/DeliveryCoverageFields';
import type { DeliveryScope } from '@/lib/delivery-scope';
import {
  hasPayoutDetails,
  normalizeIfsc,
  normalizeUpiId,
  validatePayoutForm,
  type PayoutDetails,
} from '@/lib/payout';
import { parseProductIds, type SellerOffer } from '@/lib/shop-social';

type Tab = 'edit' | 'preview';
type StudioSection = 'storefront' | 'photos' | 'location' | 'payments' | 'offers' | 'verify';

const STUDIO_NAV: { id: StudioSection; label: string; icon: string }[] = [
  { id: 'storefront', label: 'Storefront', icon: '🏪' },
  { id: 'photos', label: 'Gallery', icon: '📸' },
  { id: 'location', label: 'Map', icon: '📍' },
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'offers', label: 'Offers', icon: '🏷️' },
  { id: 'verify', label: 'Verify', icon: '✓' },
];

export default function SellerProfilePage() {
  const supabase = createClient();
  const { userId, sellerProfileId, ready } = useSellerSession();
  const [tab, setTab] = useState<Tab>('edit');
  const [section, setSection] = useState<StudioSection>('storefront');
  const [profile, setProfile] = useState<SellerProfileRecord | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [offers, setOffers] = useState<SellerOffer[]>([]);
  const [shopProducts, setShopProducts] = useState<{ id: string; name: string; price: number; unit: string; image_url: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    phone: '',
    district: '',
    city: '',
    pincode: '',
    address: '',
    gstin: '',
    account_type: '',
    account_type_description: '',
    shop_description: '',
    google_maps_url: '',
    accepts_cod: true,
    accepts_online: true,
  });
  const [payout, setPayout] = useState<PayoutDetails>({
    upi_id: '',
    account_name: '',
    bank_name: '',
    account_number: '',
    ifsc: '',
  });
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryScope, setDeliveryScope] = useState<DeliveryScope>('my_district');
  const [deliveryDistricts, setDeliveryDistricts] = useState<string[]>([]);

  const photos = useMemo(() => parseShopPhotos(profile?.shop_photo_urls), [profile?.shop_photo_urls]);

  const load = async () => {
    setLoading(true);
    if (!sellerProfileId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const [profileRes, offerRes, productsRes, countRes, payoutRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', sellerProfileId).single(),
      supabase.from('seller_offers').select('*').eq('seller_id', sellerProfileId).order('sort_order', { ascending: true }),
      supabase
        .from('products')
        .select('id, name, price, unit, image_url')
        .eq('seller_id', sellerProfileId)
        .order('created_at', { ascending: false }),
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerProfileId)
        .eq('active', true),
      supabase.from('seller_payout_details').select('*').eq('seller_id', sellerProfileId).maybeSingle(),
    ]);

    const data = profileRes.data;
    if (data) {
      setProfile(data as SellerProfileRecord);
      setForm({
        business_name: data.business_name || '',
        contact_name: data.contact_name || '',
        phone: data.phone || '',
        district: data.district || '',
        city: data.city || '',
        pincode: data.pincode || '',
        address: data.address || '',
        gstin: data.gstin || '',
        account_type: data.account_type || '',
        account_type_description: data.account_type_description || '',
        shop_description: data.shop_description || '',
        google_maps_url: data.google_maps_url || '',
        accepts_cod: data.accepts_cod !== false,
        accepts_online: data.accepts_online !== false,
      });
      if (data.map_lat != null && data.map_lng != null) {
        setMapCoords({ lat: Number(data.map_lat), lng: Number(data.map_lng) });
      }
      const delivery = deliveryScopeFromProfile(data);
      setDeliveryScope(delivery.scope);
      setDeliveryDistricts(delivery.districts);
    }

    setOffers((offerRes.data as SellerOffer[]) || []);
    setShopProducts(productsRes.data || []);
    setProductCount(countRes.count || 0);
    const payoutRow = payoutRes.data;
    setPayout({
      upi_id: payoutRow?.upi_id || '',
      account_name: payoutRow?.account_name || '',
      bank_name: payoutRow?.bank_name || '',
      account_number: payoutRow?.account_number || '',
      ifsc: payoutRow?.ifsc || '',
      razorpay_linked_account_id: payoutRow?.razorpay_linked_account_id || '',
    });
    setLoading(false);
  };

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, sellerProfileId]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError('');
    setMessage('');

    if (deliveryScope === 'custom_districts' && deliveryDistricts.length === 0) {
      setError('Delivery coverage: kam se kam ek district chuno.');
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        business_name: form.business_name.trim() || null,
        contact_name: form.contact_name.trim() || null,
        phone: form.phone.trim() || null,
        district: form.district || null,
        city: form.city.trim() || null,
        pincode: form.pincode.trim() || null,
        address: form.address.trim() || null,
        gstin: form.gstin.trim() || null,
        account_type: form.account_type || null,
        account_type_description: form.account_type_description.trim() || null,
        shop_description: form.shop_description.trim() || null,
        accepts_cod: form.accepts_cod,
        accepts_online: form.accepts_online,
        google_maps_url: form.google_maps_url.trim() || null,
        map_lat: mapCoords?.lat ?? null,
        map_lng: mapCoords?.lng ?? null,
        delivery_scope: deliveryScope,
        delivery_districts: deliveryScope === 'custom_districts' ? deliveryDistricts : [],
        profile_complete: Boolean(form.phone && form.district && form.pincode.length === 6 && form.address),
      })
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setMessage('Profile saved.');
    await load();
    setSaving(false);
  };

  const handleShopPhotos = async (files: FileList | null) => {
    if (!files?.length || !profile || !userId) return;
    setError('');

    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        newUrls.push(await uploadShopPhoto(supabase, userId, file));
      }
      const merged = [...photos, ...newUrls];
      const cover = profile.shop_cover_url || merged[0] || null;
      await supabase
        .from('profiles')
        .update({ shop_photo_urls: merged, shop_cover_url: cover })
        .eq('id', profile.id);
      setMessage('Shop photos uploaded.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Upload failed. Check Storage bucket product-images exists.');
    }
  };

  const setCover = async (url: string) => {
    if (!profile) return;
    await supabase.from('profiles').update({ shop_cover_url: url }).eq('id', profile.id);
    await load();
  };

  const removePhoto = async (url: string) => {
    if (!profile) return;
    const next = photos.filter((p) => p !== url);
    const cover = profile.shop_cover_url === url ? next[0] || null : profile.shop_cover_url;
    await supabase.from('profiles').update({ shop_photo_urls: next, shop_cover_url: cover }).eq('id', profile.id);
    await load();
  };

  const uploadDoc = async (kind: 'aadhaar' | 'registration' | 'certification', file: File | null) => {
    if (!file || !profile || !userId) return;
    setError('');

    try {
      const path = await uploadPrivateDoc(supabase, userId, file, kind);
      const patch: Record<string, string> = {};
      if (kind === 'aadhaar') {
        patch.aadhaar_doc_url = path;
        patch.aadhaar_status = 'pending';
      } else if (kind === 'registration') {
        patch.registration_doc_url = path;
      } else {
        patch.certification_url = path;
      }
      await supabase.from('profiles').update(patch).eq('id', profile.id);
      setMessage(`${kind === 'aadhaar' ? 'Aadhaar' : kind === 'registration' ? 'Registration' : 'Certificate'} uploaded — admin will review.`);
      await load();
    } catch (err: any) {
      setError(err.message || 'Upload failed. Create private bucket seller-documents in Supabase Storage.');
    }
  };

  const applyMapsLink = () => {
    const coords = parseGoogleMapsUrl(form.google_maps_url);
    if (coords) {
      setMapCoords(coords);
      setMessage('Map location set from link.');
    } else {
      setError('Could not read location — paste a Google Maps share link with @lat,lng');
    }
  };

  const savePayments = async () => {
    if (!profile) return;
    if (!form.accepts_cod && !form.accepts_online) {
      setError('Enable at least one payment option.');
      return;
    }

    const payoutError = validatePayoutForm(payout);
    const payoutReady = hasPayoutDetails(payout);
    if (form.accepts_online && !payoutReady) {
      setError(payoutError || 'Add UPI or bank details before enabling online payments.');
      return;
    }
    if (payoutError && (payout.upi_id || payout.account_number || payout.ifsc || payout.account_name)) {
      setError(payoutError);
      return;
    }

    setSaving(true);
    setError('');

    const normalizedPayout = {
      upi_id: payout.upi_id?.trim() ? normalizeUpiId(payout.upi_id) : null,
      account_name: payout.account_name?.trim() || null,
      bank_name: payout.bank_name?.trim() || null,
      account_number: payout.account_number?.replace(/\s/g, '') || null,
      ifsc: payout.ifsc?.trim() ? normalizeIfsc(payout.ifsc) : null,
      setup_complete: payoutReady,
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        accepts_cod: form.accepts_cod,
        accepts_online: form.accepts_online,
        payout_setup_complete: payoutReady,
      })
      .eq('id', profile.id);

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    if (payoutReady || payout.upi_id || payout.account_number) {
      const { error: payoutSaveError } = await supabase.from('seller_payout_details').upsert({
        seller_id: profile.id,
        ...normalizedPayout,
      });
      if (payoutSaveError) {
        setError(payoutSaveError.message);
        setSaving(false);
        return;
      }
    }

    setMessage('Payment & settlement details saved.');
    setSaving(false);
    await load();
  };

  const saveLocation = async () => {
    if (!profile) return;
    setSaving(true);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        google_maps_url: form.google_maps_url.trim() || null,
        map_lat: mapCoords?.lat ?? null,
        map_lng: mapCoords?.lng ?? null,
      })
      .eq('id', profile.id);
    if (updateError) setError(updateError.message);
    else setMessage('Map location saved.');
    setSaving(false);
    await load();
  };

  const viewDoc = async (path: string | null) => {
    if (!path) return;
    try {
      const url = await getPrivateDocSignedUrl(supabase, path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      setError(err.message || 'Could not open document.');
    }
  };

  if (!ready || loading) {
    return (
      <SellerShell title="SHOP PROFILE" subtitle="Loading…">
        <div className="space-y-4 animate-pulse">
          <div className="card h-40 bg-concrete-50" />
          <div className="card h-64 bg-concrete-50" />
        </div>
      </SellerShell>
    );
  }

  if (!profile) {
    return (
      <SellerShell title="SHOP PROFILE">
        <div className="card p-8 text-center">
          <p className="font-semibold mb-2">Seller profile not found</p>
          <Link href="/signup?role=seller" className="btn-primary inline-block text-sm">
            Sign up as seller
          </Link>
        </div>
      </SellerShell>
    );
  }

  const previewSeller = {
    ...profile,
    ...form,
    shop_photo_urls: photos,
    shop_cover_url: profile.shop_cover_url,
    map_lat: mapCoords?.lat ?? profile.map_lat,
    map_lng: mapCoords?.lng ?? profile.map_lng,
  };

  return (
    <SellerShell
      title="SHOP STUDIO"
      subtitle="Apni dukan ka LinkedIn/Instagram page — visual edit, live preview."
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('edit')}
            className={tab === 'edit' ? 'btn-primary text-sm' : 'btn-outline text-sm'}
          >
            Edit profile
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={tab === 'preview' ? 'btn-primary text-sm' : 'btn-outline text-sm'}
          >
            Customer preview
          </button>
        </div>
        <Link href={sellerShopHref(profile.id)} className="text-sm font-semibold text-rebar-600 hover:underline ml-auto">
          Open live shop page →
        </Link>
      </div>

      {message && <p className="text-sm text-signal-green font-medium mb-4">{message}</p>}
      {error && <p className="text-sm text-signal-red mb-4">{error}</p>}

      {tab === 'preview' ? (
        <SellerPublicView
          seller={previewSeller}
          productCount={productCount}
          offers={offers}
          offerProducts={shopProducts}
          preview
        />
      ) : (
        <div className="grid lg:grid-cols-[12rem_1fr] gap-6">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {STUDIO_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  section === item.id
                    ? 'bg-rebar-600 text-white shadow-sm'
                    : 'bg-white border border-concrete-200 text-graphite-700 hover:border-rebar-300'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="space-y-6 min-w-0">
            {section === 'storefront' && (
          <form onSubmit={saveProfile} className="card p-5 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-graphite-600">Shop details</h2>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                required
                className="input-field md:col-span-2"
                placeholder="Shop / business name"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              />
              <select
                className="input-field md:col-span-2"
                value={form.account_type}
                onChange={(e) => setForm({ ...form, account_type: e.target.value })}
              >
                <option value="">Business type</option>
                {SELLER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {form.account_type === 'other' && (
                <input
                  className="input-field md:col-span-2"
                  placeholder="Describe your business"
                  value={form.account_type_description}
                  onChange={(e) => setForm({ ...form, account_type_description: e.target.value })}
                />
              )}
              <textarea
                className="input-field md:col-span-2 min-h-[88px]"
                placeholder="Shop description — brands, delivery area, years in business…"
                value={form.shop_description}
                onChange={(e) => setForm({ ...form, shop_description: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Contact person"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              />
              <input
                required
                className="input-field"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <select
                required
                className="input-field"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              >
                <option value="">District</option>
                {BIHAR_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                className="input-field"
                placeholder="City / area"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                required
                className="input-field"
                placeholder="Shop pincode (address)"
                maxLength={6}
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="GSTIN (optional)"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              />
              <input
                required
                className="input-field md:col-span-2"
                placeholder="Shop address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <DeliveryCoverageFields
              scope={deliveryScope}
              districts={deliveryDistricts}
              shopDistrict={form.district}
              shopCity={form.city}
              onScopeChange={setDeliveryScope}
              onDistrictsChange={setDeliveryDistricts}
            />

            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : 'Save storefront'}
            </button>
          </form>
            )}

            {section === 'photos' && (
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-graphite-600">Shop photos</h2>
            <p className="text-xs text-graphite-600">Storefront, godown, stock — buyers trust real photos.</p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="text-sm"
              onChange={(e) => handleShopPhotos(e.target.files)}
            />
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {photos.map((url) => (
                  <div key={url} className="relative">
                    <div className="relative h-24 w-32 rounded-lg overflow-hidden border border-concrete-200">
                      <Image src={url} alt="" fill className="object-cover" sizes="128px" />
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button type="button" onClick={() => setCover(url)} className="text-[10px] font-semibold text-rebar-600">
                        {profile.shop_cover_url === url ? 'Cover ✓' : 'Set cover'}
                      </button>
                      <button type="button" onClick={() => removePhoto(url)} className="text-[10px] font-semibold text-signal-red">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            )}

            {section === 'location' && (
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-graphite-600">Google Maps location</h2>
            <p className="text-xs text-graphite-600">
              Google Maps app → your shop → Share → Copy link. Paste below. Buyers will see map on your shop page.
            </p>
            <input
              className="input-field"
              placeholder="https://maps.google.com/... or https://goo.gl/maps/..."
              value={form.google_maps_url}
              onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={applyMapsLink} className="btn-outline text-sm">
                Read location from link
              </button>
              <button type="button" onClick={saveLocation} disabled={saving} className="btn-primary text-sm">
                Save map
              </button>
            </div>
            <ShopMapFromProfile lat={mapCoords?.lat} lng={mapCoords?.lng} />
          </div>
            )}

            {section === 'payments' && (
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-graphite-600">Payment options</h2>
            <p className="text-xs text-graphite-600">
              Buyers see these at checkout. Online pay needs your UPI/bank below so payments can reach you.
            </p>
            <SellerPayoutFields payout={payout} onChange={setPayout} />
            <label className="flex items-center gap-3 p-4 rounded-xl border border-concrete-200 cursor-pointer hover:border-rebar-300">
              <input
                type="checkbox"
                checked={form.accepts_online}
                onChange={(e) => setForm({ ...form, accepts_online: e.target.checked })}
                className="w-5 h-5"
                disabled={!hasPayoutDetails(payout) && !form.accepts_online}
              />
              <div>
                <p className="font-semibold text-sm">Online payment (UPI / card)</p>
                <p className="text-xs text-graphite-600">
                  Razorpay checkout — settlement to your UPI/bank above
                  {!hasPayoutDetails(payout) ? ' (add payout details first)' : ''}
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 rounded-xl border border-concrete-200 cursor-pointer hover:border-rebar-300">
              <input
                type="checkbox"
                checked={form.accepts_cod}
                onChange={(e) => setForm({ ...form, accepts_cod: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <p className="font-semibold text-sm">Cash on delivery (COD)</p>
                <p className="text-xs text-graphite-600">Pay when material is delivered</p>
              </div>
            </label>
            <button type="button" onClick={savePayments} disabled={saving} className="btn-primary text-sm">
              Save payment & settlement details
            </button>
          </div>
            )}

            {section === 'offers' && userId && profile && (
          <div className="card p-5">
            <SellerOfferEditor
              supabase={supabase}
              userId={userId}
              sellerId={profile.id}
              offers={offers}
              products={shopProducts}
              onChanged={load}
            />
          </div>
            )}

            {section === 'verify' && (
          <div className="card p-5 space-y-5">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-graphite-600">Verification documents</h2>
            <p className="text-xs text-graphite-600">
              Aadhaar helps Buniyaad verify you. Registration & trade certificates are optional but build buyer trust.
              Documents are private — only you and platform admin can view them.
            </p>

            <div className="border border-concrete-200 rounded-lg p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">Aadhaar (identity)</p>
                  <p className="text-xs text-graphite-600">Photo or PDF — front side, readable</p>
                </div>
                <span className={`tag ${AADHAAR_STATUS_CLASS[profile.aadhaar_status]}`}>
                  {AADHAAR_STATUS_LABEL[profile.aadhaar_status]}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="text-sm"
                  onChange={(e) => uploadDoc('aadhaar', e.target.files?.[0] || null)}
                />
                {profile.aadhaar_doc_url ? (
                  <button type="button" onClick={() => viewDoc(profile.aadhaar_doc_url)} className="text-xs font-semibold text-steel-600">
                    View uploaded
                  </button>
                ) : null}
              </div>
            </div>

            <div className="border border-concrete-200 rounded-lg p-4 space-y-3">
              <p className="font-medium text-sm">Shop / company registration (optional)</p>
              <p className="text-xs text-graphite-600">GST certificate, trade license, partnership deed, etc.</p>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="text-sm"
                  onChange={(e) => uploadDoc('registration', e.target.files?.[0] || null)}
                />
                {profile.registration_doc_url ? (
                  <button type="button" onClick={() => viewDoc(profile.registration_doc_url)} className="text-xs font-semibold text-steel-600">
                    View uploaded
                  </button>
                ) : null}
              </div>
            </div>

            <div className="border border-concrete-200 rounded-lg p-4 space-y-3">
              <p className="font-medium text-sm">Trade / brand certification (optional)</p>
              <p className="text-xs text-graphite-600">Dealer certificate, brand authorization letter, etc.</p>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="text-sm"
                  onChange={(e) => uploadDoc('certification', e.target.files?.[0] || null)}
                />
                {profile.certification_url ? (
                  <button type="button" onClick={() => viewDoc(profile.certification_url)} className="text-xs font-semibold text-steel-600">
                    View uploaded
                  </button>
                ) : null}
              </div>
            </div>
          </div>
            )}
          </div>
        </div>
      )}
    </SellerShell>
  );
}
