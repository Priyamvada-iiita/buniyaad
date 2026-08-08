import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroCarousel from '@/components/HeroCarousel';

type BilingualButtonProps = {
  href: string;
  primary: string;
  secondary: string;
  variant: 'primary' | 'secondary' | 'outline';
};

function BilingualButton({ href, primary, secondary, variant }: BilingualButtonProps) {
  const cls =
    variant === 'primary'
      ? 'btn-bilingual-primary'
      : variant === 'secondary'
      ? 'btn-bilingual-secondary'
      : 'btn-bilingual-outline';

  return (
    <Link href={href} className={cls}>
      <span className="bl-en">{primary}</span>
      <span className="bl-hi">{secondary}</span>
    </Link>
  );
}

const STEPS = [
  { step: '1', title: 'Browse free', desc: 'See cement, TMT, sand, and more — no login needed.' },
  { step: '2', title: 'Add to cart', desc: 'Pick what you need. You will need an account at checkout.' },
  { step: '3', title: 'Order & pay', desc: 'Sign in, pay by UPI or card, and track your order.' },
];

export default function Home() {
  return (
    <>
      <Navbar shopping />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-graphite-800 bg-ink text-concrete-50">
          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%),linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%)] bg-[length:24px_24px] bg-[position:0_0,12px_12px]" />
          <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="tag bg-rebar-600 text-white mb-5">Bihar · Pincode-matched supply</p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-6">
                BUILDING MATERIAL, ORDERED DIRECT.
              </h1>
              <p className="text-concrete-200 text-lg mb-8 max-w-md leading-relaxed">
                Buniyaad connects thekedar, builders, tender contractors, and ghar owners
                with verified local cement dealers and material shops across Bihar.
              </p>
              <div className="flex flex-wrap gap-3">
                <BilingualButton
                  href="/catalog"
                  variant="primary"
                  primary="Browse catalog"
                  secondary="Pehle dekho, login baad mein"
                />
                <BilingualButton
                  href="/signup?role=buyer"
                  variant="outline"
                  primary="Buyer signup"
                  secondary="Material kharidna hai"
                />
                <BilingualButton
                  href="/signup?role=seller"
                  variant="outline"
                  primary="Seller signup"
                  secondary="Dukan / dealer hoon"
                />
              </div>
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-concrete-300">
                <span>✓ Verified sellers</span>
                <span>✓ Online payment</span>
                <span>✓ Order tracking</span>
              </div>
            </div>

            <HeroCarousel />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <p className="section-label">How it works</p>
          <h2 className="page-title mb-10">THREE SIMPLE STEPS</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="card p-6 relative">
                <span className="absolute top-4 right-4 font-display text-4xl text-concrete-200">{s.step}</span>
                <h3 className="font-semibold text-lg mb-2 pr-10">{s.title}</h3>
                <p className="text-graphite-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border-y border-concrete-200">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
            <p className="section-label">Ordering options</p>
            <h2 className="page-title mb-10">THREE WAYS TO ORDER</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card p-6 md:p-8 border-l-4 border-l-steel-500">
                <p className="tag bg-steel-500 text-white mb-4">Products</p>
                <h3 className="font-semibold text-xl mb-2">Browse by material</h3>
                <p className="text-graphite-600 text-sm leading-relaxed mb-4">
                  Filter by category — cement, TMT, sand — and add to your cart.
                </p>
                <Link href="/catalog" className="text-sm font-semibold text-steel-600 hover:text-rebar-600 transition-colors">
                  Browse products →
                </Link>
              </div>
              <div className="card p-6 md:p-8 border-l-4 border-l-rebar-500">
                <p className="tag bg-rebar-500 text-white mb-4">Sellers</p>
                <h3 className="font-semibold text-xl mb-2">Browse by shop</h3>
                <p className="text-graphite-600 text-sm leading-relaxed mb-4">
                  Find verified dealers near you and order from their shop.
                </p>
                <Link href="/sellers" className="text-sm font-semibold text-rebar-600 hover:text-rebar-700 transition-colors">
                  Browse sellers →
                </Link>
              </div>
              <div className="card p-6 md:p-8 border-l-4 border-l-rebar-600">
                <p className="tag bg-rebar-600 text-white mb-4">RFQ</p>
                <h3 className="font-semibold text-xl mb-2">Get quoted</h3>
                <p className="text-graphite-600 text-sm leading-relaxed mb-4">
                  Post quantity and specs, receive competing quotes from local sellers, accept the best one and pay.
                </p>
                <Link href="/buyer/rfq" className="text-sm font-semibold text-rebar-600 hover:text-rebar-700 transition-colors">
                  Post requirement →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="font-display text-2xl md:text-3xl mb-4">READY TO START?</h2>
          <p className="text-graphite-600 mb-8 max-w-md mx-auto">
            Free signup. No commission during alpha. Pehle 10 sellers ko free listing.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <BilingualButton
              href="/signup?role=buyer"
              variant="primary"
              primary="Join as buyer"
              secondary="Material kharidna hai"
            />
            <BilingualButton
              href="/signup?role=seller"
              variant="secondary"
              primary="Join as seller"
              secondary="Material bechna hai"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
