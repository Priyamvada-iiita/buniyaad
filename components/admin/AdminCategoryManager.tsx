'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { slugify } from '@/lib/slugify';
import type { DbCategory } from '@/lib/category-match';

type CategoryForm = {
  name: string;
  slug: string;
  parent_id: string;
};

const emptyForm = (): CategoryForm => ({ name: '', slug: '', parent_id: '' });

function friendlyDbError(message: string) {
  if (message.includes('categories_name_key')) return 'A category with this name already exists.';
  if (message.includes('categories_slug_key')) return 'A category with this slug already exists.';
  if (message.includes('foreign key')) return 'Cannot delete — products or subcategories still use this category.';
  return message;
}

export default function AdminCategoryManager({ supabase }: { supabase: SupabaseClient }) {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showAddParent, setShowAddParent] = useState(false);
  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  const parents = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);
  const childrenByParent = useMemo(() => {
    const map = new Map<string, DbCategory[]>();
    for (const c of categories) {
      if (!c.parent_id) continue;
      const list = map.get(c.parent_id) ?? [];
      list.push(c);
      map.set(c.parent_id, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name));
    return map;
  }, [categories]);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: cats, error: catError }, { data: products }, { data: rfqs }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('category_id'),
      supabase.from('rfqs').select('category_id'),
    ]);

    if (catError) {
      setError(catError.message);
      setLoading(false);
      return;
    }

    setCategories(cats || []);

    const counts: Record<string, number> = {};
    for (const p of products || []) {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    }
    for (const r of rfqs || []) {
      counts[r.category_id] = (counts[r.category_id] || 0) + 1;
    }
    setUsage(counts);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowAddParent(false);
    setAddChildParentId(null);
    setError('');
  };

  const openAddParent = () => {
    resetForm();
    setShowAddParent(true);
  };

  const openAddChild = (parentId: string) => {
    resetForm();
    setAddChildParentId(parentId);
    setForm({ name: '', slug: '', parent_id: parentId });
  };

  const openEdit = (cat: DbCategory) => {
    setEditingId(cat.id);
    setShowAddParent(false);
    setAddChildParentId(null);
    setForm({
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id || '',
    });
    setError('');
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : slugify(name),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const name = form.name.trim();
    const slug = slugify(form.slug || form.name);
    const parent_id = form.parent_id || null;

    if (!name) {
      setError('Name is required.');
      setSaving(false);
      return;
    }

    if (editingId) {
      const current = categories.find((c) => c.id === editingId);
      if (current && !current.parent_id && parent_id) {
        setError('Top-level categories cannot be moved under a parent.');
        setSaving(false);
        return;
      }
      if (current?.parent_id && !parent_id) {
        setError('Subcategories must keep a parent. Create a new top-level category instead.');
        setSaving(false);
        return;
      }
    }

    const payload = { name, slug, parent_id };

    const { error: saveError } = editingId
      ? await supabase.from('categories').update(payload).eq('id', editingId)
      : await supabase.from('categories').insert(payload);

    if (saveError) {
      setError(friendlyDbError(saveError.message));
      setSaving(false);
      return;
    }

    setMessage(editingId ? 'Category updated.' : 'Category added.');
    resetForm();
    await load();
    setSaving(false);
  };

  const handleDelete = async (cat: DbCategory) => {
    const childCount = childrenByParent.get(cat.id)?.length ?? 0;
    const used = usage[cat.id] || 0;

    if (childCount > 0) {
      setError(`"${cat.name}" has ${childCount} subcategory(ies). Delete those first.`);
      return;
    }
    if (used > 0) {
      setError(`"${cat.name}" is used by ${used} product(s) or RFQ(s). Reassign them before deleting.`);
      return;
    }

    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;

    setError('');
    setMessage('');
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', cat.id);
    if (deleteError) {
      setError(friendlyDbError(deleteError.message));
      return;
    }
    setMessage(`Deleted "${cat.name}".`);
    if (editingId === cat.id) resetForm();
    await load();
  };

  const showForm = showAddParent || addChildParentId || editingId;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl mb-1">CATEGORIES</h1>
          <p className="text-sm text-graphite-600">
            Add, rename, or remove product categories. Changes appear in catalog and seller listings.
          </p>
        </div>
        <button type="button" onClick={openAddParent} className="btn-primary text-sm shrink-0">
          + Add parent category
        </button>
      </div>

      {message && <p className="mb-4 text-sm text-signal-green font-medium">{message}</p>}
      {error && <p className="mb-4 text-sm text-signal-red">{error}</p>}

      {showForm && (
        <form onSubmit={handleSave} className="card p-5 mb-6 space-y-4">
          <p className="font-semibold text-sm">
            {editingId ? 'Edit category' : addChildParentId ? 'New subcategory' : 'New parent category'}
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-graphite-600 mb-1.5">Name</label>
              <input
                required
                className="input-field"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Cement & Admixtures"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-graphite-600 mb-1.5">Slug</label>
              <input
                required
                className="input-field font-mono text-sm"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                placeholder="cement"
              />
              <p className="text-xs text-graphite-500 mt-1">Used in URLs and bulk upload. Lowercase, hyphens only.</p>
            </div>
          </div>

          {addChildParentId && (
            <p className="text-sm text-graphite-600">
              Parent: <strong>{parents.find((p) => p.id === addChildParentId)?.name}</strong>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add category'}
            </button>
            <button type="button" onClick={resetForm} className="btn-outline text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-graphite-600">Loading categories…</p>
      ) : !parents.length ? (
        <div className="card p-8 text-center text-sm text-graphite-600">
          No categories yet. Add a parent category to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {parents.map((parent) => {
            const subs = childrenByParent.get(parent.id) ?? [];
            return (
              <div key={parent.id} className="card overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-concrete-50 border-b border-concrete-200">
                  <div>
                    <p className="font-semibold">{parent.name}</p>
                    <p className="text-xs font-mono text-graphite-600">{parent.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openAddChild(parent.id)} className="text-xs font-semibold text-steel-600 hover:text-rebar-600">
                      + Subcategory
                    </button>
                    <button type="button" onClick={() => openEdit(parent)} className="text-xs font-semibold text-graphite-700 hover:text-ink">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(parent)} className="text-xs font-semibold text-signal-red hover:underline">
                      Delete
                    </button>
                  </div>
                </div>

                {subs.length > 0 ? (
                  <ul className="divide-y divide-concrete-100">
                    {subs.map((child) => (
                      <li key={child.id} className="px-4 py-3 pl-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{child.name}</p>
                          <p className="text-xs font-mono text-graphite-600">
                            {child.slug}
                            {(usage[child.id] || 0) > 0 ? ` · ${usage[child.id]} in use` : ''}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => openEdit(child)} className="text-xs font-semibold text-graphite-700 hover:text-ink">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(child)} className="text-xs font-semibold text-signal-red hover:underline">
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-3 pl-8 text-xs text-graphite-500">No subcategories yet.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
