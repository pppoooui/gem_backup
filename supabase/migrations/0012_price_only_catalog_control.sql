-- ============================================================================
-- 0012: Keep the original catalog UI and control only public unit prices.
-- Apply after 0011_storefront_controls_and_inquiries.sql.
-- ============================================================================

delete from public.site_settings
where key = 'catalog_show_product_details';

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
  );
