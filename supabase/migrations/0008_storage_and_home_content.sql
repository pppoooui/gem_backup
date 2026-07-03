insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into public.site_settings (
  key,
  value,
  label_en,
  label_zh,
  description_en,
  description_zh
)
values (
  'home_content_json',
  '{}',
  'Home page content',
  '首页内容',
  'Editable homepage image and proof sections',
  '可编辑首页图片与证明区'
)
on conflict (key) do nothing;
