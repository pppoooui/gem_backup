-- ============================================================================
-- 0010: DFC content refresh
-- Apply after 0009_reseed_order_number_sequence.sql.
-- Keeps historical order records while limiting the public catalog to round,
-- colorless cubic zirconia.
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
    'business_name_en',
    'DFC Cubic Zirconia Factory',
    'Business name (EN)',
    '英文公司名',
    'Shown on customer-facing pages',
    '显示在客户页面',
    now()
  ),
  (
    'business_name_zh',
    'DFC Cubic Zirconia Factory',
    'Business name (ZH)',
    '中文公司名',
    'Shown on Chinese admin references',
    '显示在中文后台参考信息',
    now()
  ),
  (
    'site_url',
    'https://dfccz.top',
    'Site URL',
    '网站域名',
    'Provisional canonical public URL',
    '暂定公开网站域名',
    now()
  ),
  (
    'contact_email',
    'sales@dfccz.top',
    'Contact email',
    '联系邮箱',
    'Public sales contact',
    '公开销售联系邮箱',
    now()
  ),
  (
    'home_content_json',
    '{}',
    'Home page content',
    '首页内容',
    'Uses the approved 2026 DFC content defaults until edited in admin',
    '使用 2026 DFC 已确认首页默认内容，后台保存后可覆盖',
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

update public.products as product
set status = 'draft'
where product.status = 'published'
  and (
    lower(btrim(product.shape)) <> 'round'
    or not exists (
      select 1
      from public.product_variants as variant
      where variant.product_id = product.id
        and lower(btrim(variant.color)) = 'colorless'
    )
  );

alter policy "public can read published products" on public.products
  using (
    status = 'published'
    and lower(btrim(shape)) = 'round'
  );

alter policy "public can read variants for published products"
  on public.product_variants
  using (
    lower(btrim(color)) = 'colorless'
    and exists (
      select 1
      from public.products
      where products.id = product_variants.product_id
        and products.status = 'published'
        and lower(btrim(products.shape)) = 'round'
    )
  );

alter policy "public can read price tiers for published products"
  on public.price_tiers
  using (
    exists (
      select 1
      from public.product_variants
      join public.products
        on products.id = product_variants.product_id
      where product_variants.id = price_tiers.variant_id
        and lower(btrim(product_variants.color)) = 'colorless'
        and products.status = 'published'
        and lower(btrim(products.shape)) = 'round'
    )
  );
