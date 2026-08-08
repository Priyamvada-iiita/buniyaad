-- Seller payout details (UPI / bank) — private table, not on public profile
-- Run once on existing DB

alter table public.profiles add column if not exists payout_setup_complete boolean not null default false;

create table if not exists public.seller_payout_details (
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

alter table seller_payout_details enable row level security;

drop policy if exists "seller_payout_select_own_or_admin" on seller_payout_details;
drop policy if exists "seller_payout_insert_own" on seller_payout_details;
drop policy if exists "seller_payout_update_own" on seller_payout_details;

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
