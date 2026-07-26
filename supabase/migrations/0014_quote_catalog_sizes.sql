-- 0014: public quote catalog with the requested round white size range.
-- Prices remain unavailable to the public while catalog_show_prices is false.

do $$
declare
  product_id uuid;
  size_value text;
begin
  select id into product_id
  from public.products
  where slug = 'round-white-cubic-zirconia'
  limit 1;

  if product_id is null then
    insert into public.products (
      slug, sku, name_en, name_zh, description_en, description_zh,
      shape, material, cut, grade, hs_code, status, cover_image_path
    )
    values (
      'round-white-cubic-zirconia',
      'CZ-ROUND-WHITE-QUOTE',
      'Round White Cubic Zirconia',
      '圆形白色立方氧化锆',
      'Round white cubic zirconia for wholesale quotation.',
      '圆形白色立方氧化锆，批发询价。',
      'Round', 'Cubic Zirconia', 'Excellent', '5A', '7104.90',
      'published', '/products/round-1mm.png'
    )
    returning id into product_id;
  else
    update public.products
    set status = 'published',
        name_en = 'Round White Cubic Zirconia',
        name_zh = '圆形白色立方氧化锆',
        shape = 'Round',
        material = 'Cubic Zirconia',
        cover_image_path = '/products/round-1mm.png'
    where id = product_id;
  end if;

  update public.products as p
  set status = 'archived'
  where p.id <> product_id
    and p.status = 'published';

  foreach size_value in array array[
    '1 mm','1.05 mm','1.1 mm','1.15 mm','1.2 mm','1.25 mm','1.3 mm',
    '1.35 mm','1.4 mm','1.45 mm','1.5 mm','1.55 mm','1.6 mm','1.65 mm',
    '1.7 mm','1.75 mm','1.8 mm','1.85 mm','1.9 mm','1.95 mm','2 mm',
    '2.05 mm','2.1 mm','2.15 mm','2.25 mm','2.3 mm','2.5 mm','2.55 mm',
    '2.6 mm','2.65 mm','2.8 mm','2.9 mm','3 mm','3.1 mm','3.25 mm',
    '3.3 mm','3.75 mm','3.8 mm','4 mm','4.25 mm','4.5 mm','4.75 mm',
    '5 mm','5.25 mm','5.5 mm','5.75 mm','6 mm','6.25 mm','6.5 mm',
    '6.75 mm','7 mm','7.25 mm','7.5 mm','7.75 mm','8 mm','8.25 mm',
    '8.5 mm','8.75 mm','9 mm','9.25 mm','9.5 mm','9.75 mm','10 mm',
    '10.25 mm','10.5 mm','10.75 mm','11 mm','11.25 mm','11.5 mm',
    '11.75 mm','12 mm'
  ] loop
    insert into public.product_variants (
      product_id, size_mm, color, package_unit, moq, stock_status, stock_note, clarity
    )
    values (product_id, size_value, 'White', '1,000 pcs', 1000, 'quote_only', 'Confirm batch', 'VS')
    on conflict (product_id, size_mm, color, package_unit)
    do update set moq = 1000, stock_status = 'quote_only', stock_note = 'Confirm batch';
  end loop;
end $$;

alter table public.inquiries
  drop constraint if exists inquiries_quantity_check;
alter table public.inquiries
  add constraint inquiries_quantity_check
  check (quantity >= 1000 and quantity <= 100000000);

create index if not exists inquiries_size_grade_idx
  on public.inquiries (size_mm, grade);
