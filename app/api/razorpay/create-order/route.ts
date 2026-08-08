import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
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
      .select('accepts_online, payout_setup_complete')
      .eq('id', seller_id)
      .eq('role', 'seller')
      .maybeSingle();

    if (seller && seller.accepts_online === false) {
      return NextResponse.json({ error: 'This seller only accepts cash on delivery' }, { status: 400 });
    }

    if (seller && seller.accepts_online !== false && seller.payout_setup_complete !== true) {
      return NextResponse.json(
        { error: 'This seller has not completed payout setup for online payments. Try COD or another seller.' },
        { status: 400 }
      );
    }

    // 1. Create our internal order row (pending_payment)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id,
        seller_id,
        items,
        total: amount,
        delivery_address: address,
        payment_method: 'online',
        status: 'pending_payment',
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || 'Could not create order' }, { status: 500 });
    }

    // 2. Create the Razorpay order (amount in paise)
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: order.id,
      notes: { internal_order_id: order.id },
    });

    // 3. Store the razorpay order id against our order
    await supabase.from('orders').update({ razorpay_order_id: rzpOrder.id }).eq('id', order.id);

    return NextResponse.json({
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      internal_order_id: order.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
