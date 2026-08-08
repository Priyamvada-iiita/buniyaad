'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { userIsPlatformAdmin } from '@/lib/admin';

export function useAdminGuard(basePath: string) {
  const router = useRouter();
  const supabase = createClient();
  const [authorised, setAuthorised] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !(await userIsPlatformAdmin(supabase, user.id))) {
        router.replace(`${basePath}/login`);
        return;
      }
      setAuthorised(true);
      setChecking(false);
    })();
  }, [basePath, router, supabase]);

  return { authorised, checking, supabase };
}
