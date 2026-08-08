import type { SupabaseClient } from '@supabase/supabase-js';

const PRODUCT_SELECT_WITH_DELIVERY =
  '*, profiles!products_seller_id_fkey(business_name, verified, district, city, delivery_scope, delivery_districts), categories(name, parent_id)';

const PRODUCT_SELECT_BASIC =
  '*, profiles!products_seller_id_fkey(business_name, verified, district, city), categories(name, parent_id)';

function isMissingColumnError(message?: string) {
  if (!message) return false;
  return (
    message.includes('delivery_scope') ||
    message.includes('delivery_districts') ||
    message.includes('does not exist')
  );
}

export async function fetchActiveProducts(
  supabase: SupabaseClient,
  options?: {
    sellerId?: string;
    categoryIds?: string[] | null;
    queryText?: string;
  }
) {
  const run = (select: string) => {
    let q = supabase.from('products').select(select).eq('active', true);
    if (options?.sellerId) q = q.eq('seller_id', options.sellerId);
    if (options?.categoryIds?.length) q = q.in('category_id', options.categoryIds);
    if (options?.queryText) q = q.ilike('name', `%${options.queryText}%`);
    if (options?.sellerId) q = q.order('created_at', { ascending: false });
    return q;
  };

  let { data, error } = await run(PRODUCT_SELECT_WITH_DELIVERY);
  if (error && isMissingColumnError(error.message)) {
    ({ data, error } = await run(PRODUCT_SELECT_BASIC));
  }

  if (error) {
    console.error('[fetchActiveProducts]', error.message);
    return [];
  }

  return data ?? [];
}

export async function fetchSellerRatings(supabase: SupabaseClient) {
  const certified = await supabase
    .from('seller_ratings')
    .select('seller_id, rating')
    .eq('certified', true);

  if (!certified.error) return certified.data ?? [];

  const fallback = await supabase.from('seller_ratings').select('seller_id, rating');
  if (fallback.error) {
    console.error('[fetchSellerRatings]', fallback.error.message);
    return [];
  }
  return fallback.data ?? [];
}
