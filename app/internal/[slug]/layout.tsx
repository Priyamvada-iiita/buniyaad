import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidAdminSlug } from '@/lib/admin';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Internal console',
};

export default function InternalAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  if (!isValidAdminSlug(params.slug)) {
    notFound();
  }

  return children;
}
