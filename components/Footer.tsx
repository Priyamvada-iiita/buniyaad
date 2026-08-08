import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-concrete-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8">
        <div>
          <p className="font-display text-lg mb-2">
            BUNIYAAD<span className="text-rebar-600">.</span>
          </p>
          <p className="text-sm text-graphite-600 leading-relaxed">
            Bihar ka building material marketplace. Cement, TMT, sand — seedha local dealer se.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-graphite-600 mb-3">Buyers</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/signup?role=buyer" className="hover:text-rebar-600 transition-colors">Create account</Link>
            <Link href="/buyer/catalog" className="hover:text-rebar-600 transition-colors">Browse catalog</Link>
            <Link href="/download" className="hover:text-rebar-600 transition-colors">Get the app</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-graphite-600 mb-3">Sellers</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/signup?role=seller" className="hover:text-rebar-600 transition-colors">List your shop</Link>
            <Link href="/seller/dashboard" className="hover:text-rebar-600 transition-colors">Seller dashboard</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-concrete-200 py-4 text-center text-xs text-graphite-600">
        © {new Date().getFullYear()} Buniyaad. Made for Bihar builders.
      </div>
    </footer>
  );
}
