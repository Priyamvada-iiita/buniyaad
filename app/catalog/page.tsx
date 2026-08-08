import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import CategoryBrowser from '@/components/CategoryBrowser';
import CatalogFilters from '@/components/CatalogFilters';
import BrowseTabs from '@/components/BrowseTabs';
import { sortProducts, type CatalogSort } from '@/lib/catalog';
import { sellerDeliversToDistrict } from '@/lib/delivery-scope';

export const dynamic = 'force-dynamic';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: {
    category?: string;
    district?: string;
    sort?: string;
    q?: string;
    verified?: string;
  };
}) {
  const supabase = createClient();
  const sort = (searchParams.sort as CatalogSort) || 'newest';
  const verifiedOnly = searchParams.verified === '1';
  const queryText = searchParams.q?.trim() || '';

  const { data: allCategories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const parentCategories = (allCategories ?? []).filter((c) => !c.parent_id);
  const childCategories = (allCategories ?? []).filter((c) => c.parent_id);

  const categoryParam = searchParams.category;
  const selected =
    allCategories?.find((c) => c.id === categoryParam) ||
    allCategories?.find((c) => c.slug === categoryParam);

  const activeParentId = selected?.parent_id ?? selected?.id;
  const activeChildId = selected?.parent_id ? selected.id : undefined;

  let categoryIds: string[] | null = null;
  if (selected) {
    if (!selected.parent_id) {
      categoryIds = childCategories
        .filter((c) => c.parent_id === selected.id)
        .map((c) => c.id);
      categoryIds.push(selected.id);
    } else {
      categoryIds = [selected.id];
    }
  }

  let dbQuery = supabase
    .from('products')
    .select(
      '*, profiles!products_seller_id_fkey(business_name, verified, district, city, delivery_scope, delivery_districts), categories(name, parent_id)'
    )
    .eq('active', true);

  if (categoryIds?.length) dbQuery = dbQuery.in('category_id', categoryIds);
  if (queryText) dbQuery = dbQuery.ilike('name', `%${queryText}%`);

  const { data: rawProducts } = await dbQuery;

  let products = rawProducts ?? [];
  if (searchParams.district) {
    products = products.filter((p: any) => sellerDeliversToDistrict(p.profiles || {}, searchParams.district!));
  }
  if (verifiedOnly) {
    products = products.filter((p: any) => p.profiles?.verified);
  }
  products = sortProducts(products as any[], sort);

  const filterExtras = {
    sort: sort !== 'newest' ? sort : undefined,
    q: queryText || undefined,
    verified: verifiedOnly ? '1' : undefined,
  };

  return (
    <>
      <Navbar shopping />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="page-title mb-1">BROWSE MATERIALS</h1>
            <p className="text-graphite-600 text-sm">
              Bina login browse karein. Cart banane ke baad checkout ke liye account chahiye.
            </p>
          </div>
        </div>

        <BrowseTabs active="products" />

        <CategoryBrowser
          parents={parentCategories}
          children={childCategories}
          activeParentId={activeParentId}
          activeChildId={activeChildId}
          district={searchParams.district}
          basePath="/catalog"
          extraParams={filterExtras}
        />

        <CatalogFilters
          category={selected?.id}
          district={searchParams.district}
          sort={sort}
          q={queryText}
          verified={verifiedOnly}
        />

        {!products.length ? (
          <div className="card p-10 text-center">
            <p className="font-semibold mb-1">No products match your filters</p>
            <p className="text-sm text-graphite-600">
              Try another district, clear filters, or pick another category.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-graphite-600 mb-4">{products.length} product(s) found</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
