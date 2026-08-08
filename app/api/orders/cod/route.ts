import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { amount, buyer_id, seller_id, items, address } = await req.json();

    if (!amount || !buyer_id || !seller_id || !items?.length || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient();

    const { data: seller } = await supabase
      .from('profiles')
      .select('accepts_cod')
      .eq('id', seller_id)
      .eq('role', 'seller')
      .maybeSingle();

    if (!seller?.accepts_cod) {
      return NextResponse.json({ error: 'This seller does not accept cash on delivery' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id,
        seller_id,
        items,
        total: amount,
        delivery_address: address,
        payment_method: 'cod',
        status: 'confirmed',
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || 'Could not create order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, internal_order_id: order.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
