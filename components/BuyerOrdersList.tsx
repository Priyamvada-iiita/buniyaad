'use client';

import OrderChat from '@/components/OrderChat';
import PhoneLink from '@/components/PhoneLink';
import RateSellerForm from '@/components/RateSellerForm';

const PLACED_STATUSES = new Set(['paid', 'confirmed', 'dispatched', 'delivered']);

const STATUS_COLOR: Record<string, string> = {
  pending_payment: 'bg-concrete-200 text-graphite-700',
  paid: 'bg-steel-500 text-white',
  confirmed: 'bg-steel-500 text-white',
  dispatched: 'bg-rebar-500 text-white',
  delivered: 'bg-signal-green text-white',
  cancelled: 'bg-signal-red text-white',
};

type OrderRow = {
  id: string;
  seller_id: string;
  items: { name: string; qty: number; price?: number }[];
  total: number;
  status: string;
  payment_method?: string;
  profiles: { business_name: string };
};

export default function BuyerOrdersList({ orders }: { orders: OrderRow[] }) {
  if (!orders.length) {
    return (
      <div className="card p-10 text-center">
        <p className="font-semibold">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="card p-5">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <p className="font-semibold text-sm">{o.profiles?.business_name}</p>
            <div className="flex gap-2">
              {o.payment_method === 'cod' ? (
                <span className="tag bg-rebar-50 text-rebar-800 border border-rebar-200 text-xs">COD</span>
              ) : null}
              <span className={`tag ${STATUS_COLOR[o.status] || 'bg-concrete-200'}`}>
                {o.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <ul className="text-sm text-graphite-600 mb-2">
            {o.items.map((i, idx) => (
              <li key={idx}>
                {i.qty} × {i.name}
                {i.price != null ? ` @ ₹${i.price}` : ''}
              </li>
            ))}
          </ul>
          <p className="font-mono font-semibold text-sm">Total ₹{o.total}</p>
          {PLACED_STATUSES.has(o.status) ? (
            <OrderChat orderId={o.id} role="buyer" />
          ) : null}
          {o.status === 'delivered' ? (
            <RateSellerForm
              sellerId={o.seller_id}
              sellerName={o.profiles?.business_name || 'Seller'}
              orderId={o.id}
              certified
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
