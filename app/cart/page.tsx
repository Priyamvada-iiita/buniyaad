'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';
import { getProfileIdForRole } from '@/lib/profiles';
import { getCart, removeFromCart, updateQty, groupBySeller, CartItem } from '@/lib/cart';
import { formatUnitShort } from '@/lib/product-units';

type SellerPay = {
  accepts_cod: boolean;
  accepts_online: boolean;
  payout_setup_complete: boolean;
};

type PayMethod = 'online' | 'cod';

export default function CartPage() {
  const router = useRouter();
  const supabase = createClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('');
  const [paying, setPaying] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [sellerPay, setSellerPay] = useState<Record<string, SellerPay>>({});
  const [payMethod, setPayMethod] = useState<Record<string, PayMethod>>({});

  useEffect(() => {
    setCart(getCart());
    const handler = () => setCart(getCart());
    window.addEventListener('cart-updated', handler);
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(Boolean(user)));
    return () => window.removeEventListener('cart-updated', handler);
  }, [supabase]);

  useEffect(() => {
    const sellerIds = [...new Set(cart.map((i) => i.seller_id))];
    if (!sellerIds.length) return;

    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, accepts_cod, accepts_online, payout_setup_complete')
        .in('id', sellerIds);
      const map: Record<string, SellerPay> = {};
      const methods: Record<string, PayMethod> = {};
      for (const row of data || []) {
        const onlineOk = row.accepts_online !== false && row.payout_setup_complete === true;
        map[row.id] = {
          accepts_cod: row.accepts_cod !== false,
          accepts_online: onlineOk,
          payout_setup_complete: row.payout_setup_complete === true,
        };
        methods[row.id] = onlineOk ? 'online' : row.accepts_cod !== false ? 'cod' : 'online';
      }
      setSellerPay(map);
      setPayMethod(methods);
    })();
  }, [cart, supabase]);

  const groups = groupBySeller(cart);

  const handleCheckout = async (sellerId: string, items: CartItem[]) => {
    if (!address.trim()) {
      setMessage('Delivery address daalein pehle.');
      return;
    }
    setPaying(sellerId);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?role=buyer&next=${encodeURIComponent('/cart')}`);
      return;
    }

    const buyerProfileId = await getProfileIdForRole(supabase, user.id, 'buyer');
    if (!buyerProfileId) {
      router.push(`/signup?role=buyer&next=${encodeURIComponent('/cart')}`);
      return;
    }

    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const method = payMethod[sellerId] || 'online';
    const seller = sellerPay[sellerId];

    if (method === 'cod') {
      if (!seller?.accepts_cod) {
        setMessage('This seller does not accept cash on delivery.');
        setPaying(null);
        return;
      }
      const res = await fetch('/api/orders/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          buyer_id: buyerProfileId,
          seller_id: sellerId,
          items,
          address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'COD order failed.');
        setPaying(null);
        return;
      }
      removeSellerItemsFromCart(sellerId);
      setMessage('Order placed — pay cash on delivery!');
      router.push('/buyer/orders');
      return;
    }

    if (seller && !seller.accepts_online) {
      setMessage(
        seller.payout_setup_complete === false
          ? 'This seller has not set up online settlement yet — use COD if available.'
          : 'This seller only accepts COD — switch payment method.'
      );
      setPaying(null);
      return;
    }

    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: total,
        buyer_id: buyerProfileId,
        seller_id: sellerId,
        items,
        address,
      }),
    });
    const orderData = await res.json();

    if (!res.ok) {
      setMessage(orderData.error || 'Could not start payment.');
      setPaying(null);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: 'INR',
      name: 'Buniyaad',
      description: `Order for ${items.length} item(s)`,
      order_id: orderData.razorpay_order_id,
      handler: async function (response: any) {
        await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderData.internal_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        removeSellerItemsFromCart(sellerId);
        setMessage('Payment successful — order placed!');
        router.push('/buyer/orders');
      },
      prefill: { email: user.email },
      theme: { color: '#C1440E' },
    };

    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
    setPaying(null);
  };

  const removeSellerItemsFromCart = (sellerId: string) => {
    const remaining = getCart().filter((i) => i.seller_id !== sellerId);
    localStorage.setItem('buniyaad_cart', JSON.stringify(remaining));
    setCart(remaining);
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar shopping />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="page-title mb-1">YOUR CART</h1>
        <p className="text-graphite-600 text-sm mb-6">Review karein, payment chunein, order place karein.</p>

        {cart.length === 0 ? (
          <div className="card p-10 text-center space-y-4">
            <p className="font-semibold">Cart khali hai</p>
            <Link href="/catalog" className="btn-primary inline-block text-sm">
              Browse catalog
            </Link>
          </div>
        ) : (
          <>
            <input
              placeholder="Delivery address (site / ghar ka pata)"
              className="input-field mb-6"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            {message && <p className="text-sm mb-4 text-rebar-600 font-medium">{message}</p>}

            {loggedIn === false ? (
              <div className="card p-4 mb-6 bg-rebar-50 border-rebar-200 text-sm text-graphite-700">
                Checkout ke liye{' '}
                <Link href={`/login?role=buyer&next=${encodeURIComponent('/cart')}`} className="font-semibold text-rebar-600">
                  log in
                </Link>{' '}
                ya{' '}
                <Link href={`/signup?role=buyer&next=${encodeURIComponent('/cart')}`} className="font-semibold text-rebar-600">
                  buyer account banayein
                </Link>
                .
              </div>
            ) : null}

            {Object.entries(groups).map(([sellerId, items]) => {
              const sp = sellerPay[sellerId];
              const method = payMethod[sellerId] || 'online';
              return (
                <div key={sellerId} className="card p-5 mb-4">
                  <p className="text-xs font-mono uppercase text-graphite-600 mb-3">{items[0].seller_name}</p>
                  {items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center justify-between py-2 border-b border-concrete-100 last:border-0 gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-graphite-600">₹{item.price}/{formatUnitShort(item.unit)}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => {
                            updateQty(item.product_id, Number(e.target.value));
                            setCart(getCart());
                          }}
                          className="w-16 border border-concrete-300 rounded-sm px-2 py-1 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            removeFromCart(item.product_id);
                            setCart(getCart());
                          }}
                          className="text-signal-red text-xs font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-semibold uppercase text-graphite-600">Payment method</p>
                    <div className="flex flex-wrap gap-2">
                      {sp?.accepts_online !== false ? (
                        <button
                          type="button"
                          onClick={() => setPayMethod({ ...payMethod, [sellerId]: 'online' })}
                          className={`text-sm px-4 py-2 rounded-lg border ${
                            method === 'online' ? 'border-rebar-600 bg-rebar-50 text-rebar-800 font-semibold' : 'border-concrete-200'
                          }`}
                        >
                          💳 Pay online
                        </button>
                      ) : null}
                      {sp?.accepts_cod !== false ? (
                        <button
                          type="button"
                          onClick={() => setPayMethod({ ...payMethod, [sellerId]: 'cod' })}
                          className={`text-sm px-4 py-2 rounded-lg border ${
                            method === 'cod' ? 'border-rebar-600 bg-rebar-50 text-rebar-800 font-semibold' : 'border-concrete-200'
                          }`}
                        >
                          💵 Cash on delivery
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 gap-3">
                    <p className="font-mono font-semibold">
                      Total ₹{items.reduce((s, i) => s + i.price * i.qty, 0)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCheckout(sellerId, items)}
                      disabled={paying === sellerId}
                      className="btn-primary"
                    >
                      {paying === sellerId
                        ? 'Placing…'
                        : loggedIn === false
                        ? 'Login to checkout'
                        : method === 'cod'
                        ? 'Place COD order'
                        : 'Pay & place order'}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>
    </>
  );
}
