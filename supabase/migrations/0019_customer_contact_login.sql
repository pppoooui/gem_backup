-- 0019: customer sessions for LINE Login and WhatsApp verification codes.

alter table public.customers
  add column if not exists whatsapp_normalized text,
  add column if not exists line_user_id text;

update public.customers
set whatsapp_normalized = regexp_replace(coalesce(whatsapp, ''), '[^0-9]', '', 'g')
where whatsapp_normalized is null;

create index if not exists customers_whatsapp_normalized_idx
  on public.customers (whatsapp_normalized);
create index if not exists customers_line_user_id_idx
  on public.customers (line_user_id);

create table if not exists public.customer_contact_sessions (
  id uuid primary key default gen_random_uuid(),
  session_hash text unique not null,
  provider text not null check (provider in ('whatsapp', 'line')),
  provider_user_id text not null,
  display_name text,
  email text,
  phone text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_login_codes (
  id uuid primary key default gen_random_uuid(),
  challenge_hash text unique not null,
  phone text not null,
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.customer_contact_sessions enable row level security;
alter table public.customer_login_codes enable row level security;

revoke all on public.customer_contact_sessions from public, anon, authenticated;
revoke all on public.customer_login_codes from public, anon, authenticated;
grant all privileges on public.customer_contact_sessions to service_role;
grant all privileges on public.customer_login_codes to service_role;

create index if not exists customer_contact_sessions_expiry_idx
  on public.customer_contact_sessions (expires_at);
create index if not exists customer_login_codes_expiry_idx
  on public.customer_login_codes (expires_at);
