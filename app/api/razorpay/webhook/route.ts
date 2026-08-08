import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

// Configure this URL in Razorpay Dashboard -> Settings -> Webhooks
// Event to subscribe to: payment.captured
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const payload = JSON.parse(body);

  if (payload.event === 'payment.captured') {
    const payment = payload.payload.payment.entity;
    const internalOrderId = payment.notes?.internal_order_id;

    if (internalOrderId) {
      const supabase = createClient();
      await supabase
        .from('orders')
        .update({ status: 'paid', razorpay_payment_id: payment.id })
        .eq('id', internalOrderId)
        .eq('status', 'pending_payment'); // don't overwrite if already marked paid
    }
  }

  return NextResponse.json({ received: true });
}
