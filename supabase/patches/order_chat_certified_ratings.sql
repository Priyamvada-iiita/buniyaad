-- Order chat + certified buyer ratings (run once on existing DB)

alter table public.seller_ratings add column if not exists certified boolean not null default false;

create table if not exists public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  sender_profile_id uuid references profiles(id) on delete cascade not null,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz default now()
);

alter table order_messages enable row level security;

drop policy if exists "order_messages_select_involved" on order_messages;
drop policy if exists "order_messages_insert_involved" on order_messages;

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

-- Mark existing ratings from real orders as certified
update seller_ratings set certified = true where order_id is not null;
