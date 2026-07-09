-- DFC Cubic Zirconia Factory Singapore Supabase status check
-- Safe to run on a fresh, partial, or complete Supabase project.

create temp table if not exists dfcgem_status_check (
  section text,
  name text,
  value text
) on commit drop;

truncate table dfcgem_status_check;

insert into dfcgem_status_check (section, name, value)
values
  (
    'tables',
    'products',
    (to_regclass('public.products') is not null)::text
  ),
  (
    'tables',
    'orders',
    (to_regclass('public.orders') is not null)::text
  ),
  (
    'tables',
    'admin_users',
    (to_regclass('public.admin_users') is not null)::text
  ),
  (
    'tables',
    'site_settings',
    (to_regclass('public.site_settings') is not null)::text
  ),
  (
    'tables',
    'product_image_assets',
    (to_regclass('public.product_image_assets') is not null)::text
  );

insert into dfcgem_status_check (section, name, value)
select
  'functions',
  'dfcgem_is_active_admin',
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'dfcgem_is_active_admin'
  )::text
union all
select
  'functions',
  'next_order_number',
  exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'next_order_number'
  )::text;

insert into dfcgem_status_check (section, name, value)
select
  'sequences',
  'order_number_seq',
  (to_regclass('public.order_number_seq') is not null)::text;

insert into dfcgem_status_check (section, name, value)
select
  'storage',
  'product-images bucket',
  exists (
    select 1
    from storage.buckets
    where id = 'product-images'
  )::text;

do $$
begin
  if to_regclass('public.site_settings') is not null then
    insert into dfcgem_status_check (section, name, value)
    select 'site_settings', key, value
    from public.site_settings
    where key in (
      'business_name_en',
      'business_name_zh',
      'site_url',
      'contact_email',
      'home_content_json'
    );
  end if;

  if to_regclass('public.products') is not null
     and to_regclass('public.product_variants') is not null then
    insert into dfcgem_status_check (section, name, value)
    select
      'catalog',
      'published non-round products',
      count(*)::text
    from public.products
    where status = 'published'
      and lower(btrim(shape)) <> 'round';

    insert into dfcgem_status_check (section, name, value)
    select
      'catalog',
      'published products without colorless variants',
      count(*)::text
    from public.products as product
    where product.status = 'published'
      and not exists (
        select 1
        from public.product_variants as variant
        where variant.product_id = product.id
          and lower(btrim(variant.color)) = 'colorless'
      );
  end if;

  if to_regclass('public.payment_methods') is not null then
    insert into dfcgem_status_check (section, name, value)
    select 'payment_methods', provider, enabled::text
    from public.payment_methods
    order by sort_order;
  end if;
end $$;

select *
from dfcgem_status_check
order by section, name;
