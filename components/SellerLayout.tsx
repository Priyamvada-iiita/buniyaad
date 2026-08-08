'use client';

import Navbar from '@/components/Navbar';
import SellerTabNav from '@/components/SellerTabNav';
import { SellerSessionProvider } from '@/lib/seller-session';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SellerSessionProvider>
      <Navbar role="seller" />
      <SellerTabNav />
      {children}
    </SellerSessionProvider>
  );
}
