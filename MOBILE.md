# Buniyaad mobile app — PWA & Android APK

Two ways for users to get the app on their phone:

1. **PWA (Progressive Web App)** — free, no store. Users tap "Add to Home screen" from Chrome/Safari.
2. **Android APK** — free direct download. Wraps your live Vercel site in a native shell (Capacitor).

Play Store is optional later ($25 one-time Google fee).

---

## What’s already set up

- `public/manifest.webmanifest` — app name, icons, theme
- `public/icons/` — 192×192 and 512×512 icons
- `/download` page — install instructions + APK link
- Install banner on the site (mobile)
- `capacitor.config.ts` — points Android app at your production URL

Set your live URL in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## PWA (no build needed)

After deploying to Vercel:

1. Open the site on Android Chrome → menu → **Install app** / **Add to Home screen**
2. On iPhone Safari → Share → **Add to Home Screen**

The site is already a PWA once deployed with the manifest.

---

## Build Android APK (one-time on your PC)

### Prerequisites

- [Node.js](https://nodejs.org/) (already have)
- [Android Studio](https://developer.android.com/studio) — you have **Quail 3 | 2026.1.3**
- JDK 17 (bundled with Android Studio)

**First launch in Android Studio Quail:**
1. Open Android Studio → complete setup wizard
2. **More Actions → SDK Manager** → install **Android SDK** and **Android SDK Build-Tools**
3. Accept licenses when prompted

### Steps

```bash
# 1. Install Capacitor (if not done)
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Set production URL
# In .env.local: NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# 3. Add Android platform (first time only)
npx cap add android

# 4. Sync web assets + config into android/
npx cap sync android

# 5. Open in Android Studio
npx cap open android
```

In **Android Studio**:

1. Wait for Gradle sync to finish
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. APK path: `android/app/build/outputs/apk/debug/app-debug.apk`

### Share the APK

Copy the built APK to the site so users can download it:

```bash
mkdir -p public/downloads
cp android/app/build/outputs/apk/debug/app-debug.apk public/downloads/buniyaad.apk
```

Commit `public/downloads/buniyaad.apk` (or host on GitHub Releases / Google Drive and link from `/download`).

For a **release** APK (smaller, signed for distribution):

1. Android Studio → **Build → Generate Signed Bundle / APK**
2. Create a keystore (keep it safe — needed for Play Store updates)
3. Build release APK and copy to `public/downloads/buniyaad.apk`

---

## Play Store (optional)

Same `android/` project. After $25 [Google Play Console](https://play.google.com/console) signup:

1. Build **signed AAB** (Android App Bundle) in Android Studio
2. Upload to Play Console → Internal testing first
3. Add privacy policy URL (your site `/` or a simple page)

---

## How the APK works

Capacitor loads your **live Vercel URL** inside a WebView (`server.url` in `capacitor.config.ts`). That means:

- No need to embed the whole Next.js build in the APK
- Updates to the website appear in the app immediately
- Requires internet (same as using the browser)

To ship a fully offline app later, you’d change `webDir` to a static export — not needed for MVP.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| APK shows blank screen | Check `NEXT_PUBLIC_APP_URL` matches your live Vercel URL |
| “App not installed” on phone | Enable unknown sources; try debug APK first |
| PWA install not offered | Use HTTPS; open in Chrome; visit site twice |
| Capacitor sync fails | Run `npm run build` first if you add local web assets |

---

## npm scripts

```bash
npm run cap:sync    # sync config to android/
npm run cap:open    # open Android Studio
npm run cap:android # add platform + sync (first time)
```
