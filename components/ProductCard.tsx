'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { addToCart } from '@/lib/cart';
import { formatUnitShort } from '@/lib/product-units';
import { formatDeliveryArea } from '@/lib/delivery-scope';
import { sellerShopHref } from '@/lib/sellers';
import { getActiveRole } from '@/lib/session-role';
import { createClient } from '@/lib/supabase/client';

type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  image_url: string | null;
  seller_id: string;
  profiles: {
    business_name: string;
    verified: boolean;
    district?: string | null;
    city?: string | null;
    delivery_scope?: string | null;
    delivery_districts?: string[] | null;
  } | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [canAddToCart, setCanAddToCart] = useState(true);

  useEffect(() => {
    const role = getActiveRole();
    if (role === 'seller') {
      setCanAddToCart(false);
      return;
    }
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setCanAddToCart(true);
        return;
      }
      setCanAddToCart(getActiveRole() !== 'seller');
    })();
  }, []);

  const handleAdd = () => {
    if (!canAddToCart) return;
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      qty: 1,
      seller_id: product.seller_id,
      seller_name: product.profiles?.business_name || 'Seller',
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-concrete-100 flex items-center justify-center">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-mono text-xs text-concrete-300">NO IMAGE</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="font-semibold text-sm leading-tight">{product.name}</p>
        <p className="text-xs text-graphite-600">
          <Link
            href={sellerShopHref(product.seller_id)}
            className="hover:text-rebar-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {product.profiles?.business_name}
          </Link>
          {product.profiles?.verified && <span className="text-signal-green ml-1">✓ verified</span>}
        </p>
        <p className="text-xs text-graphite-600">
          {product.profiles ? formatDeliveryArea(product.profiles) : 'Delivery area on shop'} · Stock {product.stock}
        </p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <p className="font-mono font-semibold">
            ₹{product.price}
            <span className="text-xs text-graphite-600">/{formatUnitShort(product.unit)}</span>
          </p>
          {canAddToCart ? (
            <button
              onClick={handleAdd}
              disabled={product.stock < 1}
              className="btn-primary text-xs py-1.5 px-3 min-w-[4.5rem]"
            >
              {product.stock < 1 ? 'Out of stock' : added ? 'Added ✓' : 'Add'}
            </button>
          ) : (
            <span className="text-[10px] font-medium text-graphite-500 text-right leading-tight">
              Seller mode —<br />
              cart off
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
