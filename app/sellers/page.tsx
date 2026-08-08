import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import BrowseTabs from '@/components/BrowseTabs';
import SellerCard from '@/components/SellerCard';
import SellerStrip from '@/components/SellerStrip';
import SellerFilters from '@/components/SellerFilters';
import { sortSellers, type SellerSort } from '@/lib/sellers';
import { sellerDeliversToDistrict } from '@/lib/delivery-scope';
import { fetchSellerRatings } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

export default async function SellersPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    district?: string;
    delivers_to?: string;
    type?: string;
    verified?: string;
    sort?: string;
  };
}) {
  const supabase = createClient();
  const sort = (searchParams.sort as SellerSort) || 'name';
  const verifiedOnly = searchParams.verified === '1';
  const queryText = searchParams.q?.trim().toLowerCase() || '';

  let sellerQuery = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'seller')
    .order('business_name');

  if (searchParams.district) sellerQuery = sellerQuery.eq('district', searchParams.district);
  if (searchParams.type) sellerQuery = sellerQuery.eq('account_type', searchParams.type);
  if (verifiedOnly) sellerQuery = sellerQuery.eq('verified', true);

  const { data: rawSellers, error: sellersError } = await sellerQuery;
  if (sellersError) {
    console.error('[sellers]', sellersError.message);
    throw new Error(sellersError.message);
  }

  const { data: activeProducts, error: productsError } = await supabase
    .from('products')
    .select('seller_id')
    .eq('active', true);
  if (productsError) console.error('[sellers products]', productsError.message);

  const allRatings = await fetchSellerRatings(supabase);

  const countBySeller = new Map<string, number>();
  activeProducts?.forEach((p) => {
    countBySeller.set(p.seller_id, (countBySeller.get(p.seller_id) ?? 0) + 1);
  });

  const ratingBySeller = new Map<string, { sum: number; count: number }>();
  allRatings?.forEach((r) => {
    const cur = ratingBySeller.get(r.seller_id) || { sum: 0, count: 0 };
    cur.sum += r.rating;
    cur.count += 1;
    ratingBySeller.set(r.seller_id, cur);
  });

  let sellers = (rawSellers ?? []).map((s) => {
    const r = ratingBySeller.get(s.id);
    return {
      ...s,
      product_count: countBySeller.get(s.id) ?? 0,
      rating_count: r?.count ?? 0,
      rating_avg: r && r.count > 0 ? r.sum / r.count : null,
    };
  });

  if (queryText) {
    sellers = sellers.filter((s) => {
      const haystack = [
        s.business_name,
        s.city,
        s.district,
        s.account_type_description,
        s.address,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(queryText);
    });
  }

  if (searchParams.delivers_to) {
    sellers = sellers.filter((s) => sellerDeliversToDistrict(s, searchParams.delivers_to!));
  }

  sellers = sortSellers(sellers, sort);

  return (
    <>
      <Navbar shopping />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="page-title mb-1">BROWSE SELLERS</h1>
          <p className="text-graphite-600 text-sm">
            Explore local shops and their products. No login needed to browse.
          </p>
        </div>

        <BrowseTabs active="sellers" />

        {sellers.length > 0 ? <SellerStrip sellers={sellers} /> : null}

        <SellerFilters
          q={searchParams.q}
          district={searchParams.district}
          delivers_to={searchParams.delivers_to}
          type={searchParams.type}
          verified={verifiedOnly}
          sort={sort}
        />

        {!sellers.length ? (
          <div className="card p-10 text-center">
            <p className="font-semibold mb-1">No sellers match your filters</p>
            <p className="text-sm text-graphite-600">
              Try clearing filters or district Patna / Gaya.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-graphite-600 mb-4">{sellers.length} seller(s) found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellers.map((s) => (
                <SellerCard key={s.id} seller={s} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
