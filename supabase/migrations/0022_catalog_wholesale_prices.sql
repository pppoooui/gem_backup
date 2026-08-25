-- 0022: publish a complete 5A USD wholesale price table for all standard
-- round white CZ sizes. Each price remains editable in the admin product page.

update public.product_variants as variant
set
  moq = 1000,
  stock_status = 'in_stock',
  stock_note = 'Standard wholesale catalog'
from public.products as product
where product.id = variant.product_id
  and product.slug = 'round-white-cubic-zirconia';

insert into public.price_tiers (
  variant_id,
  min_quantity,
  price_usd,
  label
)
select
  variant.id,
  1000,
  case
    when nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric < 2 then 0.100
    when nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric < 3 then 0.120
    when nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric < 4 then 0.150
    when nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric < 5 then 0.180
    when nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric < 6 then 0.220
    when nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric < 7 then 0.260
    when nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric < 8 then 0.300
    when nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric < 9 then 0.330
    when nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric < 10 then 0.350
    when nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric < 11 then 0.370
    else 0.400
  end,
  '1,000+ pcs'
from public.product_variants as variant
join public.products as product on product.id = variant.product_id
where product.slug = 'round-white-cubic-zirconia'
on conflict (variant_id, min_quantity)
do update set
  price_usd = excluded.price_usd,
  label = excluded.label;

update public.site_settings
set value = 'true', updated_at = now()
where key = 'catalog_show_prices';

alter policy "public can read variants for published products"
  on public.product_variants
  using (
    lower(btrim(color)) in ('colorless', 'white')
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
      join public.products on products.id = product_variants.product_id
      where product_variants.id = price_tiers.variant_id
        and lower(btrim(product_variants.color)) in ('colorless', 'white')
        and products.status = 'published'
        and lower(btrim(products.shape)) = 'round'
    )
    and exists (
      select 1
      from public.site_settings
      where key = 'catalog_show_prices'
        and lower(btrim(value)) = 'true'
    )
  );
