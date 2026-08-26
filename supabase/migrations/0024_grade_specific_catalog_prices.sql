-- 0024: store one editable 3A price per size while price_tiers remains the
-- 5A source of truth. A size's 3A price matches the previous smaller size's
-- 5A price; the smallest 3A size starts 15% below its 5A price.

with ordered_prices as (
  select
    variant.size_mm,
    tier.price_usd as five_a_price,
    lag(tier.price_usd) over (
      order by nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric
    ) as previous_five_a_price
  from public.product_variants as variant
  join public.products as product on product.id = variant.product_id
  join public.price_tiers as tier
    on tier.variant_id = variant.id
   and tier.min_quantity = 1000
  where product.slug = 'round-white-cubic-zirconia'
), grade_prices as (
  select jsonb_object_agg(
    size_mm,
    coalesce(previous_five_a_price, round(five_a_price * 0.85, 3))
  )::text as value
  from ordered_prices
)
insert into public.site_settings (
  key,
  value,
  label_en,
  label_zh,
  description_en,
  description_zh,
  updated_at
)
select
  'catalog_3a_prices_json',
  value,
  '3A catalog prices by size',
  '3A 各尺寸目录价格',
  'Admin-managed 3A USD unit prices keyed by size.',
  '后台按尺寸管理的 3A 美元单价。',
  now()
from grade_prices
on conflict (key) do update
set
  value = excluded.value,
  label_en = excluded.label_en,
  label_zh = excluded.label_zh,
  description_en = excluded.description_en,
  description_zh = excluded.description_zh,
  updated_at = excluded.updated_at;
