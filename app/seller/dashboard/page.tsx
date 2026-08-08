'use client';

import { useEffect, useMemo, useState } from 'react';
import SellerShell from '@/components/SellerShell';
import { createClient } from '@/lib/supabase/client';
import {
  suggestCategories,
  parseBulkLines,
  BULK_EXAMPLE,
  type DbCategory,
} from '@/lib/category-match';
import { useSellerSession } from '@/lib/seller-session';
import {
  getDefaultUnitForParentSlug,
  formatUnitShort,
  resolveCustomUnit,
  splitUnitForForm,
  CUSTOM_UNIT_VALUE,
} from '@/lib/product-units';
import BulkAddGuide from '@/components/BulkAddGuide';
import UnitSelectField from '@/components/UnitSelectField';
import { formatDeliveryArea } from '@/lib/delivery-scope';
import type { DeliveryScope } from '@/lib/delivery-scope';

type Category = DbCategory;
type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  active: boolean;
  category_id: string;
  custom_category: string | null;
  image_url: string | null;
};

const emptyForm = {
  parent_category_id: '',
  category_id: '',
  custom_category: '',
  name: '',
  unit: 'bag',
  price: '',
  stock: '',
  unit_custom: '',
};

function FormField({
  label,
  hint,
  required,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-ink mb-0.5">
        {label}
        {required ? <span className="text-signal-red ml-0.5" aria-hidden>*</span> : null}
      </label>
      {hint ? <p className="text-xs text-graphite-600 mb-1.5 leading-relaxed">{hint}</p> : null}
      {children}
    </div>
  );
}

function StepHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="md:col-span-2 rounded-lg border border-concrete-200 bg-concrete-50/80 px-4 py-3">
      <p className="text-[10px] font-mono uppercase tracking-wider text-rebar-600 mb-1">Step {step}</p>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="text-xs text-graphite-600 mt-0.5 leading-relaxed">{subtitle}</p>
    </div>
  );
}

export default function SellerDashboard() {
  const supabase = createClient();
  const { sellerProfileId, userId, ready } = useSellerSession();
  const [tab, setTab] = useState<'single' | 'bulk'>('single');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [categoryHint, setCategoryHint] = useState('');
  const [bulkText, setBulkText] = useState(BULK_EXAMPLE);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shopDelivery, setShopDelivery] = useState<{
    pincode: string | null;
    district: string | null;
    city: string | null;
    delivery_scope: DeliveryScope | string | null;
    delivery_districts: string[] | null;
  } | null>(null);

  const parentCategories = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);
  const subCategories = useMemo(
    () => categories.filter((c) => c.parent_id === form.parent_category_id),
    [categories, form.parent_category_id]
  );
  const selectedParent = parentCategories.find((c) => c.id === form.parent_category_id);
  const isOthers = selectedParent?.slug === 'others';
  const parentSlug = selectedParent?.slug;

  const suggestions = useMemo(
    () => suggestCategories(categoryHint, categories, 4),
    [categoryHint, categories]
  );

  const load = async () => {
    setLoading(true);
    const [catsRes, productsRes, profileRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      sellerProfileId
        ? supabase
            .from('products')
            .select('*')
            .eq('seller_id', sellerProfileId)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] as Product[] }),
      sellerProfileId
        ? supabase
            .from('profiles')
            .select('pincode, district, city, delivery_scope, delivery_districts')
            .eq('id', sellerProfileId)
            .single()
        : Promise.resolve({ data: null }),
    ]);
    setCategories(catsRes.data || []);
    setProducts(productsRes.data || []);
    setShopDelivery(profileRes.data || null);
    setLoading(false);
  };

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, sellerProfileId]);

  const applySuggestion = (cat: Category) => {
    const parent = categories.find((c) => c.id === cat.parent_id);
    setForm((f) => ({
      ...f,
      parent_category_id: cat.parent_id || '',
      category_id: cat.id,
      custom_category: parent?.slug === 'others' ? f.custom_category : '',
      unit: getDefaultUnitForParentSlug(parent?.slug),
      unit_custom: '',
    }));
  };

  const startEdit = (p: Product) => {
    const cat = categories.find((c) => c.id === p.category_id);
    const parentId = cat?.parent_id || '';
    setEditingId(p.id);
    setTab('single');
    const unitParts = splitUnitForForm(p.unit);
    setForm({
      parent_category_id: parentId,
      category_id: p.category_id,
      custom_category: p.custom_category || '',
      name: p.name,
      unit: unitParts.unit,
      unit_custom: unitParts.unit_custom,
      price: String(p.price),
      stock: String(p.stock),
    });
    setCategoryHint('');
    setImageFile(null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setCategoryHint('');
    setImageFile(null);
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const profileId = sellerProfileId;
    if (!profileId) {
      setMessage('Seller profile not found. Please sign up as a seller first.');
      return;
    }

    if (!form.category_id) { setMessage('Please select a category.'); return; }
    if (isOthers && !form.custom_category.trim()) {
      setMessage('Please add a short product note (what you are selling).');
      return;
    }

    let resolvedUnit = form.unit;
    if (form.unit === CUSTOM_UNIT_VALUE) {
      const custom = resolveCustomUnit(form.unit_custom);
      if (!custom) {
        setMessage('Custom unit daalein — kam se kam 2 characters (e.g. peti, dozen, running ft).');
        return;
      }
      resolvedUnit = custom;
    }

    let image_url: string | null | undefined = undefined;
    if (imageFile) {
      const path = `${userId}/${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, imageFile);
      if (!uploadError) {
        image_url = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
      }
    }

    if (!shopDelivery?.pincode || shopDelivery.pincode.length !== 6) {
      setMessage('Pehle Shop Studio → Storefront mein shop pincode aur delivery coverage set karein.');
      return;
    }

    const payload = {
      category_id: form.category_id,
      custom_category: isOthers ? form.custom_category.trim() : null,
      name: form.name,
      unit: resolvedUnit,
      price: Number(form.price),
      stock: Number(form.stock),
      ...(image_url !== undefined ? { image_url } : {}),
    };

    if (editingId) {
      const updatePayload = image_url !== undefined ? { ...payload, image_url } : payload;
      const { error } = await supabase.from('products').update(updatePayload).eq('id', editingId);
      if (error) {
        setMessage(error.message);
        return;
      }
      cancelEdit();
      setMessage('Product updated.');
      load();
      return;
    }

    const { error } = await supabase.from('products').insert({
      seller_id: profileId,
      ...payload,
      image_url: image_url ?? null,
    });

    if (error) { setMessage(error.message); return; }
    setForm(emptyForm);
    setCategoryHint('');
    setImageFile(null);
    setMessage('Product listed.');
    load();
  };

  const handleBulk = async () => {
    const profileId = sellerProfileId;
    if (!profileId) {
      setMessage('Seller profile not found.');
      return;
    }

    const rows = parseBulkLines(bulkText);
    const errors = rows.filter((r) => r.error);
    if (errors.length) {
      setMessage(`Line ${errors[0].line}: ${errors[0].error}`);
      return;
    }

    const slugToId = new Map(categories.map((c) => [c.slug, c.id]));
    const toInsert: {
      seller_id: string;
      category_id: string;
      custom_category: string | null;
      name: string;
      unit: string;
      price: number;
      stock: number;
      active: boolean;
    }[] = [];

    for (const r of rows) {
      const catId = slugToId.get(r.category_slug);
      if (!catId) {
        setMessage(`Line ${r.line}: Unknown slug "${r.category_slug}"`);
        return;
      }
      const cat = categories.find((c) => c.id === catId);
      const parent = cat?.parent_id ? categories.find((c) => c.id === cat.parent_id) : null;
      toInsert.push({
        seller_id: profileId,
        category_id: catId,
        custom_category: parent?.slug === 'others' ? r.name : null,
        name: r.name,
        unit: r.unit,
        price: r.price,
        stock: r.stock,
        active: true,
      });
    }

    const { error } = await supabase.from('products').insert(toInsert);
    if (error) { setMessage(error.message); return; }
    setMessage(`${toInsert.length} products added.`);
    load();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('products').update({ active: !active }).eq('id', id);
    load();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    load();
  };

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '';

  return (
    <SellerShell title="PRODUCTS" subtitle="Apni dukan ke products list karein — har shop ki alag listing.">
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="card h-20 bg-concrete-50" />
          <div className="card h-64 bg-concrete-50" />
        </div>
      ) : (
        <>
      <div className="card p-4 mb-6 bg-concrete-50 border-steel-500/30 border-l-4 border-l-steel-500">
          <p className="text-sm font-semibold mb-1">Categories = Buniyaad sets these</p>
          <p className="text-xs text-graphite-600 leading-relaxed">
            Aap categories change <strong>nahi</strong> kar sakte. Sirf apne dukan ke products add karein —
            naam, price, stock — under the category Buniyaad provides. Har shop ki apni listing alag hoti hai.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab('single')}
            className={tab === 'single' ? 'btn-primary' : 'btn-outline text-sm'}
          >
            Single product
          </button>
          <button
            type="button"
            onClick={() => setTab('bulk')}
            className={tab === 'bulk' ? 'btn-primary' : 'btn-outline text-sm'}
          >
            Bulk add
          </button>
        </div>

        {tab === 'single' ? (
          <form onSubmit={handleSubmit} className="card p-5 md:p-6 grid md:grid-cols-2 gap-4 mb-10">
            {editingId ? (
              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2 p-3 rounded-md bg-rebar-50 border border-rebar-200">
                <p className="text-sm font-semibold text-rebar-800">Editing product</p>
                <button type="button" onClick={cancelEdit} className="text-xs font-semibold text-graphite-600 hover:text-ink">
                  Cancel edit
                </button>
              </div>
            ) : null}

            <StepHeader
              step={1}
              title="Buniyaad category — platform list"
              subtitle="Yeh categories Buniyaad set karta hai. Aap sirf sahi category chuno — apni category create nahi kar sakte."
            />

            <FormField
              className="md:col-span-2"
              label="Category search (optional)"
              hint="Apne product ka naam type karein — system suggest karega kaunsi Buniyaad category fit hai. Example: ultratech cement, tmt 12mm"
            >
              <input
                className="input-field"
                value={categoryHint}
                onChange={(e) => setCategoryHint(e.target.value)}
                aria-label="Search categories by product name"
              />
            </FormField>

            {suggestions.length > 0 && categoryHint.length > 2 ? (
              <div className="md:col-span-2 flex flex-wrap gap-2 p-3 rounded-lg bg-rebar-50/50 border border-rebar-100">
                <span className="text-xs font-semibold text-graphite-700 w-full">Suggested categories — click to fill dropdowns:</span>
                {suggestions.map((s) => (
                  <button
                    key={s.category.id}
                    type="button"
                    onClick={() => applySuggestion(s.category)}
                    className="text-xs px-2.5 py-1 rounded-full border border-rebar-200 bg-white hover:bg-rebar-100"
                  >
                    {s.parentName} → {s.category.name}
                  </button>
                ))}
              </div>
            ) : null}

            <FormField
              className="md:col-span-2"
              label="Main category"
              hint="Pehle broad type chuno — jaise Cement, Steel, Sand"
              required
            >
              <select
                required
                className="input-field"
                value={form.parent_category_id}
                onChange={(e) => {
                  const parentId = e.target.value;
                  const parent = parentCategories.find((c) => c.id === parentId);
                  setForm({
                    ...form,
                    parent_category_id: parentId,
                    category_id: '',
                    custom_category: '',
                    unit: getDefaultUnitForParentSlug(parent?.slug),
                    unit_custom: '',
                  });
                }}
              >
                <option value="">— Select main category —</option>
                {parentCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>

            {form.parent_category_id ? (
              <FormField
                className="md:col-span-2"
                label="Subcategory"
                hint="Exact product type — jaise PPC Cement, River Sand, TMT 8–12mm"
                required
              >
                <select
                  required
                  className="input-field"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">— Select subcategory —</option>
                  {subCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </FormField>
            ) : null}

            {isOthers ? (
              <FormField
                className="md:col-span-2"
                label="Product type note"
                hint="Others category ke liye — short mein likho kya bech rahe hain (buyers ko dikhega)"
                required
              >
                <input
                  required
                  className="input-field"
                  value={form.custom_category}
                  onChange={(e) => setForm({ ...form, custom_category: e.target.value })}
                  placeholder="e.g. Marble chips 20mm, Custom MS angle"
                />
              </FormField>
            ) : null}

            <StepHeader
              step={2}
              title="Aapka product — sirf aapki dukan ki listing"
              subtitle="Yeh details buyers ko aapki shop par dikhengi. Har seller ki alag price aur stock hoti hai."
            />

            <FormField
              className="md:col-span-2"
              label="Product name"
              hint="Apne shop par jo naam dikhega — brand + size + weight likhna best hai"
              required
            >
              <input
                required
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. UltraTech PPC Cement 50kg"
              />
            </FormField>

            <FormField
              className="md:col-span-2"
              label="Selling unit"
              hint="List se chuno, ya end mein Other — apna count/length metric likh sakte ho (peti, dozen, running ft, etc.)"
              required
            >
              <UnitSelectField
                parentSlug={parentSlug}
                unit={form.unit}
                unitCustom={form.unit_custom}
                onUnitChange={(unit) => setForm({ ...form, unit })}
                onUnitCustomChange={(unit_custom) => setForm({ ...form, unit_custom })}
              />
            </FormField>

            <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
            <FormField
              label="Price (₹)"
              hint="Ek selling unit ka rate — jaise ₹385/bori, ₹4500/tractor, ₹5200/quintal"
              required
            >
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="385"
              />
            </FormField>

            <FormField
              label="Stock quantity"
              hint="Kitna stock hai isi unit mein — 500 bori, 25 tractor, 40 hazaar eent, etc."
              required
            >
              <input
                required
                type="number"
                min="0"
                className="input-field"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="500"
              />
            </FormField>
            </div>

            {shopDelivery ? (
              <div className="md:col-span-2 rounded-lg border border-steel-200 bg-steel-50/50 px-4 py-3 text-sm">
                <p className="font-semibold text-ink">Delivery area</p>
                <p className="text-xs text-graphite-600 mt-1 leading-relaxed">
                  {formatDeliveryArea(shopDelivery)} — change in{' '}
                  <a href="/seller/profile" className="text-rebar-600 font-medium hover:underline">
                    Shop Studio → Storefront
                  </a>
                  . Har product ke liye alag pincode nahi chahiye.
                </p>
              </div>
            ) : null}

            <FormField
              className="md:col-span-2"
              label="Product photo (optional)"
              hint="Sachchi photo upload karein — catalog par zyada click aate hain. JPG/PNG, max ~5MB."
            >
              <input
                type="file"
                accept="image/*"
                className="text-sm w-full file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-rebar-50 file:text-rebar-800 hover:file:bg-rebar-100"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              {imageFile ? (
                <p className="text-xs text-graphite-600 mt-1">Selected: {imageFile.name}</p>
              ) : editingId ? (
                <p className="text-xs text-graphite-500 mt-1">Chhodo empty agar purani photo rakhni hai.</p>
              ) : null}
            </FormField>

            {message ? <p className="text-sm text-rebar-600 font-medium md:col-span-2">{message}</p> : null}
            <button type="submit" className="btn-primary md:col-span-2">
              {editingId ? 'Save changes' : 'List product on my shop'}
            </button>
          </form>
        ) : (
          <div className="card p-5 mb-10">
            <BulkAddGuide />
            <label className="block text-xs font-semibold uppercase text-graphite-600 mb-2">
              Paste your products (header row optional — delete before submit)
            </label>
            <textarea
              rows={10}
              className="input-field font-mono text-xs mb-3"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              spellCheck={false}
            />
            {message && <p className="text-sm text-rebar-600 font-medium mb-3">{message}</p>}
            <button type="button" onClick={handleBulk} className="btn-primary">
              Add all products
            </button>
          </div>
        )}

        <h2 className="font-display text-lg mb-4">YOUR LISTINGS ({products.length})</h2>
        <div className="space-y-2">
          {products.length === 0 && (
            <div className="card p-6 text-center text-sm text-graphite-600">No products yet. Use Bulk add tab or Buniyaad Help chat (bottom right).</div>
          )}
          {products.map((p) => (
            <div key={p.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-graphite-600">
                  {categoryName(p.category_id)}
                  {p.custom_category ? ` · ${p.custom_category}` : ''} · ₹{p.price}/{formatUnitShort(p.unit)} · Stock {p.stock}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span className={`tag ${p.active ? 'bg-signal-green text-white' : 'bg-concrete-200'}`}>
                  {p.active ? 'Live' : 'Hidden'}
                </span>
                <button type="button" onClick={() => startEdit(p)} className="btn-outline text-xs py-1.5 px-3">
                  Edit
                </button>
                <button type="button" onClick={() => toggleActive(p.id, p.active)} className="btn-outline text-xs py-1.5 px-3">
                  {p.active ? 'Hide' : 'Show'}
                </button>
                <button type="button" onClick={() => deleteProduct(p.id)} className="text-signal-red text-xs font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </SellerShell>
  );
}
