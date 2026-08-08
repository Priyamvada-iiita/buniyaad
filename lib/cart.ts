export type CartItem = {
  product_id: string;
  name: string;
  price: number;
  unit: string;
  qty: number;
  seller_id: string;
  seller_name: string;
};

const KEY = 'buniyaad_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((i) => i.product_id === item.product_id);
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function removeFromCart(product_id: string) {
  saveCart(getCart().filter((i) => i.product_id !== product_id));
}

export function updateQty(product_id: string, qty: number) {
  const cart = getCart().map((i) => (i.product_id === product_id ? { ...i, qty } : i));
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

// NOTE: MVP simplification — assumes all cart items are from ONE seller
// (checkout creates one order per seller). If cart has mixed sellers,
// checkout page groups and creates multiple orders.
export function groupBySeller(items: CartItem[]) {
  const groups: Record<string, CartItem[]> = {};
  for (const item of items) {
    if (!groups[item.seller_id]) groups[item.seller_id] = [];
    groups[item.seller_id].push(item);
  }
  return groups;
}
