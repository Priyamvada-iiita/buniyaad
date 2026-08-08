'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { userIsPlatformAdmin } from '@/lib/admin';

export default function AdminLoginPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const basePath = `/internal/${params.slug}`;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && (await userIsPlatformAdmin(supabase, user.id))) {
        router.replace(basePath);
        return;
      }
      setChecking(false);
    })();
  }, [basePath, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword(form);
    if (signInError || !data.user) {
      setError(signInError?.message || 'Login failed');
      setLoading(false);
      return;
    }

    const isAdmin = await userIsPlatformAdmin(supabase, data.user.id);
    if (!isAdmin) {
      await supabase.auth.signOut();
      setError('This account is not authorised for platform administration.');
      setLoading(false);
      return;
    }

    router.push(basePath);
    router.refresh();
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center text-concrete-200 text-sm">
        Checking session…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="font-display text-white text-lg mb-1">INTERNAL CONSOLE</p>
        <p className="text-graphite-400 text-xs mb-8">Platform administrators only</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            placeholder="Admin email"
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
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-graphite-500">
          Not a public page. Buyer/seller login is on the main site.
        </p>
      </div>
    </main>
  );
}
