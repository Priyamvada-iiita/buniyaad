'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import BilingualLabel from '@/components/BilingualLabel';
import CartBadge from '@/components/CartBadge';
import { destinationForRole, getUserProfileRoles } from '@/lib/profiles';
import { clearActiveRole, getActiveRole, setActiveRole, type SessionRole } from '@/lib/session-role';

export default function Navbar({
  role,
  shopping,
}: {
  role?: 'buyer' | 'seller';
  shopping?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [switchRole, setSwitchRole] = useState<SessionRole | null>(null);
  const [sessionRole, setSessionRole] = useState<SessionRole | null>(role ?? null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (role) setActiveRole(role);
  }, [role]);

  useEffect(() => {
    if (role) {
      setSessionRole(role);
      return;
    }

    const sync = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setLoggedIn(Boolean(user));
      if (!user) {
        setSessionRole(null);
        setSwitchRole(null);
        return;
      }

      const stored = getActiveRole();
      const roles = (await getUserProfileRoles(supabase, user.id)).filter(
        (r): r is SessionRole => r === 'buyer' || r === 'seller'
      );

      if (roles.length >= 2 && !stored && shopping && pathname !== '/choose-role') {
        router.replace(`/choose-role?next=${encodeURIComponent(pathname || '/catalog')}`);
        return;
      }

      if (stored && roles.includes(stored)) {
        setSessionRole(stored);
      } else if (roles.length === 1) {
        setActiveRole(roles[0]);
        setSessionRole(roles[0]);
      } else {
        setSessionRole(stored);
      }

      const active = stored && roles.includes(stored) ? stored : roles.length === 1 ? roles[0] : stored;
      if (active) {
        const other = active === 'buyer' ? 'seller' : 'buyer';
        setSwitchRole(roles.includes(other) ? other : null);
      } else {
        setSwitchRole(null);
      }
    };

    sync();
  }, [role, shopping, supabase, router, pathname]);

  const handleLogout = async () => {
    clearActiveRole();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleSwitchRole = (next: SessionRole) => {
    setActiveRole(next);
    setSessionRole(next);
    setMenuOpen(false);
    router.push(destinationForRole(next));
    router.refresh();
  };

  const activeRole = role || sessionRole;
  const showShopping = shopping && activeRole !== 'seller';
  const showCart = showShopping && (activeRole === 'buyer' || !loggedIn);

  const links =
    activeRole === 'seller'
      ? [
          { href: '/seller/profile', label: 'Shop profile' },
          { href: '/seller/dashboard', label: 'Products' },
          { href: '/seller/orders', label: 'Orders' },
          { href: '/seller/rfqs', label: 'Requirements' },
        ]
      : showShopping
      ? [
          { href: '/catalog', label: 'Products' },
          { href: '/sellers', label: 'Sellers' },
          ...(activeRole === 'buyer'
            ? [
                { href: '/buyer/rfq', label: 'Post Requirement' },
                { href: '/buyer/orders', label: 'My Orders' },
              ]
            : []),
        ]
      : [];

  const switchLabel =
    switchRole === 'seller'
      ? { primary: 'Switch to seller', secondary: 'Material bechna' }
      : { primary: 'Switch to buyer', secondary: 'Material kharidna' };

  return (
    <header className="border-b border-graphite-800 bg-ink text-concrete-50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-tight text-white shrink-0">
          BUNIYAAD<span className="text-rebar-500">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-rebar-500 transition-colors">
              {l.label}
            </Link>
          ))}
          {showCart ? <CartBadge /> : null}
          {switchRole ? (
            <button
              type="button"
              onClick={() => handleSwitchRole(switchRole)}
              className="text-rebar-400 hover:text-rebar-300 text-left"
            >
              <BilingualLabel
                primary={switchLabel.primary}
                secondary={switchLabel.secondary}
                primaryClassName="font-semibold text-sm"
                secondaryClassName="text-xs text-rebar-300/90"
              />
            </button>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {activeRole || loggedIn ? (
            <button type="button" onClick={handleLogout} className="text-sm font-medium hover:text-rebar-500">
              Log out
            </button>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline text-sm font-medium hover:text-rebar-500">
                Log in
              </Link>
              <Link href="/signup?role=buyer" className="btn-primary text-sm py-2 px-4">
                Get started
              </Link>
            </>
          )}

          {(links.length > 0 || showCart) && (
            <button
              type="button"
              className="md:hidden p-2 -mr-2 text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {menuOpen && (links.length > 0 || showCart) && (
        <nav className="md:hidden border-t border-graphite-800 bg-graphite-800 px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-sm font-medium hover:text-rebar-500 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {showCart ? (
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-sm font-medium hover:text-rebar-500 transition-colors"
            >
              Cart
            </Link>
          ) : null}
          {switchRole ? (
            <button
              type="button"
              onClick={() => handleSwitchRole(switchRole)}
              className="py-2.5 text-sm font-medium text-rebar-400 text-left"
            >
              {switchLabel.primary} / {switchLabel.secondary}
            </button>
          ) : null}
        </nav>
      )}
    </header>
  );
}
