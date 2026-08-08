'use client';

import Link from 'next/link';

export default function SellersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="page-title mb-2">Could not load sellers</h1>
      <p className="text-sm text-graphite-600 mb-4 leading-relaxed">
        Usually this means Supabase patches are missing on your live database. Run the SQL patches in{' '}
        <code className="text-xs bg-concrete-100 px-1 rounded">supabase/patches/</code> in Supabase SQL Editor,
        then redeploy.
      </p>
      <p className="text-xs text-graphite-500 mb-6 font-mono break-all">{error.message}</p>
      <div className="flex gap-3 justify-center">
        <button type="button" onClick={reset} className="btn-primary text-sm">
          Try again
        </button>
        <Link href="/" className="btn-outline text-sm">
          Home
        </Link>
      </div>
    </main>
  );
}
