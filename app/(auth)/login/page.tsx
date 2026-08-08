'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  destinationForRole,
  getUserProfileRoles,
} from '@/lib/profiles';
import { setActiveRole } from '@/lib/session-role';
import { safeNextPath } from '@/lib/redirect';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickRole, setPickRole] = useState<('buyer' | 'seller')[] | null>(null);

  const requestedRoleParam = params.get('role');
  const requestedRole =
    requestedRoleParam === 'buyer' || requestedRoleParam === 'seller'
      ? requestedRoleParam
      : null;

  const nextPath = safeNextPath(params.get('next'));

  const finishLogin = (role: 'buyer' | 'seller') => {
    setActiveRole(role);
    router.push(nextPath || destinationForRole(role));
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPickRole(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword(form);
    if (signInError || !data.user) {
      setError(signInError?.message || 'Login failed');
      setLoading(false);
      return;
    }

    const roles = (await getUserProfileRoles(supabase, data.user.id)).filter(
      (r) => r === 'buyer' || r === 'seller'
    );
    if (!roles.length) {
      const allRoles = await getUserProfileRoles(supabase, data.user.id);
      setError(
        allRoles.includes('admin')
          ? 'Platform admin accounts use the internal console, not public login.'
          : 'No profile found. Please sign up first.'
      );
      setLoading(false);
      return;
    }

    if (roles.length === 1) {
      finishLogin(roles[0]);
      return;
    }

    // Both buyer + seller — always ask which mode to use
    setPickRole(roles.filter((r) => r === 'buyer' || r === 'seller') as ('buyer' | 'seller')[]);
    setLoading(false);
  };

  const roleLabel = (role: 'buyer' | 'seller') =>
    role === 'seller' ? 'Seller — Material bechna' : 'Buyer — Material kharidna';

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-md mx-auto px-4 py-10 md:py-14 w-full">
        <h1 className="page-title mb-1">LOG IN</h1>
        <p className="text-graphite-600 text-sm mb-8">
          Welcome back to Buniyaad.
          {requestedRole ? (
            <span className="block mt-2 text-xs text-steel-600">
              Logging in as {requestedRole === 'seller' ? 'seller' : 'buyer'}.
            </span>
          ) : null}
        </p>

        {pickRole ? (
          <div className="space-y-3">
            <p className="text-sm text-graphite-600 mb-4">
              Is email par buyer aur seller dono accounts hain. Kaunsa open karna hai?
            </p>
            {pickRole.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => finishLogin(role)}
                className="w-full text-left p-4 rounded-md border border-concrete-300 hover:border-rebar-600 hover:bg-rebar-50 transition-colors"
              >
                <span className="font-semibold block">{roleLabel(role)}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPickRole(null)}
              className="text-sm text-graphite-600 hover:text-rebar-600"
            >
              ← Back
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              type="email"
              placeholder="Email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              required
              type="password"
              placeholder="Password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            {error && <p className="text-signal-red text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-graphite-600">
          No account?{' '}
          <Link
            href={requestedRole ? `/signup?role=${requestedRole}` : '/signup'}
            className="font-semibold text-rebar-600 hover:text-rebar-700"
          >
            Sign up free
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-graphite-600">
          Buyer aur seller alag register karna hai?{' '}
          <Link href="/signup?role=buyer" className="text-rebar-600 font-medium">Buyer signup</Link>
          {' · '}
          <Link href="/signup?role=seller" className="text-rebar-600 font-medium">Seller signup</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
