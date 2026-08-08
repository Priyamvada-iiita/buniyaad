'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="page-title mb-2">Something went wrong</h1>
      <p className="text-sm text-graphite-600 mb-4 leading-relaxed">
        Page load fail ho gaya. Try again — agar baar-baar aaye toh dev server restart karein.
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
