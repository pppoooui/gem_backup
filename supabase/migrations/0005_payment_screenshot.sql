-- ============================================================================
-- 0005: Payment screenshot column
-- ============================================================================

alter table public.orders
  add column if not exists payment_screenshot_url text;

comment on column public.orders.payment_screenshot_url
  is 'URL to payment proof screenshot uploaded by customer.';
