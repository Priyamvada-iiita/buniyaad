import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import BuyerOrdersList from '@/components/BuyerOrdersList';
import { getProfileIdForRole } from '@/lib/profiles';

export const dynamic = 'force-dynamic';

export default async function BuyerOrdersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const buyerProfileId = user ? await getProfileIdForRole(supabase, user.id, 'buyer') : null;

  const { data: orders } = buyerProfileId
    ? await supabase
        .from('orders')
        .select('*, profiles!orders_seller_id_fkey(business_name)')
        .eq('buyer_id', buyerProfileId)
        .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <>
      <Navbar role="buyer" />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="page-title mb-6">MY ORDERS</h1>
        <BuyerOrdersList orders={(orders as any[]) || []} />
      </main>
    </>
  );
}
