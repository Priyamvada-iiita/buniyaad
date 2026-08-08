'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { destinationForRole, getUserProfileRoles } from '@/lib/profiles';
import { setActiveRole } from '@/lib/session-role';
import { safeNextPath } from '@/lib/redirect';

export default function ChooseRoleForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const [roles, setRoles] = useState<('buyer' | 'seller')[]>([]);
  const [loading, setLoading] = useState(true);

  const nextPath = safeNextPath(params.get('next'));

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const available = (await getUserProfileRoles(supabase, user.id)).filter(
        (r): r is 'buyer' | 'seller' => r === 'buyer' || r === 'seller'
      );

      if (available.length === 0) {
        router.replace('/login');
        return;
      }

      if (available.length === 1) {
        setActiveRole(available[0]);
        router.replace(nextPath || destinationForRole(available[0]));
        return;
      }

      setRoles(available);
      setLoading(false);
    })();
  }, [nextPath, router, supabase]);

  const pick = (role: 'buyer' | 'seller') => {
    setActiveRole(role);
    router.push(nextPath || destinationForRole(role));
    router.refresh();
  };

  const roleLabel = (role: 'buyer' | 'seller') =>
    role === 'seller'
      ? { title: 'Seller mode', sub: 'Products list karo, orders dekho, quotes bhejo' }
      : { title: 'Buyer mode', sub: 'Catalog browse karo, cart banao, order karo' };

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-md mx-auto px-4 py-10 md:py-14 w-full">
        <h1 className="page-title mb-1">CHOOSE MODE</h1>
        <p className="text-graphite-600 text-sm mb-8">
          Ek time par sirf <strong>buyer</strong> ya <strong>seller</strong> mode. Baad mein switch kar sakte ho.
        </p>

        {loading ? (
          <p className="text-sm text-graphite-600">Loading accounts…</p>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => pick(role)}
                className="w-full text-left p-5 rounded-lg border border-concrete-300 hover:border-rebar-600 hover:bg-rebar-50 transition-colors"
              >
                <span className="font-semibold block text-lg">{roleLabel(role).title}</span>
                <span className="text-sm text-graphite-600">{roleLabel(role).sub}</span>
              </button>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-graphite-600">
          <Link href="/" className="text-rebar-600 font-medium hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
