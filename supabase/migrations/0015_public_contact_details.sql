-- 0015: update public contact details.

insert into public.site_settings (
  key, value, label_en, label_zh, description_en, description_zh, updated_at
)
values
  (
    'contact_email',
    'emilydfccz@gmail.com',
    'Contact email',
    '联系邮箱',
    'Public sales contact',
    '公开销售联系邮箱',
    now()
  ),
  (
    'contact_address',
    'Wuzhou, China',
    'Contact address',
    '联系地址',
    'Public business location',
    '公开业务地址：中国梧州',
    now()
  )
on conflict (key) do update
set
  value = excluded.value,
  label_en = excluded.label_en,
  label_zh = excluded.label_zh,
  description_en = excluded.description_en,
  description_zh = excluded.description_zh,
  updated_at = excluded.updated_at;
