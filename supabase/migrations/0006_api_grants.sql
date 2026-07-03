-- ============================================================================
-- 0006: Manual Data API grants
-- Required when "Automatically expose new tables" is disabled in Supabase.
-- RLS policies still decide which rows are visible or writable.
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant select on
  public.products,
  public.product_variants,
  public.price_tiers,
  public.product_image_assets,
  public.categories,
  public.exchange_rates,
  public.site_settings,
  public.payment_methods
to anon, authenticated;

grant insert on
  public.customers,
  public.orders,
  public.order_items,
  public.payment_records
to anon, authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all routines in schema public to service_role;

alter default privileges in schema public
  grant all privileges on tables to service_role;

alter default privileges in schema public
  grant all privileges on sequences to service_role;

alter default privileges in schema public
  grant all privileges on routines to service_role;
