'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUserProfileRoles } from '@/lib/profiles';
import { clearActiveRole, getActiveRole, setActiveRole, type SessionRole } from '@/lib/session-role';

type UseNavbarSessionOptions = {
  role?: SessionRole;
  shopping?: boolean;
};

export function useNavbarSession({ role, shopping }: UseNavbarSessionOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const supabase = createClient();

  const [switchRole, setSwitchRole] = useState<SessionRole | null>(null);
  const [sessionRole, setSessionRole] = useState<SessionRole | null>(() => role ?? getActiveRole());
  const [loggedIn, setLoggedIn] = useState(false);

  pathnameRef.current = pathname;

  useEffect(() => {
    if (role) setActiveRole(role);
  }, [role]);

  useEffect(() => {
    if (role) setSessionRole(role);

    let cancelled = false;

    const applyRoles = async (userId: string) => {
      const stored = getActiveRole();
      if (!role && stored) setSessionRole(stored);

      const roles = (await getUserProfileRoles(supabase, userId)).filter(
        (r): r is SessionRole => r === 'buyer' || r === 'seller'
      );
      if (cancelled) return;

      const currentPath = pathnameRef.current;
      if (!role && roles.length >= 2 && !stored && shopping && currentPath !== '/choose-role') {
        router.replace(`/choose-role?next=${encodeURIComponent(currentPath || '/catalog')}`);
        return;
      }

      if (!role) {
        let active: SessionRole | null = null;
        if (stored && roles.includes(stored)) {
          active = stored;
        } else if (roles.length === 1) {
          active = roles[0];
          setActiveRole(roles[0]);
        } else if (stored) {
          active = stored;
        }
        if (active) setSessionRole(active);
      }

      const active = role ?? (stored && roles.includes(stored) ? stored : roles.length === 1 ? roles[0] : stored);
      if (active) {
        const other = active === 'buyer' ? 'seller' : 'buyer';
        setSwitchRole(roles.includes(other) ? other : null);
      } else {
        setSwitchRole(null);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setLoggedIn(Boolean(user));
      if (!user) {
        setSessionRole(null);
        setSwitchRole(null);
        return;
      }
      applyRoles(user.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(Boolean(session?.user));
      if (session?.user) applyRoles(session.user.id);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [role, shopping, supabase, router]);

  const logout = async () => {
    clearActiveRole();
    setLoggedIn(false);
    setSessionRole(null);
    setSwitchRole(null);
    await supabase.auth.signOut();
    router.replace('/');
  };

  const switchToRole = (next: SessionRole) => {
    setActiveRole(next);
    setSessionRole(next);
    setSwitchRole(next === 'buyer' ? 'seller' : 'buyer');
  };

  const activeRole = role ?? sessionRole;

  return {
    activeRole,
    switchRole,
    loggedIn,
    isLoggedIn: Boolean(activeRole || loggedIn),
    logout,
    switchToRole,
  };
}
