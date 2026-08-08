import CategoryShowcaseGrid from '@/components/CategoryShowcaseGrid';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Download Buniyaad App',
  description: 'Install Buniyaad on your phone — cement, TMT, sand, tiles and more from local dealers.',
};

export default function DownloadPage() {
  const apkPath = path.join(process.cwd(), 'public', 'downloads', 'buniyaad.apk');
  const apkAvailable = existsSync(apkPath);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buniyaad.vercel.app';
  const siteHost = siteUrl.replace(/^https?:\/\//, '');

  return (
    <>
      <Navbar shopping />
      <div className="min-h-screen flex flex-col bg-concrete-50 flex-1">
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 md:py-12 w-full">
          <div className="text-center mb-8 md:mb-10">
            <img
              src="/icons/icon-192.png"
              alt="Buniyaad app icon"
              className="h-20 w-20 md:h-24 md:w-24 rounded-2xl mx-auto mb-4 shadow-md"
            />
            <h1 className="font-display text-3xl md:text-4xl mb-2">Get the Buniyaad app</h1>
            <p className="text-graphite-600 max-w-xl mx-auto">
              Bihar&apos;s building material marketplace — order cement, TMT, sand, tiles and more from your phone.
            </p>
          </div>

          <CategoryShowcaseGrid />

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <section className="bg-white rounded-2xl border border-concrete-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rebar-50 text-rebar-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </span>
                <h2 className="font-semibold text-lg">Install on phone</h2>
              </div>
              <p className="text-sm text-graphite-600 mb-4">Works on Android and iPhone — no app store needed.</p>
              <div className="space-y-3 text-sm text-graphite-600">
                <p>
                  <strong className="text-graphite-800">Android:</strong> Open {siteHost} in Chrome → menu → Add to Home screen
                </p>
                <p>
                  <strong className="text-graphite-800">iPhone:</strong> Open in Safari → Share → Add to Home Screen
                </p>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-concrete-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rebar-50 text-rebar-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </span>
                <h2 className="font-semibold text-lg">Android APK</h2>
              </div>
              {apkAvailable ? (
                <>
                  <p className="text-sm text-graphite-600 mb-4">Download and install directly on your Android phone.</p>
                  <a
                    href="/downloads/buniyaad.apk"
                    download
                    className="inline-flex items-center gap-2 rounded-xl bg-rebar-600 px-5 py-2.5 text-white text-sm font-semibold hover:bg-rebar-700 transition-colors"
                  >
                    Download APK
                  </a>
                </>
              ) : (
                <p className="text-sm text-graphite-600">
                  Android APK download coming soon. Use install from browser above for now.
                </p>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-concrete-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rebar-50 text-rebar-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                <h2 className="font-semibold text-lg">Play Store</h2>
              </div>
              <p className="text-sm text-graphite-600">Play Store download coming soon.</p>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link href="/catalog" className="btn-primary">
              Browse materials on web
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
