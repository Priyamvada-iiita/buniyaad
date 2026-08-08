import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="page-title mb-2">Page not found</h1>
      <p className="text-sm text-graphite-600 mb-6">Yeh page exist nahi karta.</p>
      <Link href="/" className="btn-primary text-sm">
        Back to home
      </Link>
    </main>
  );
}
