'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminShell({
  children,
  basePath,
  active,
}: {
  children: React.ReactNode;
  basePath: string;
  active?: 'dashboard' | 'categories';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const current =
    active || (pathname?.endsWith('/categories') ? 'categories' : 'dashboard');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`${basePath}/login`);
    router.refresh();
  };

  const nav = [
    { id: 'dashboard' as const, href: basePath, label: 'Dashboard' },
    { id: 'categories' as const, href: `${basePath}/categories`, label: 'Categories' },
  ];

  return (
    <div className="min-h-screen bg-concrete-100">
      <header className="border-b border-graphite-800 bg-ink text-concrete-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <p className="font-display text-sm tracking-tight text-white shrink-0">
            BUNIYAAD<span className="text-rebar-500">.</span>
            <span className="text-graphite-400 font-sans text-xs ml-2">Internal console</span>
          </p>
          <nav className="hidden sm:flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  current === item.id
                    ? 'bg-rebar-600 text-white font-semibold'
                    : 'text-concrete-200 hover:text-white hover:bg-graphite-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium hover:text-rebar-500 shrink-0"
          >
            Log out
          </button>
        </div>
        <nav className="sm:hidden border-t border-graphite-800 px-4 py-2 flex gap-2">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`text-xs px-3 py-1.5 rounded-md ${
                current === item.id ? 'bg-rebar-600 text-white font-semibold' : 'text-concrete-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
