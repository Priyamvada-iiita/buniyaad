'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useTransition, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { destinationForRole, getUserProfileRoles } from '@/lib/profiles';
import { setActiveRole } from '@/lib/session-role';
import { cn } from '@/lib/cn';

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
  const [canSwitchToBuyer, setCanSwitchToBuyer] = useState(false);

  useEffect(() => {
    LINKS.forEach((link) => router.prefetch(link.href));
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const roles = await getUserProfileRoles(supabase, session.user.id);
      setCanSwitchToBuyer(roles.includes('buyer'));
    });
  }, []);

  const navigate = (href: string) => {
    if (pathname === href || pathname?.startsWith(`${href}/`)) return;
    startTransition(() => {
      router.push(href);
    });
  };

  const switchToBuyer = () => {
    setActiveRole('buyer');
    router.replace(destinationForRole('buyer'));
  };

  return (
    <div className="site-subnav relative">
      {isPending ? (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-rebar-500/30">
          <div className="h-full w-1/3 animate-seller-tab-progress bg-rebar-600" />
        </div>
      ) : null}
      <div className="site-subnav-inner">
        <nav className="-mb-px flex items-center gap-1 overflow-x-auto py-2" aria-busy={isPending}>
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
                className={cn(
                  'shrink-0 rounded-t-md border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-rebar-600 bg-rebar-50/50 text-rebar-700'
                    : isPending
                    ? 'border-transparent text-graphite-400'
                    : 'border-transparent text-graphite-600 hover:bg-concrete-50 hover:text-ink'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {canSwitchToBuyer ? (
            <button
              type="button"
              onClick={switchToBuyer}
              className="ml-auto shrink-0 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-semibold text-rebar-600 transition-colors hover:bg-rebar-50 hover:text-rebar-700"
            >
              Switch to buyer
            </button>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
