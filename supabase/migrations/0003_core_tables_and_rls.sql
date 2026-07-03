-- ============================================================================
-- 0003: Core support tables and production RLS
-- Prerequisites: 0001_mvp_schema.sql, 0002_orders_admin_ops.sql
-- ============================================================================

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'health_check_status'
  ) then
    create type public.health_check_status as enum ('ok', 'warn', 'error');
  end if;
end $$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_zh text not null,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists sku text,
  add column if not exists clarity text not null default 'VS';

alter table public.product_variants
  add column if not exists clarity text not null default 'VS',
  add column if not exists stock_note text;

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  from_currency text not null default 'USD',
  to_currency text not null default 'INR',
  rate numeric(18, 6) not null,
  source text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text not null,
  role text not null default 'admin' check (role in ('admin', 'superadmin')),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  label_en text,
  label_zh text,
  description_en text,
  description_zh text,
  updated_at timestamptz not null default now()
);

create table if not exists public.health_check_results (
  id uuid primary key default gen_random_uuid(),
  check_name text not null,
  status public.health_check_status not null default 'ok',
  detail text,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create table if not exists public.shipment_quotes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  carrier text not null,
  service_level text,
  estimated_days integer,
  cost_usd numeric(12, 2) not null default 0,
  is_selected boolean not null default false,
  admin_note text,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.health_check_results enable row level security;
alter table public.shipment_quotes enable row level security;

create index if not exists categories_sort_order_idx
  on public.categories (sort_order, slug);

create index if not exists exchange_rates_pair_created_at_idx
  on public.exchange_rates (from_currency, to_currency, created_at desc);

create index if not exists shipment_quotes_order_id_idx
  on public.shipment_quotes (order_id);

create index if not exists admin_users_email_idx
  on public.admin_users (email);

create index if not exists health_check_results_created_at_idx
  on public.health_check_results (created_at desc);

create unique index if not exists product_variants_product_size_color_unit_key
  on public.product_variants (product_id, size_mm, color, package_unit);

create unique index if not exists price_tiers_variant_min_quantity_key
  on public.price_tiers (variant_id, min_quantity);

create unique index if not exists products_sku_key
  on public.products (sku)
  where sku is not null;

insert into public.site_settings (key, value, label_en, label_zh, description_en, description_zh)
values
  ('whatsapp_number', '+91 ', 'WhatsApp number', 'WhatsApp 号码', 'Used for pre-filled customer messages', '用于客户预填消息'),
  ('min_order_amount_usd', '100', 'Minimum order (USD)', '最低订单金额（USD）', 'Orders below this amount need manual approval', '低于此金额的订单需要人工确认'),
  ('business_name_en', 'DFCgem', 'Business name (EN)', '英文公司名', 'Shown on customer-facing pages', '显示在客户页面'),
  ('business_name_zh', 'DFCgem', 'Business name (ZH)', '中文公司名', 'Shown on Chinese admin references', '显示在中文后台参考信息'),
  ('default_currency', 'USD', 'Default currency', '默认币种', 'Primary quote currency', '主要报价币种'),
  ('reference_currency', 'INR', 'Reference currency', '参考币种', 'Reference currency for India buyers', '印度买家的参考币种')
on conflict (key) do update
set
  value = excluded.value,
  label_en = excluded.label_en,
  label_zh = excluded.label_zh,
  description_en = excluded.description_en,
  description_zh = excluded.description_zh,
  updated_at = now();

create or replace function pg_temp.upgradegem_create_policy_if_missing(
  target_table text,
  target_policy text,
  policy_sql text
) returns void
language plpgsql
as $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = target_table
      and policyname = target_policy
  ) then
    execute policy_sql;
  end if;
end;
$$;

select pg_temp.upgradegem_create_policy_if_missing(
  'admin_users',
  'admin can read own admin user',
  'create policy "admin can read own admin user" on public.admin_users for select using (id = auth.uid() and is_active = true)'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'products',
  'admin can manage products',
  'create policy "admin can manage products" on public.products for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'product_variants',
  'admin can manage product variants',
  'create policy "admin can manage product variants" on public.product_variants for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'price_tiers',
  'admin can manage price tiers',
  'create policy "admin can manage price tiers" on public.price_tiers for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'product_image_assets',
  'admin can manage product image assets',
  'create policy "admin can manage product image assets" on public.product_image_assets for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'customers',
  'anonymous can create customers',
  'create policy "anonymous can create customers" on public.customers for insert with check (true)'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'customers',
  'admin can manage customers',
  'create policy "admin can manage customers" on public.customers for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'orders',
  'anonymous can create orders',
  'create policy "anonymous can create orders" on public.orders for insert with check (true)'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'orders',
  'admin can manage orders',
  'create policy "admin can manage orders" on public.orders for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'order_items',
  'anonymous can create order items',
  'create policy "anonymous can create order items" on public.order_items for insert with check (true)'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'order_items',
  'admin can manage order items',
  'create policy "admin can manage order items" on public.order_items for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'payment_methods',
  'public can read enabled payment methods',
  'create policy "public can read enabled payment methods" on public.payment_methods for select using (enabled = true)'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'payment_methods',
  'admin can manage payment methods',
  'create policy "admin can manage payment methods" on public.payment_methods for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'bank_accounts',
  'superadmin can manage bank accounts',
  'create policy "superadmin can manage bank accounts" on public.bank_accounts for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true and admin_users.role = ''superadmin''))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'payment_records',
  'anonymous can create payment records',
  'create policy "anonymous can create payment records" on public.payment_records for insert with check (true)'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'payment_records',
  'admin can manage payment records',
  'create policy "admin can manage payment records" on public.payment_records for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'audit_logs',
  'admin can read audit logs',
  'create policy "admin can read audit logs" on public.audit_logs for select using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'categories',
  'public can read categories',
  'create policy "public can read categories" on public.categories for select using (true)'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'categories',
  'admin can manage categories',
  'create policy "admin can manage categories" on public.categories for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'exchange_rates',
  'public can read active exchange rates',
  'create policy "public can read active exchange rates" on public.exchange_rates for select using (expires_at is null or expires_at > now())'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'exchange_rates',
  'admin can manage exchange rates',
  'create policy "admin can manage exchange rates" on public.exchange_rates for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'site_settings',
  'public can read site settings',
  'create policy "public can read site settings" on public.site_settings for select using (true)'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'site_settings',
  'admin can manage site settings',
  'create policy "admin can manage site settings" on public.site_settings for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'health_check_results',
  'admin can read health check results',
  'create policy "admin can read health check results" on public.health_check_results for select using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);

select pg_temp.upgradegem_create_policy_if_missing(
  'shipment_quotes',
  'admin can manage shipment quotes',
  'create policy "admin can manage shipment quotes" on public.shipment_quotes for all using (exists (select 1 from public.admin_users where admin_users.id = auth.uid() and admin_users.is_active = true))'
);
