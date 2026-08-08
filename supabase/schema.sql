-- ============================================================
-- BUNIYAAD MVP — FULL DATABASE SETUP
-- Run in Supabase SQL Editor (paste entire file → Run)
--
-- ⚠️  DESTRUCTIVE: drops existing app tables first, then recreates.
--     Deletes: profiles, products, orders, RFQs, quotes, categories
--     Keeps: auth.users (your login emails in Authentication)
--
-- After running:
--   1. Optional: demo_seed.sql (demo shops + products)
--   2. Re-create admin profile (see bottom of this file)
-- ============================================================

-- ── DROP (safe to re-run) ────────────────────────────────────

drop table if exists public.seller_payout_details cascade;
drop table if exists public.quotes cascade;
drop table if exists public.order_messages cascade;
drop table if exists public.seller_ratings cascade;
drop table if exists public.seller_offers cascade;
drop table if exists public.orders cascade;
drop table if exists public.rfqs cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;

drop function if exists public.is_platform_admin();

-- ── EXTENSIONS ───────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── TABLES ───────────────────────────────────────────────────

-- Profiles: one row per user per role (same email → buyer + seller)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('buyer', 'seller', 'admin')),
  account_type text,
  account_type_description text,
  contact_name text,
  business_name text,
  phone text,
  district text,
  city text,
  pincode text,
  address text,
  gstin text,
  verified boolean default false,
  profile_complete boolean default false,
  shop_description text,
  shop_cover_url text,
  shop_photo_urls jsonb default '[]'::jsonb,
  certification_url text,
  registration_doc_url text,
  aadhaar_doc_url text,
  aadhaar_status text not null default 'not_submitted'
    check (aadhaar_status in ('not_submitted', 'pending', 'verified', 'rejected')),
  map_lat numeric(10,7),
  map_lng numeric(10,7),
  google_maps_url text,
  accepts_cod boolean not null default true,
  accepts_online boolean not null default true,
  payout_setup_complete boolean not null default false,
  delivery_scope text not null default 'my_district'
    check (delivery_scope in ('all_bihar', 'my_district', 'my_city', 'custom_districts')),
  delivery_districts jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  unique (user_id, role)
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  parent_id uuid references categories(id) on delete set null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) not null,
  name text not null,
  description text,
  custom_category text,
  unit text not null default 'bag',
  price numeric(10,2) not null check (price > 0),
  stock integer not null default 0,
  image_url text,
  pincode text,
  active boolean default true,
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references profiles(id) not null,
  seller_id uuid references profiles(id) not null,
  items jsonb not null,
  total numeric(10,2) not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','paid','confirmed','dispatched','delivered','cancelled')),
  payment_method text not null default 'online' check (payment_method in ('online', 'cod')),
  delivery_address text not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz default now()
);

create table rfqs (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references profiles(id) not null,
  category_id uuid references categories(id) not null,
  description text not null,
  quantity text not null,
  pincode text not null,
  status text not null default 'open' check (status in ('open','closed','fulfilled')),
  created_at timestamptz default now()
);

create table quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid references rfqs(id) on delete cascade not null,
  seller_id uuid references profiles(id) not null,
  price numeric(10,2) not null,
  message text,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz default now(),
  unique (rfq_id, seller_id)
);

create table seller_offers (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  badge_text text,
  image_url text,
  product_ids jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create table seller_ratings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  order_id uuid references orders(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text,
  certified boolean not null default false,
  created_at timestamptz default now(),
  unique (seller_id, buyer_id)
);

create table order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  sender_profile_id uuid references profiles(id) on delete cascade not null,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz default now()
);

create table seller_payout_details (
  seller_id uuid primary key references profiles(id) on delete cascade,
  upi_id text,
  account_name text,
  bank_name text,
  account_number text,
  ifsc text,
  razorpay_linked_account_id text,
  setup_complete boolean not null default false,
  updated_at timestamptz default now()
);

-- ── RLS + ADMIN HELPER ─────────────────────────────────────────

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table rfqs enable row level security;
alter table quotes enable row level security;
alter table categories enable row level security;
alter table seller_offers enable row level security;
alter table seller_ratings enable row level security;
alter table order_messages enable row level security;
alter table seller_payout_details enable row level security;

create policy "categories_select_all" on categories for select using (true);
create policy "categories_insert_admin" on categories for insert with check (public.is_platform_admin());
create policy "categories_update_admin" on categories for update using (public.is_platform_admin());
create policy "categories_delete_admin" on categories for delete using (public.is_platform_admin());

create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = user_id or public.is_platform_admin());

create policy "products_select_active" on products for select using (
  active = true
  or seller_id in (select id from profiles where user_id = auth.uid())
  or public.is_platform_admin()
);
create policy "products_insert_own" on products for insert with check (
  seller_id in (select id from profiles where user_id = auth.uid() and role = 'seller')
);
create policy "products_update_own" on products for update using (
  seller_id in (select id from profiles where user_id = auth.uid())
);
create policy "products_delete_own" on products for delete using (
  seller_id in (select id from profiles where user_id = auth.uid())
);

create policy "orders_select_involved" on orders for select using (
  buyer_id in (select id from profiles where user_id = auth.uid())
  or seller_id in (select id from profiles where user_id = auth.uid())
  or public.is_platform_admin()
);
create policy "orders_insert_buyer" on orders for insert with check (
  buyer_id in (select id from profiles where user_id = auth.uid() and role = 'buyer')
);
create policy "orders_update_involved" on orders for update using (
  buyer_id in (select id from profiles where user_id = auth.uid())
  or seller_id in (select id from profiles where user_id = auth.uid())
);

create policy "rfqs_select_all" on rfqs for select using (true);
create policy "rfqs_insert_buyer" on rfqs for insert with check (
  buyer_id in (select id from profiles where user_id = auth.uid() and role = 'buyer')
);
create policy "rfqs_update_own" on rfqs for update using (
  buyer_id in (select id from profiles where user_id = auth.uid())
);

create policy "quotes_select_involved" on quotes for select using (
  seller_id in (select id from profiles where user_id = auth.uid())
  or rfq_id in (
    select id from rfqs
    where buyer_id in (select id from profiles where user_id = auth.uid())
  )
);
create policy "quotes_insert_seller" on quotes for insert with check (
  seller_id in (select id from profiles where user_id = auth.uid() and role = 'seller')
);
create policy "quotes_update_involved" on quotes for update using (
  seller_id in (select id from profiles where user_id = auth.uid())
  or rfq_id in (
    select id from rfqs
    where buyer_id in (select id from profiles where user_id = auth.uid())
  )
);

create policy "seller_offers_select_all" on seller_offers for select using (true);
create policy "seller_offers_insert_own" on seller_offers for insert with check (
  seller_id in (select id from profiles where user_id = auth.uid() and role = 'seller')
);
create policy "seller_offers_update_own" on seller_offers for update using (
  seller_id in (select id from profiles where user_id = auth.uid())
);
create policy "seller_offers_delete_own" on seller_offers for delete using (
  seller_id in (select id from profiles where user_id = auth.uid())
);

create policy "seller_ratings_select_all" on seller_ratings for select using (true);
create policy "seller_ratings_insert_buyer" on seller_ratings for insert with check (
  buyer_id in (select id from profiles where user_id = auth.uid() and role = 'buyer')
);
create policy "seller_ratings_update_own" on seller_ratings for update using (
  buyer_id in (select id from profiles where user_id = auth.uid())
);

create policy "order_messages_select_involved" on order_messages for select using (
  order_id in (
    select id from orders
    where buyer_id in (select id from profiles where user_id = auth.uid())
       or seller_id in (select id from profiles where user_id = auth.uid())
  )
  or public.is_platform_admin()
);
create policy "order_messages_insert_involved" on order_messages for insert with check (
  sender_profile_id in (select id from profiles where user_id = auth.uid())
  and order_id in (
    select id from orders
    where buyer_id in (select id from profiles where user_id = auth.uid())
       or seller_id in (select id from profiles where user_id = auth.uid())
  )
);

create policy "seller_payout_select_own_or_admin" on seller_payout_details for select using (
  seller_id in (select id from profiles where user_id = auth.uid() and role = 'seller')
  or public.is_platform_admin()
);
create policy "seller_payout_insert_own" on seller_payout_details for insert with check (
  seller_id in (select id from profiles where user_id = auth.uid() and role = 'seller')
);
create policy "seller_payout_update_own" on seller_payout_details for update using (
  seller_id in (select id from profiles where user_id = auth.uid() and role = 'seller')
);

-- ── CATEGORY SEED (slug-linked parents) ───────────────────────

insert into categories (name, slug, parent_id) values
  ('Cement & Admixtures', 'cement', null),
  ('Steel & TMT Bars', 'steel-tmt', null),
  ('Bricks & Blocks', 'bricks-blocks', null),
  ('Sand, Bajri & Aggregate', 'sand-aggregate', null),
  ('Tiles & Flooring', 'tiles-flooring', null),
  ('Paint & Finishes', 'paint', null),
  ('Plumbing & Pipes', 'plumbing', null),
  ('Electrical & Lighting', 'electrical', null),
  ('Hardware & Tools', 'hardware-tools', null),
  ('Doors, Windows & Ply', 'doors-windows', null),
  ('Roofing & Sheets', 'roofing', null),
  ('Others', 'others', null);

insert into categories (name, slug, parent_id) values
  ('OPC Cement (43/53 Grade)', 'cement-opc', (select id from categories where slug = 'cement')),
  ('PPC Cement', 'cement-ppc', (select id from categories where slug = 'cement')),
  ('White Cement', 'cement-white', (select id from categories where slug = 'cement')),
  ('TMT 8mm – 12mm', 'tmt-8-12', (select id from categories where slug = 'steel-tmt')),
  ('TMT 16mm – 25mm', 'tmt-16-25', (select id from categories where slug = 'steel-tmt')),
  ('Red Clay Bricks', 'red-brick', (select id from categories where slug = 'bricks-blocks')),
  ('Fly Ash Bricks', 'fly-ash-brick', (select id from categories where slug = 'bricks-blocks')),
  ('River Sand (Reti)', 'river-sand', (select id from categories where slug = 'sand-aggregate')),
  ('M-Sand', 'm-sand', (select id from categories where slug = 'sand-aggregate')),
  ('Bajri / Gitti', 'bajri-gitti', (select id from categories where slug = 'sand-aggregate')),
  ('Floor Tiles', 'floor-tiles', (select id from categories where slug = 'tiles-flooring')),
  ('Vitrified Tiles', 'vitrified', (select id from categories where slug = 'tiles-flooring')),
  ('Interior Emulsion', 'interior-paint', (select id from categories where slug = 'paint')),
  ('CPVC / UPVC Pipes', 'cpvc-upvc', (select id from categories where slug = 'plumbing')),
  ('Wires & Cables', 'wires-cables', (select id from categories where slug = 'electrical')),
  ('Hand Tools', 'hand-tools', (select id from categories where slug = 'hardware-tools')),
  ('Ply & Laminates', 'ply-laminate', (select id from categories where slug = 'doors-windows')),
  ('GI Colour Coated Sheets', 'gi-sheets', (select id from categories where slug = 'roofing')),
  ('Custom / Other product', 'others-custom', (select id from categories where slug = 'others'));

-- ── DONE ─────────────────────────────────────────────────────
--
-- Next steps:
--
-- A) Demo data (optional): run demo_seed.sql
--
-- B) Platform admin:
--    Authentication → Users → copy UUID, then:
--
--    insert into profiles (user_id, role, business_name, profile_complete)
--    values ('YOUR_AUTH_USER_UUID', 'admin', 'Buniyaad Admin', true);
--
-- C) Storage buckets (Dashboard → Storage):
--
--    1. "product-images" (public) — product + shop photos
--    create policy "public read product images" on storage.objects
--      for select using (bucket_id = 'product-images');
--    create policy "sellers upload product images" on storage.objects
--      for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
--
--    2. "seller-documents" (private) — Aadhaar, registration papers
--    create policy "seller docs upload own" on storage.objects for insert
--      with check (bucket_id = 'seller-documents' and (storage.foldername(name))[1] = auth.uid()::text);
--    create policy "seller docs read own or admin" on storage.objects for select
--      using (bucket_id = 'seller-documents' and (
--        (storage.foldername(name))[1] = auth.uid()::text or public.is_platform_admin()
--      ));
-- ============================================================
