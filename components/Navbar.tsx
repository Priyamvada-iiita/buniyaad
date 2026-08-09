'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import CartBadge from '@/components/CartBadge';
import RoleBadge from '@/components/navbar/RoleBadge';
import { destinationForRole } from '@/lib/profiles';
import { useNavbarSession } from '@/lib/hooks/use-navbar-session';
import { type SessionRole } from '@/lib/session-role';
import { useIsInstalledApp } from '@/lib/use-installed-app';
import { cn } from '@/lib/cn';

type NavLink = { href: string; label: string };

function buildNavLinks(
  activeRole: SessionRole | null,
  showShopping: boolean
): NavLink[] {
  if (activeRole === 'seller') {
    return [
      { href: '/seller/profile', label: 'Shop profile' },
      { href: '/seller/dashboard', label: 'Products' },
      { href: '/seller/orders', label: 'Orders' },
      { href: '/seller/rfqs', label: 'Requirements' },
    ];
  }

  if (!showShopping) return [];

  const links: NavLink[] = [
    { href: '/catalog', label: 'Products' },
    { href: '/sellers', label: 'Sellers' },
  ];

  if (activeRole === 'buyer') {
    links.push(
      { href: '/buyer/rfq', label: 'Post Requirement' },
      { href: '/buyer/orders', label: 'My Orders' }
    );
  }

  return links;
}

export default function Navbar({
  role,
  shopping,
}: {
  role?: SessionRole;
  shopping?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isInstalledApp = useIsInstalledApp();

  const { activeRole, switchRole, isLoggedIn, logout, switchToRole } = useNavbarSession({
    role,
    shopping,
  });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const showShopping = Boolean(shopping && activeRole !== 'seller');
  const showCart = showShopping && (activeRole === 'buyer' || !isLoggedIn);
  const links = buildNavLinks(activeRole, showShopping);
  const switchLabel = switchRole === 'seller' ? 'Switch to seller' : 'Switch to buyer';

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const handleSwitchRole = (next: SessionRole) => {
    switchToRole(next);
    setMenuOpen(false);
    router.replace(destinationForRole(next));
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header-bar">
          {/* Brand */}
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <Link href="/" className="font-display text-base sm:text-lg tracking-tight text-white">
              BUNIYAAD<span className="text-rebar-500">.</span>
            </Link>
            {activeRole && isLoggedIn ? <RoleBadge role={activeRole} /> : null}
          </div>

          {/* Desktop navigation */}
          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto md:flex lg:gap-6"
            aria-label="Main"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm font-medium transition-colors hover:text-rebar-500"
              >
                {link.label}
              </Link>
            ))}
            {!isInstalledApp ? (
              <Link
                href="/download"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-rebar-500/60 bg-rebar-600/15 px-3 py-1.5 text-sm font-semibold text-rebar-300 transition-colors hover:bg-rebar-600/25 hover:text-rebar-200"
              >
                Get the app
              </Link>
            ) : null}
            {showCart ? <CartBadge /> : null}
            {switchRole ? (
              <button
                type="button"
                onClick={() => handleSwitchRole(switchRole)}
                className="shrink-0 whitespace-nowrap text-sm font-semibold text-rebar-400 hover:text-rebar-300"
              >
                {switchLabel}
              </button>
            ) : null}
          </nav>

          {/* Desktop auth */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="whitespace-nowrap text-sm font-medium hover:text-rebar-500"
              >
                Log out
              </button>
            ) : (
              <>
                <Link href="/login" className="whitespace-nowrap text-sm font-medium hover:text-rebar-500">
                  Log in
                </Link>
                <Link href="/signup?role=buyer" className="btn-primary whitespace-nowrap px-4 py-2 text-sm">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile actions */}
          <div className="ml-auto flex shrink-0 items-center gap-1 md:hidden">
            {showCart ? <CartBadge /> : null}
            <button
              type="button"
              className="rounded-md p-2 text-white hover:bg-graphite-800"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen ? (
          <nav
            className="border-t border-graphite-800 bg-graphite-800 md:hidden"
            aria-label="Mobile"
          >
            <div className="site-container flex max-h-mobile-menu flex-col gap-1 overflow-y-auto py-3">
              {activeRole && isLoggedIn ? (
                <div className="mb-1 flex items-center justify-between border-b border-graphite-700 pb-2">
                  <span className="text-xs text-graphite-400">You&apos;re in</span>
                  <RoleBadge role={activeRole} />
                </div>
              ) : null}

              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-sm font-medium transition-colors hover:text-rebar-500"
                >
                  {link.label}
                </Link>
              ))}

              {showCart ? (
                <Link
                  href="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-sm font-medium transition-colors hover:text-rebar-500"
                >
                  Cart
                </Link>
              ) : null}

              {!isInstalledApp ? (
                <Link
                  href="/download"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'mt-1 flex items-center gap-2 rounded-lg border border-rebar-500/50',
                    'bg-rebar-600/20 px-3 py-2.5 text-sm font-semibold text-rebar-300'
                  )}
                >
                  Get the app
                </Link>
              ) : null}

              {switchRole ? (
                <button
                  type="button"
                  onClick={() => handleSwitchRole(switchRole)}
                  className="py-2.5 text-left text-sm font-semibold text-rebar-400"
                >
                  {switchLabel}
                </button>
              ) : null}

              <div className="mt-2 flex flex-col gap-2 border-t border-graphite-700 pt-3">
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg border border-graphite-600 px-4 py-2.5 text-sm font-medium text-concrete-200 hover:bg-graphite-700"
                  >
                    Log out
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="w-full rounded-lg border border-graphite-600 px-4 py-2.5 text-center text-sm font-medium text-concrete-200 hover:bg-graphite-700"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup?role=buyer"
                      onClick={() => setMenuOpen(false)}
                      className="btn-primary w-full py-2.5 text-center text-sm"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        ) : null}
      </header>

      {/* Reserve space so content is not hidden under fixed header */}
      <div className="site-header-spacer" aria-hidden />
    </>
  );
}
