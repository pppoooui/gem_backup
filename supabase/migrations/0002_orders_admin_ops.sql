alter table public.customers
  add column if not exists company_name text,
  add column if not exists contact_name text,
  add column if not exists iec text;

update public.customers
set company_name = coalesce(company_name, name)
where company_name is null;

alter table public.orders
  add column if not exists locale text not null default 'en',
  add column if not exists selected_payment_provider text not null default 'xtransfer',
  add column if not exists buyer_note text;

alter table public.order_items
  add column if not exists sku text,
  add column if not exists image_path text,
  add column if not exists color text,
  add column if not exists grade text,
  add column if not exists hs_code text,
  add column if not exists line_total_usd numeric(12, 2);

update public.order_items
set line_total_usd = coalesce(line_total_usd, price_usd * quantity)
where line_total_usd is null;

create index if not exists orders_order_no_idx on public.orders (order_no);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists customers_whatsapp_idx on public.customers (whatsapp);

create table if not exists public.product_image_assets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  storage_provider text not null default 'supabase',
  bucket text,
  path text not null,
  alt_text text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.product_image_assets enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_image_assets'
      and policyname = 'public can read product image assets'
  ) then
    create policy "public can read product image assets"
      on public.product_image_assets for select
      using (
        exists (
          select 1
          from public.products
          where products.id = product_image_assets.product_id
          and products.status = 'published'
        )
      );
  end if;
end $$;
