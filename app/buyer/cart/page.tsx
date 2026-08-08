import { redirect } from 'next/navigation';

export default function BuyerCartRedirect() {
  redirect('/cart');
}
