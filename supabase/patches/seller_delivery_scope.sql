-- Seller delivery coverage (shop-level, not per product)
alter table public.profiles add column if not exists delivery_scope text not null default 'my_district'
  check (delivery_scope in ('all_bihar', 'my_district', 'my_city', 'custom_districts'));
alter table public.profiles add column if not exists delivery_districts jsonb not null default '[]'::jsonb;

-- Product pincode becomes optional (inherited from shop for legacy filters)
alter table public.products alter column pincode drop not null;
