-- Shop map, payments, offers, ratings (run once on existing DB)

alter table public.profiles add column if not exists map_lat numeric(10,7);
alter table public.profiles add column if not exists map_lng numeric(10,7);
alter table public.profiles add column if not exists google_maps_url text;
alter table public.profiles add column if not exists accepts_cod boolean not null default true;
alter table public.profiles add column if not exists accepts_online boolean not null default true;

alter table public.orders add column if not exists payment_method text not null default 'online';

create table if not exists public.seller_offers (
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

create table if not exists public.seller_ratings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  order_id uuid references orders(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text,
  created_at timestamptz default now(),
  unique (seller_id, buyer_id)
);

alter table seller_offers enable row level security;
alter table seller_ratings enable row level security;

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
