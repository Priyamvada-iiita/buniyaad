# Buniyaad mobile app — setup & build guide

This doc is the **source of truth** for how Buniyaad works on phones: PWA install, Android APK build, and what each file does. **Do not delete** `MOBILE.md`, `capacitor.config.ts`, or the Capacitor npm packages — they are required to rebuild the APK.

---

## Two ways users get the app

| Method | Cost | How |
|--------|------|-----|
| **PWA** | Free | Chrome/Safari → Add to Home screen |
| **Android APK** | Free | Download from `/download` on the site |

Play Store is optional later ($25 one-time Google fee). For MVP we ship a direct APK.

---

## How it works (architecture)

```
Website (Next.js on Vercel)
        │
        ├── PWA ── manifest + icons → user installs from browser
        │
        └── APK ── Capacitor WebView loads live Vercel URL
                    (no embedded Next.js build inside the APK)
```

**Key idea:** The APK is a thin native shell. It opens your **live website** in a WebView. When you push code to GitHub and Vercel redeploys, APK users see the update immediately — no new APK build needed for normal site changes.

---

## Files you must keep (do not delete)

| File / folder | Why |
|---------------|-----|
| `capacitor.config.ts` | Tells Capacitor the app ID, name, and **which URL** the APK loads. Without it, `npx cap sync` fails and you cannot rebuild the APK. |
| `MOBILE.md` | This guide — setup steps for you or anyone cloning the repo. |
| `@capacitor/*` in `package.json` | Capacitor runtime + CLI + Android platform package. |
| `public/manifest.webmanifest` | PWA install metadata. |
| `public/icons/` | PWA / APK launcher icons. |
| `public/downloads/buniyaad.apk` | Pre-built APK users download from `/download`. |
| `app/download/page.tsx` | Download / install instructions page. |
| `lib/use-installed-app.ts` | Hides “Get the app” when user is already in PWA or APK. |

**Why was `capacitor.config.ts` almost deleted?** During a disk-space cleanup, it was briefly removed by mistake. It was restored immediately. **Never remove it** — it is small (~20 lines) and essential for any APK rebuild.

**`android/` folder:** Generated locally by `npx cap add android`. It is in `.gitignore` (large, machine-specific). You regenerate it on any PC that builds the APK. The **config** that matters is committed: `capacitor.config.ts`.

---

## What’s on the website (user-facing)

- **Navbar → “Get the app”** — links to `/download` (hidden when already in PWA/APK via `useIsInstalledApp()`).
- **`/download`** — install steps for Android/iPhone + APK download button when `buniyaad.apk` exists.
- **Homepage category grid** — visual tiles linking to `/catalog?category=…` (separate from download page).
- **Footer** — also hides “Get the app” inside the installed app shell.

---

## Environment variable

Set in `.env.local` (and in Vercel project settings):

```env
NEXT_PUBLIC_APP_URL=https://buniyaad-livid.vercel.app
```

Used by:
- `capacitor.config.ts` → `server.url` for the APK WebView
- Any absolute links that need the production domain

Default fallback in config: `https://buniyaad-livid.vercel.app` (do **not** use `buniyaad.vercel.app` — that domain is Buniyaad Academy, a different project).

---

## PWA (no APK build)

After deploy to Vercel (HTTPS required):

1. **Android Chrome** — menu → **Install app** / **Add to Home screen**
2. **iPhone Safari** — Share → **Add to Home Screen**

Already configured: `public/manifest.webmanifest`, icons, `theme-color` in layout.

---

## Build Android APK (Windows + Android Studio Quail 3)

### Prerequisites

- Node.js (already in project)
- [Android Studio](https://developer.android.com/studio) — **Quail 3 | 2026.1.3** (or similar)
- JDK bundled with Android Studio (Quail ships **Java 25**)

**First-time Android Studio setup:**

1. Complete the setup wizard.
2. **More Actions → SDK Manager** → install **Android SDK Platform 35** and **Build-Tools**.
3. Accept SDK licenses when prompted.

**Java 25 + Gradle:** Quail uses JDK 25. The local `android/` project uses **Gradle 8.14.4** (`android/gradle/wrapper/gradle-wrapper.properties`). If you see `Unsupported class file major version 69`, ensure that Gradle version is present after `npx cap add android` (re-copy from a backup or bump the wrapper URL to `gradle-8.14.4-all.zip`).

### One-time: add Android platform

```powershell
cd C:\Users\divya\Downloads\buniyaad-mvp\buniyaad

npm install

# First time only (creates android/ — gitignored)
npx cap add android
```

### Every APK rebuild

```powershell
# 1. Ensure .env.local has NEXT_PUBLIC_APP_URL

# 2. Sync config into android/
npx cap sync android

# 3a. Build from command line (no Android Studio UI)
cd android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat assembleDebug

# 3b. Or open in Android Studio
cd ..
npx cap open android
# Then: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### Copy APK to the website

```powershell
cd C:\Users\divya\Downloads\buniyaad-mvp\buniyaad
New-Item -ItemType Directory -Force -Path public\downloads
Copy-Item android\app\build\outputs\apk\debug\app-debug.apk public\downloads\buniyaad.apk
```

Then commit and push so Vercel serves the new APK from `/downloads/buniyaad.apk`.

**When do you need a new APK?**

| Change | New APK? |
|--------|----------|
| Website content, UI, API routes | No — live URL updates automatically |
| App icon, app name, `appId` | Yes |
| Capacitor / Android permissions | Yes |
| Play Store release | Yes (signed AAB) |

### Release APK (optional, for wider distribution)

Android Studio → **Build → Generate Signed Bundle / APK** → create keystore (store safely) → release APK → copy to `public/downloads/buniyaad.apk`.

---

## `capacitor.config.ts` explained

```ts
appId: 'in.buniyaad.app'     // Android package name
appName: 'Buniyaad'          // Launcher label
webDir: 'public'             // Local static assets (icons, etc.)
server.url: NEXT_PUBLIC_APP_URL  // Live site the WebView opens
```

- **`server.url`** — APK users always hit your Vercel deployment. This is why the APK stays small (~20 MB) and always up to date.
- **`webDir: 'public'`** — Capacitor still needs a folder for native assets; we use `public/` (manifest, icons). The main UI is not bundled — it loads from the URL.
- To ship a fully offline app later, you’d switch to a static export in `webDir` — not needed for MVP.

---

## Play Store (optional, later)

Same `android/` project after Play Console signup ($25):

1. Build signed **AAB** (Android App Bundle).
2. Upload to Internal testing first.
3. Add privacy policy URL.

---

## npm scripts

```bash
npm run cap:sync    # npx cap sync android
npm run cap:open    # open Android Studio
npm run cap:android # npx cap add android && sync (first time on a new machine)
```

---

## Local disk space (safe to delete)

These are **not** in git or are regenerable — OK to delete locally to save space:

| Folder | Size (approx) | Notes |
|--------|---------------|-------|
| `.next/` | ~200+ MB | Dev/build cache — `npm run dev` recreates |
| `node_modules/` | ~300 MB | `npm install` recreates |
| `android/app/build/` | varies | Build output — `gradlew assembleDebug` recreates |

**Do not delete** `capacitor.config.ts`, `MOBILE.md`, `public/downloads/buniyaad.apk`, or Capacitor packages if you want to rebuild the APK.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| APK blank / white screen | Check `NEXT_PUBLIC_APP_URL` matches live Vercel URL; site must be HTTPS |
| `Unsupported class file major version 69` | Use Gradle 8.14.4+ in `android/gradle/wrapper/gradle-wrapper.properties` |
| `gradlew` / JAVA_HOME errors | Set `JAVA_HOME` to Android Studio `jbr` folder (see build steps) |
| “App not installed” on phone | Allow install from unknown sources; use debug APK first |
| PWA install not offered | HTTPS, Chrome, visit site twice |
| `npx cap sync` fails | Ensure `capacitor.config.ts` exists; run `npm install` |
| New clone, no `android/` | Run `npx cap add android` then `npx cap sync android` |
| Homepage layout broken locally | Delete `.next` and `node_modules/.cache`, restart single `npm run dev` |

---

## Deploy checklist (website + APK)

1. Push code to GitHub → Vercel auto-deploys.
2. Confirm `NEXT_PUBLIC_APP_URL` in Vercel env matches deployment URL.
3. Website users get updates immediately (browser + existing APK).
4. Rebuild APK only when changing native shell (icon, app ID, Capacitor config).
