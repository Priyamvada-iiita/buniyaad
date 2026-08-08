'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { getProfileIdForRole } from '@/lib/profiles';

type SellerSession = {
  userId: string | null;
  sellerProfileId: string | null;
  ready: boolean;
  refresh: () => Promise<void>;
};

const SellerSessionContext = createContext<SellerSession | null>(null);

let memoryCache: { userId: string; sellerProfileId: string | null } | null = null;

export function SellerSessionProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(memoryCache?.userId ?? null);
  const [sellerProfileId, setSellerProfileId] = useState<string | null>(
    memoryCache?.sellerProfileId ?? null
  );
  const [ready, setReady] = useState(Boolean(memoryCache));

  const refresh = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      memoryCache = null;
      setUserId(null);
      setSellerProfileId(null);
      setReady(true);
      return;
    }

    const profileId = await getProfileIdForRole(supabase, user.id, 'seller');
    memoryCache = { userId: user.id, sellerProfileId: profileId };
    setUserId(user.id);
    setSellerProfileId(profileId);
    setReady(true);
  }, [supabase]);

  useEffect(() => {
    if (memoryCache) {
      setReady(true);
      return;
    }
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ userId, sellerProfileId, ready, refresh }),
    [userId, sellerProfileId, ready, refresh]
  );

  return <SellerSessionContext.Provider value={value}>{children}</SellerSessionContext.Provider>;
}

export function useSellerSession() {
  const ctx = useContext(SellerSessionContext);
  if (!ctx) throw new Error('useSellerSession must be used within SellerSessionProvider');
  return ctx;
}
