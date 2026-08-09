# Deploy Buniyaad for Client Demo

Get a public URL like `https://buniyaad-livid.vercel.app` so your client can try the app on phone/laptop.

> **Do not use** `https://buniyaad.vercel.app` — that domain hosts a different project (Buniyaad Academy).

---

## Before deploying

### 1. Set up Supabase database

In **SQL Editor**, run **in order**:

1. `supabase/schema.sql` — drops old tables + creates latest schema (safe to re-run)
2. `supabase/demo_seed.sql` — optional: 6 demo sellers + 21 products

> **Note:** `schema.sql` deletes all app data (profiles, products, orders) but keeps auth logins.

This adds **6 demo sellers** and **21 products** across Bihar.

**Demo seller logins** (password for all: `Demo@1234`):

| Email | Shop |
|-------|------|
| shivam-cement@buniyaad.demo | Shivam Cement House, Patna |
| gaya-steel@buniyaad.demo | Gaya TMT & Steel Traders |
| munger-mart@buniyaad.demo | Munger Building Material Mart |
| vaishali-sand@buniyaad.demo | Vaishali Sand & Bajri Suppliers |
| muzaffarpur-tiles@buniyaad.demo | Muzaffarpur Tiles Gallery |
| bhagalpur-hardware@buniyaad.demo | Bhagalpur Hardware Hub |

### 2. Supabase auth settings

- **Authentication → Providers → Email** → turn **Confirm email OFF**
- **Authentication → URL Configuration** → add your Vercel URL after deploy (see step 4)

---

## Deploy to Vercel (free, ~15 min)

### Step 1 — Push to GitHub

```powershell
cd C:\Users\divya\Downloads\buniyaad-mvp\buniyaad
git init
git add .
git commit -m "Buniyaad MVP with demo seed"
```

Create repo at https://github.com/new (name: `buniyaad`), then:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/buniyaad.git
git push -u origin main
```

### Step 2 — Import on Vercel

1. https://vercel.com → sign up with GitHub
2. **Add New → Project** → import `buniyaad`
3. Add **Environment Variables** (same as `.env.local`):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay test secret |

4. Click **Deploy**

### Step 3 — Update Supabase URLs

After deploy, copy your Vercel URL (e.g. `https://buniyaad-abc.vercel.app`).

Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://buniyaad-abc.vercel.app`
- **Redirect URLs:** add:
  ```
  https://buniyaad-abc.vercel.app/**
  http://localhost:3000/**
  ```

### Step 4 — Send to client

Share the Vercel URL + this demo script:

```
1. Open the link on your phone
2. Browse catalog (try pincode 800020 or 823001)
3. Sign up as buyer → add to cart → pay with test card 4111 1111 1111 1111
4. Or log in as demo seller: shivam-cement@buniyaad.demo / Demo@1234
```

---

## Quick deploy without GitHub

```powershell
npx vercel login
npx vercel
```

Add env vars in Vercel dashboard → Settings → Environment Variables.

---

## What the client will see

- Mobile-friendly web app (no install)
- 12 main categories, subcategories (BuilderSmart-style)
- 6 fake verified sellers with real-looking products
- Signup with **Others** option + **skip profile for later**
- Razorpay test payments (no real money)
