'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SellerShell from '@/components/SellerShell';
import OrderChat from '@/components/OrderChat';
import PhoneLink from '@/components/PhoneLink';
import { createClient } from '@/lib/supabase/client';
import { useSellerSession } from '@/lib/seller-session';

type Order = {
  id: string;
  items: { name: string; qty: number; price?: number }[];
  total: number;
  status: string;
  payment_method?: string;
  delivery_address: string;
  created_at: string;
  profiles: { business_name: string; contact_name?: string; phone?: string };
};

const NEXT_STATUS: Record<string, string> = {
  paid: 'confirmed',
  confirmed: 'dispatched',
  dispatched: 'delivered',
};

const STATUS_COLOR: Record<string, string> = {
  pending_payment: 'bg-concrete-200 text-graphite-700',
  paid: 'bg-steel-500 text-white',
  confirmed: 'bg-steel-500 text-white',
  dispatched: 'bg-rebar-500 text-white',
  delivered: 'bg-signal-green text-white',
  cancelled: 'bg-signal-red text-white',
};

function paymentLabel(order: Order) {
  if (order.payment_method === 'cod') return { text: 'Cash on delivery', className: 'bg-rebar-50 text-rebar-800 border border-rebar-200' };
  if (order.status === 'pending_payment') return { text: 'Awaiting online payment', className: 'bg-amber-50 text-amber-900 border border-amber-200' };
  return { text: 'Paid online', className: 'bg-steel-50 text-steel-800 border border-steel-200' };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function SellerOrdersPage() {
  const supabase = createClient();
  const { sellerProfileId, ready } = useSellerSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    if (!sellerProfileId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('orders')
      .select('*, profiles!orders_buyer_id_fkey(business_name, contact_name, phone)')
      .eq('seller_id', sellerProfileId)
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, sellerProfileId]);

  const advance = async (id: string, current: string) => {
    const next = NEXT_STATUS[current];
    if (!next) return;
    await supabase.from('orders').update({ status: next }).eq('id', id);
    load();
  };

  return (
    <SellerShell
      title="ORDERS"
      subtitle="Every placed order — online, COD, or awaiting payment. Chat with buyers and update delivery status."
    >
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="card h-32 bg-concrete-50" />
          <div className="card h-32 bg-concrete-50" />
        </div>
      ) : !orders.length ? (
        <div className="card p-10 text-center space-y-3">
          <p className="font-semibold">No orders yet</p>
          <p className="text-sm text-graphite-600">
            Jab bhi buyer order place karega (online ya COD), yahan dikhega — payment status ke saath.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Link href="/seller/dashboard" className="btn-primary text-sm">
              Add products
            </Link>
            <Link href="/seller/profile" className="btn-outline text-sm">
              Complete shop profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const pay = paymentLabel(o);
            return (
              <div key={o.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-sm">{o.profiles?.business_name || 'Buyer'}</p>
                    {o.profiles?.phone ? (
                      <p className="text-xs text-graphite-600 mt-0.5">
                        <PhoneLink phone={o.profiles.phone} className="text-xs text-rebar-600 font-semibold hover:underline" />
                        <span className="text-graphite-500 font-normal ml-1">— tap to call</span>
                      </p>
                    ) : null}
                    <p className="text-xs text-graphite-500 mt-1">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <span className={`tag ${STATUS_COLOR[o.status] || 'bg-concrete-200'}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                    <span className={`tag ${pay.className}`}>{pay.text}</span>
                  </div>
                </div>
                <ul className="text-sm text-graphite-600 mb-2 space-y-0.5">
                  {o.items.map((i, idx) => (
                    <li key={idx}>
                      {i.qty} × {i.name}
                      {i.price != null ? ` @ ₹${i.price}` : ''}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-graphite-600 mb-3">
                  <span className="font-semibold">Deliver to:</span> {o.delivery_address}
                </p>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="font-mono font-semibold text-sm">₹{o.total}</p>
                  {NEXT_STATUS[o.status] ? (
                    <button
                      type="button"
                      onClick={() => advance(o.id, o.status)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Mark as {NEXT_STATUS[o.status]}
                    </button>
                  ) : o.status === 'delivered' ? (
                    <span className="text-xs text-signal-green font-semibold">Completed ✓</span>
                  ) : o.status === 'pending_payment' ? (
                    <span className="text-xs text-graphite-500">Waiting for buyer payment</span>
                  ) : null}
                </div>
                {o.status !== 'cancelled' && o.status !== 'pending_payment' ? (
                  <OrderChat orderId={o.id} role="seller" />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </SellerShell>
  );
}
