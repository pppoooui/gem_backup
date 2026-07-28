-- 0017: global customer checkout, USD-only storefront, LINE contact,
-- and secure custom specification payment links.

create table if not exists public.custom_payment_links (
  id uuid primary key default gen_random_uuid(),
  public_token text unique not null,
  locale text not null default 'en' check (locale in ('en', 'zh')),
  title text not null,
  specification text not null,
  quantity text not null,
  amount_usd numeric(12, 2) not null check (amount_usd > 0),
  customer_name text,
  customer_whatsapp text,
  note text,
  payment_url text,
  status text not null default 'active'
    check (status in ('active', 'payment_submitted', 'paid', 'cancelled', 'expired')),
  expires_at timestamptz,
  payment_submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.custom_payment_links enable row level security;

drop policy if exists "admin can manage custom payment links"
  on public.custom_payment_links;
create policy "admin can manage custom payment links"
  on public.custom_payment_links
  for all
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());

revoke all on public.custom_payment_links from public, anon, authenticated;
grant all privileges on public.custom_payment_links to service_role;

create index if not exists custom_payment_links_created_idx
  on public.custom_payment_links (created_at desc);
create index if not exists custom_payment_links_status_idx
  on public.custom_payment_links (status, expires_at);

insert into public.site_settings (
  key,
  value,
  label_en,
  label_zh,
  description_en,
  description_zh
)
values
  (
    'line_chat_url',
    '',
    'LINE chat URL',
    'LINE 聊天链接',
    'Public LINE add-friend or chat URL.',
    '前台 LINE 加好友或聊天网址。'
  ),
  (
    'default_currency',
    'USD',
    'Default currency',
    '默认币种',
    'Customer-facing quote currency.',
    '客户报价币种。'
  ),
  (
    'reference_currency',
    'USD',
    'Reference currency',
    '参考币种',
    'Use USD throughout customer-facing pages.',
    '客户页面统一使用 USD。'
  )
on conflict (key) do update set
  value = excluded.value,
  label_en = excluded.label_en,
  label_zh = excluded.label_zh,
  description_en = excluded.description_en,
  description_zh = excluded.description_zh,
  updated_at = now();

update public.payment_methods
set
  currencies = array['USD'],
  countries = array['Global'];
