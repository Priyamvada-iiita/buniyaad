import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import SellerPublicView from '@/components/SellerPublicView';
import { fetchActiveProducts } from '@/lib/supabase/queries';
import { type SellerOffer } from '@/lib/shop-social';

export default async function SellerShopPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: seller, error: sellerError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'seller')
    .maybeSingle();

  if (sellerError) {
    console.error('[seller shop]', sellerError.message);
    throw new Error(sellerError.message);
  }
  if (!seller) notFound();

  const products = await fetchActiveProducts(supabase, { sellerId: seller.id });

  const { data: offers, error: offersError } = await supabase
    .from('seller_offers')
    .select('*')
    .eq('seller_id', seller.id)
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (offersError) console.error('[seller offers]', offersError.message);

  let ratings: { rating: number }[] = [];
  const certifiedRatings = await supabase
    .from('seller_ratings')
    .select('rating')
    .eq('seller_id', seller.id)
    .eq('certified', true);
  if (!certifiedRatings.error) {
    ratings = certifiedRatings.data ?? [];
  } else {
    const fallback = await supabase.from('seller_ratings').select('rating').eq('seller_id', seller.id);
    if (!fallback.error) ratings = fallback.data ?? [];
    else console.error('[seller ratings]', fallback.error.message);
  }

  const ratingCount = ratings.length;
  const ratingAvg =
    ratingCount > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratingCount : null;

  const offerProducts = products.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    unit: p.unit,
    image_url: p.image_url,
  }));

  const productSection = !products.length ? (
    <div className="card p-10 text-center">
      <p className="font-semibold">No products listed yet</p>
      <p className="text-sm text-graphite-600 mt-1">Check back later or browse other sellers.</p>
    </div>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p: any) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );

  return (
    <>
      <Navbar shopping />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <Link href="/sellers" className="text-sm text-rebar-600 font-medium hover:underline mb-6 inline-block">
          ← All sellers
        </Link>

        <SellerPublicView
          seller={seller}
          productCount={products.length}
          offers={(offers as SellerOffer[]) || []}
          offerProducts={offerProducts}
          ratingAvg={ratingAvg}
          ratingCount={ratingCount}
          certifiedRatings={ratingCount > 0}
          products={productSection}
        />
      </main>
    </>
  );
}
