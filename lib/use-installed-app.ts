'use client';

import { useEffect, useState } from 'react';

/** True when opened as PWA, home-screen app, or Capacitor APK shell. */
export function useIsInstalledApp() {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;

    const check = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      nav.standalone === true ||
      cap?.isNativePlatform?.() === true;

    setIsApp(check());

    const mq = window.matchMedia('(display-mode: standalone)');
    const onChange = () => setIsApp(check());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isApp;
}
