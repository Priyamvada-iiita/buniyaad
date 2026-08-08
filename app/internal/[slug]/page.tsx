'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import { createClient } from '@/lib/supabase/client';
import { userIsPlatformAdmin } from '@/lib/admin';
import { sellerTypeLabel } from '@/lib/profile-types';

export default function InternalAdminPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const basePath = `/internal/${params.slug}`;

  const [authorised, setAuthorised] = useState(false);
  const [sellers, setSellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);

  const load = async () => {
    const { data: s } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'seller')
      .order('created_at', { ascending: false });
    setSellers(s || []);
    const { data: o } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setOrders(o || []);
    const { data: r } = await supabase
      .from('rfqs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setRfqs(r || []);
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !(await userIsPlatformAdmin(supabase, user.id))) {
        router.replace(`${basePath}/login`);
        return;
      }
      setAuthorised(true);
      load();
    })();
  }, [basePath, router, supabase]);

  const toggleVerified = async (id: string, verified: boolean) => {
    const { error } = await supabase.from('profiles').update({ verified: !verified }).eq('id', id);
    if (error) return;
    load();
  };

  if (!authorised) {
    return (
      <main className="min-h-screen bg-concrete-100 flex items-center justify-center text-sm text-graphite-600">
        Verifying access…
      </main>
    );
  }

  const gmv = orders.filter((o) => o.status !== 'pending_payment').reduce((s, o) => s + Number(o.total), 0);

  return (
    <AdminShell basePath={basePath} active="dashboard">
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-display text-2xl mb-2">PLATFORM ADMIN</h1>
        <p className="text-sm text-graphite-600 mb-6">Verify sellers, monitor orders and requirements.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="card p-5">
            <p className="text-xs text-graphite-600">Sellers</p>
            <p className="font-mono text-2xl font-semibold">{sellers.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-graphite-600">Paid orders</p>
            <p className="font-mono text-2xl font-semibold">
              {orders.filter((o) => o.status !== 'pending_payment').length}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-graphite-600">GMV</p>
            <p className="font-mono text-2xl font-semibold">₹{gmv}</p>
          </div>
        </div>

        <h2 className="font-display text-lg mb-3">SELLERS</h2>
        <div className="space-y-2 mb-10">
          {sellers.map((s) => (
            <div key={s.id} className="card p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">{s.business_name}</p>
                <p className="text-xs text-graphite-600">
                  {sellerTypeLabel(s.account_type || 'building_shop')}
                  {s.account_type === 'other' && s.account_type_description
                    ? ` — ${s.account_type_description}`
                    : ''}
                  {' · '}
                  {s.district || '—'} · {s.phone || '—'} · Pin {s.pincode || '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleVerified(s.id, s.verified)}
                className={`tag shrink-0 ${s.verified ? 'bg-signal-green text-white' : 'bg-concrete-200'}`}
              >
                {s.verified ? 'Verified' : 'Mark verified'}
              </button>
            </div>
          ))}
        </div>

        <h2 className="font-display text-lg mb-3">RECENT ORDERS</h2>
        <div className="space-y-2 mb-10">
          {orders.map((o) => (
            <div key={o.id} className="card p-4 flex items-center justify-between text-sm gap-3">
              <span className="font-mono text-xs text-graphite-600">{o.id.slice(0, 8)}</span>
              <span className="tag bg-concrete-200">{o.status}</span>
              <span className="font-mono">₹{o.total}</span>
            </div>
          ))}
        </div>

        <h2 className="font-display text-lg mb-3">RECENT RFQs</h2>
        <div className="space-y-2">
          {rfqs.map((r) => (
            <div key={r.id} className="card p-4 flex items-center justify-between text-sm gap-3">
              <span>{r.description}</span>
              <span className="tag bg-concrete-200 shrink-0">{r.status}</span>
            </div>
          ))}
        </div>
      </main>
    </AdminShell>
  );
}
