-- 0021: enable the normal storefront purchase flow and attach a payable URL
-- directly to each customer order after the admin confirms the final amount.

update public.site_settings
set
  value = 'true',
  label_en = 'Show product prices and shopping cart',
  label_zh = '显示商品价格与购物车',
  description_en = 'Enables USD prices, add to cart, checkout, and order submission.',
  description_zh = '开启美元价格、加入购物车、结账和提交订单。',
  updated_at = now()
where key = 'catalog_show_prices';

insert into public.site_settings (
  key,
  value,
  label_en,
  label_zh,
  description_en,
  description_zh
)
select
  'catalog_show_prices',
  'true',
  'Show product prices and shopping cart',
  '显示商品价格与购物车',
  'Enables USD prices, add to cart, checkout, and order submission.',
  '开启美元价格、加入购物车、结账和提交订单。'
where not exists (
  select 1 from public.site_settings where key = 'catalog_show_prices'
);

alter table public.orders
  add column if not exists payment_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_url_http_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_payment_url_http_check
      check (
        payment_url is null
        or payment_url ~* '^https?://'
      ) not valid;
  end if;
end
$$;
