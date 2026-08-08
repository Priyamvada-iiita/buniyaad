import Footer from '@/components/Footer';
import Link from 'next/link';
import { existsSync } from 'fs';
import path from 'path';

export const metadata = {
  title: 'Download Buniyaad App',
  description: 'Install Buniyaad on your phone.',
};

export default function DownloadPage() {
  const apkPath = path.join(process.cwd(), 'public', 'downloads', 'buniyaad.apk');
  const apkAvailable = existsSync(apkPath);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buniyaad.vercel.app';

  return (
    <div className="min-h-screen flex flex-col bg-concrete-50">
      <header className="border-b border-concrete-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-lg">
            BUNIYAAD<span className="text-rebar-600">.</span>
          </Link>
          <Link href="/" className="text-sm text-graphite-600 hover:text-rebar-600">
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
        <div className="text-center mb-10">
          <img
            src="/icons/icon-192.png"
            alt="Buniyaad app icon"
            className="h-24 w-24 rounded-2xl mx-auto mb-4 shadow-md"
          />
          <h1 className="font-display text-3xl mb-2">Get the Buniyaad app</h1>
          <p className="text-graphite-600">
            Building material marketplace for Bihar — on your phone.
          </p>
        </div>

        <section className="bg-white rounded-2xl border border-concrete-200 p-6 mb-6">
          <h2 className="font-semibold text-lg mb-2">Install from browser</h2>
          <p className="text-sm text-graphite-600 mb-4">
            Works on Android and iPhone. No app store needed.
          </p>

          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-rebar-700 mb-1">Android (Chrome)</p>
              <ol className="list-decimal list-inside text-graphite-600 space-y-1">
                <li>Open {siteUrl.replace(/^https?:\/\//, '')} in Chrome</li>
                <li>Tap menu (⋮) → <strong>Add to Home screen</strong> or <strong>Install app</strong></li>
                <li>Confirm — Buniyaad appears on your home screen</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-rebar-700 mb-1">iPhone (Safari)</p>
              <ol className="list-decimal list-inside text-graphite-600 space-y-1">
                <li>Open the site in Safari</li>
                <li>Tap Share → <strong>Add to Home Screen</strong></li>
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-concrete-200 p-6 mb-6">
          <h2 className="font-semibold text-lg mb-2">Android APK</h2>
          {apkAvailable ? (
            <>
              <p className="text-sm text-graphite-600 mb-4">
                Download and install directly on your Android phone.
              </p>
              <a
                href="/downloads/buniyaad.apk"
                download
                className="inline-flex items-center gap-2 rounded-xl bg-rebar-600 px-6 py-3 text-white font-semibold hover:bg-rebar-700 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download for Android
              </a>
            </>
          ) : (
            <p className="text-sm text-graphite-600">
              Android APK download coming soon. You can install from your browser using the steps above.
            </p>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-concrete-200 p-6">
          <h2 className="font-semibold text-lg mb-2">Play Store</h2>
          <p className="text-sm text-graphite-600">Play Store download coming soon.</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
