import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import SellerPublicView from '@/components/SellerPublicView';
import { parseProductIds, type SellerOffer } from '@/lib/shop-social';

export default async function SellerShopPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: seller } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'seller')
    .maybeSingle();

  if (!seller) notFound();

  const [{ data: products }, { data: offers }, { data: ratings }] = await Promise.all([
    supabase
      .from('products')
      .select('*, profiles!products_seller_id_fkey(business_name, verified), categories(name, parent_id)')
      .eq('seller_id', seller.id)
      .eq('active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('seller_offers')
      .select('*')
      .eq('seller_id', seller.id)
      .eq('active', true)
      .order('sort_order', { ascending: true }),
    supabase.from('seller_ratings').select('rating').eq('seller_id', seller.id).eq('certified', true),
  ]);

  const ratingCount = ratings?.length ?? 0;
  const ratingAvg =
    ratingCount > 0
      ? (ratings!.reduce((s, r) => s + r.rating, 0) / ratingCount)
      : null;

  const offerProducts = (products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    unit: p.unit,
    image_url: p.image_url,
  }));

  const productSection = !products?.length ? (
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
          productCount={products?.length ?? 0}
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
