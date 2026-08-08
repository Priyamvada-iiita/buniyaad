-- Run once in Supabase SQL Editor if you already installed schema.sql
-- before admin category management was added.

create policy "categories_insert_admin" on categories for insert
  with check (public.is_platform_admin());

create policy "categories_update_admin" on categories for update
  using (public.is_platform_admin());

create policy "categories_delete_admin" on categories for delete
  using (public.is_platform_admin());

-- Optional: lets admin see all products when checking category usage
drop policy if exists "products_select_admin" on products;
create policy "products_select_admin" on products for select using (public.is_platform_admin());
