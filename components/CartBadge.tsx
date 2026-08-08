'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCart } from '@/lib/cart';

export default function CartBadge({ className = '' }: { className?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const items = getCart();
      setCount(items.reduce((n, i) => n + i.qty, 0));
    };
    update();
    window.addEventListener('cart-updated', update);
    return () => window.removeEventListener('cart-updated', update);
  }, []);

  return (
    <Link href="/cart" className={`relative inline-flex items-center gap-1.5 hover:text-rebar-500 ${className}`}>
      <span>Cart</span>
      {count > 0 ? (
        <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-rebar-600 text-white text-xs font-semibold flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
