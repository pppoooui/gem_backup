-- 0023: give every standard size one distinct public wholesale unit price.
-- Prices increase smoothly from US$0.100 at 1 mm to US$0.400 at 12 mm.

update public.price_tiers as tier
set
  price_usd = round(
    0.100 + (
      (
        nullif(regexp_replace(variant.size_mm, '[^0-9.]', '', 'g'), '')::numeric
        - 1
      ) / 11
    ) * 0.300,
    3
  ),
  label = '1,000+ pcs'
from public.product_variants as variant
join public.products as product on product.id = variant.product_id
where tier.variant_id = variant.id
  and tier.min_quantity = 1000
  and product.slug = 'round-white-cubic-zirconia';
