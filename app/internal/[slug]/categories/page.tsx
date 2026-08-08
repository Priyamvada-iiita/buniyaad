'use client';

import AdminShell from '@/components/AdminShell';
import AdminCategoryManager from '@/components/admin/AdminCategoryManager';
import { useAdminGuard } from '@/components/admin/useAdminGuard';

export default function AdminCategoriesPage({ params }: { params: { slug: string } }) {
  const basePath = `/internal/${params.slug}`;
  const { authorised, checking, supabase } = useAdminGuard(basePath);

  if (checking || !authorised) {
    return (
      <main className="min-h-screen bg-concrete-100 flex items-center justify-center text-sm text-graphite-600">
        Verifying access…
      </main>
    );
  }

  return (
    <AdminShell basePath={basePath} active="categories">
      <main className="max-w-5xl mx-auto px-4 py-10">
        <AdminCategoryManager supabase={supabase} />
      </main>
    </AdminShell>
  );
}
