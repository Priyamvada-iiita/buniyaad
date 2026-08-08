'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';

const LINKS = [
  { href: '/seller/profile', label: 'Shop profile', match: '/seller/profile' },
  { href: '/seller/dashboard', label: 'Products', match: '/seller/dashboard' },
  { href: '/seller/orders', label: 'Orders', match: '/seller/orders' },
  { href: '/seller/rfqs', label: 'Quote requests', match: '/seller/rfqs' },
] as const;

export default function SellerTabNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    LINKS.forEach((link) => router.prefetch(link.href));
  }, [router]);

  const navigate = (href: string) => {
    if (pathname === href || pathname?.startsWith(`${href}/`)) return;
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <div className="border-b border-concrete-200 bg-white relative">
      {isPending ? (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-rebar-500/30 overflow-hidden">
          <div className="h-full w-1/3 bg-rebar-600 animate-[seller-tab-progress_0.9s_ease-in-out_infinite]" />
        </div>
      ) : null}
      <div className="max-w-5xl mx-auto px-4">
        <nav className="flex gap-1 overflow-x-auto py-2 -mb-px" aria-busy={isPending}>
          {LINKS.map((link) => {
            const active = pathname === link.match || pathname?.startsWith(`${link.match}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.href);
                }}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 px-4 py-2.5 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
                  active
                    ? 'border-rebar-600 text-rebar-700 bg-rebar-50/50'
                    : isPending
                    ? 'border-transparent text-graphite-400'
                    : 'border-transparent text-graphite-600 hover:text-ink hover:bg-concrete-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
