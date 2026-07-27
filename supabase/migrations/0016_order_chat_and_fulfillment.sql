-- 0016: negotiated-order chat and detailed fulfillment progress.

alter type public.order_status add value if not exists 'production';
alter type public.order_status add value if not exists 'packing';
alter type public.order_status add value if not exists 'in_transit';
alter type public.order_status add value if not exists 'delivered';

alter table public.orders
  add column if not exists tracking_number text,
  add column if not exists shipping_carrier text,
  add column if not exists quoted_at timestamptz,
  add column if not exists paid_at timestamptz;

create table if not exists public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_role text not null check (sender_role in ('customer', 'admin')),
  sender_name text not null default '',
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.order_messages enable row level security;

drop policy if exists "admin can manage order messages" on public.order_messages;
create policy "admin can manage order messages"
  on public.order_messages
  for all
  using (public.dfcgem_is_active_admin())
  with check (public.dfcgem_is_active_admin());

grant all privileges on public.order_messages to service_role;

create index if not exists order_messages_order_created_idx
  on public.order_messages (order_id, created_at);
