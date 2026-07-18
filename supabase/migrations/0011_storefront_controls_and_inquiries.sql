-- ============================================================================
-- 0011: Storefront visibility controls and customer inquiries
-- Apply after 0010_dfc_content_refresh.sql.
-- ============================================================================

insert into public.site_settings (
  key,
  value,
  label_en,
  label_zh,
  description_en,
  description_zh,
  updated_at
)
values
  (
    'home_show_history',
    'false',
    'Show company journey',
    '显示发展历程',
    'Shows the Our journey section on the homepage',
    '控制首页发展历程模块显示',
    now()
  ),
  (
    'home_show_recognition',
    'false',
    'Show industry recognition',
    '显示行业认可',
    'Shows certifications and quality records on the homepage',
    '控制首页认证与品质记录模块显示',
    now()
  ),
  (
    'catalog_show_product_details',
    'false',
    'Show product specifications',
    '显示商品规格',
    'Shows public size, grade, MOQ and selection controls',
    '控制公开商品规格、等级、起订量及选择器显示',
    now()
  ),
  (
    'catalog_show_prices',
    'false',
    'Show product prices',
    '显示商品价格与购物车',
    'Shows public prices and enables the cart',
    '控制公开价格与购物车显示',
    now()
  )
on conflict (key) do update
set
  value = excluded.value,
  label_en = excluded.label_en,
  label_zh = excluded.label_zh,
  description_en = excluded.description_en,
  description_zh = excluded.description_zh,
  updated_at = excluded.updated_at;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null default '',
  quantity integer not null check (quantity > 0 and quantity <= 100000000),
  size_mm text not null check (char_length(size_mm) between 1 and 32),
  grade text not null check (grade in ('3A', '5A')),
  email text not null check (char_length(email) <= 254),
  whatsapp text not null check (char_length(whatsapp) between 7 and 32),
  notes text check (notes is null or char_length(notes) <= 2000),
  locale text not null default 'en' check (locale in ('en', 'zh')),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

drop policy if exists "admin can manage inquiries" on public.inquiries;
create policy "admin can manage inquiries"
  on public.inquiries
  for all
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());

grant all privileges on public.inquiries to service_role;

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);
create index if not exists inquiries_status_created_at_idx
  on public.inquiries (status, created_at desc);

-- Public price data stays inaccessible until the explicit setting is enabled.
alter policy "public can read price tiers for published products"
  on public.price_tiers
  using (
    exists (
      select 1
      from public.product_variants
      join public.products on products.id = product_variants.product_id
      where product_variants.id = price_tiers.variant_id
        and lower(btrim(product_variants.color)) = 'colorless'
        and products.status = 'published'
        and lower(btrim(products.shape)) = 'round'
    )
    and exists (
      select 1
      from public.site_settings
      where key = 'catalog_show_prices'
        and lower(btrim(value)) = 'true'
    )
    and exists (
      select 1
      from public.site_settings
      where key = 'catalog_show_product_details'
        and lower(btrim(value)) = 'true'
    )
  );
