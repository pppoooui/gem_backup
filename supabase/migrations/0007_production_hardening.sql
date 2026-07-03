-- ============================================================================
-- 0007: Production hardening
-- Apply after 0006_api_grants.sql.
-- ============================================================================

-- Customer and order writes are handled only by trusted Next.js server routes.
-- Direct Data API inserts would bypass price, MOQ, token and spam validation.
drop policy if exists "anonymous can create customers" on public.customers;
drop policy if exists "anonymous can create orders" on public.orders;
drop policy if exists "anonymous can create order items" on public.order_items;
drop policy if exists "anonymous can create payment records" on public.payment_records;

revoke insert on public.customers from anon, authenticated;
revoke insert on public.orders from anon, authenticated;
revoke insert on public.order_items from anon, authenticated;
revoke insert on public.payment_records from anon, authenticated;

-- Admin policies must not query admin_users directly. PostgreSQL checks every
-- policy expression, so the old subquery caused anonymous product reads to fail
-- with "permission denied for table admin_users".
create or replace function public.dfcgem_is_active_admin(required_role text default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where id = (select auth.uid())
      and is_active = true
      and (required_role is null or role = required_role)
  );
$$;

revoke all on function public.dfcgem_is_active_admin(text) from public;
grant execute on function public.dfcgem_is_active_admin(text)
  to anon, authenticated, service_role;
grant select on public.admin_users to authenticated;

alter policy "admin can manage products" on public.products
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "admin can manage product variants" on public.product_variants
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "admin can manage price tiers" on public.price_tiers
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "admin can manage product image assets" on public.product_image_assets
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "admin can manage customers" on public.customers
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "admin can manage orders" on public.orders
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "admin can manage order items" on public.order_items
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "admin can manage payment methods" on public.payment_methods
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "superadmin can manage bank accounts" on public.bank_accounts
  using (public.dfcgem_is_active_admin('superadmin'))
  with check (public.dfcgem_is_active_admin('superadmin'));
alter policy "admin can manage payment records" on public.payment_records
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "admin can read audit logs" on public.audit_logs
  using (public.dfcgem_is_active_admin());
alter policy "admin can manage categories" on public.categories
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "admin can manage exchange rates" on public.exchange_rates
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "admin can manage site settings" on public.site_settings
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());
alter policy "admin can read health check results" on public.health_check_results
  using (public.dfcgem_is_active_admin());
alter policy "admin can manage shipment quotes" on public.shipment_quotes
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());

-- A sequence avoids duplicate order numbers when two checkouts arrive together.
create sequence if not exists public.order_number_seq as bigint;

create or replace function public.next_order_number()
returns text
language sql
volatile
set search_path = ''
as $$
  select
    'GEM-' ||
    to_char(timezone('UTC', statement_timestamp()), 'YYYYMMDD') ||
    '-' ||
    lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;

revoke all on function public.next_order_number() from public, anon, authenticated;
grant execute on function public.next_order_number() to service_role;
grant usage, select on sequence public.order_number_seq to service_role;

-- Foreign-key indexes keep joins and cascading operations predictable.
create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);
create index if not exists price_tiers_variant_id_idx
  on public.price_tiers (variant_id);
create index if not exists orders_customer_id_idx
  on public.orders (customer_id);
create index if not exists payment_records_order_id_idx
  on public.payment_records (order_id);
create index if not exists bank_accounts_payment_method_id_idx
  on public.bank_accounts (payment_method_id);

-- Correct legacy brand settings without overwriting later custom values.
update public.site_settings
set value = 'DFCgem', updated_at = now()
where key in ('business_name_en', 'business_name_zh')
  and value = 'UpgradeGem';
