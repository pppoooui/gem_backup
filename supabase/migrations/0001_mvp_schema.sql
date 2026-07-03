create type public.order_status as enum (
  'pending_quote',
  'awaiting_payment',
  'payment_submitted',
  'paid',
  'processing',
  'shipped',
  'cancelled'
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_zh text not null,
  description_en text,
  description_zh text,
  shape text not null,
  material text not null,
  cut text not null,
  grade text not null,
  hs_code text,
  status text not null default 'published',
  cover_image_path text,
  storage_provider text not null default 'supabase',
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size_mm text not null,
  color text not null,
  package_unit text not null,
  moq integer not null,
  stock_status text not null default 'in_stock',
  weight_grams numeric not null default 0,
  created_at timestamptz not null default now()
);

create table public.price_tiers (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  min_quantity integer not null,
  price_usd numeric(12, 4) not null,
  label text,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  email text,
  country text not null default 'IN',
  city text,
  pin_code text,
  landmark text,
  shipping_address text,
  india_gstin text,
  has_customs_agent boolean not null default false,
  is_registered boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,
  customer_id uuid references public.customers(id),
  status public.order_status not null default 'pending_quote',
  subtotal_usd numeric(12, 2) not null default 0,
  discount_usd numeric(12, 2) not null default 0,
  shipping_fee_usd numeric(12, 2) not null default 0,
  handling_fee_usd numeric(12, 2) not null default 0,
  total_usd numeric(12, 2) not null default 0,
  currency_display text not null default 'USD',
  secure_token_hash text not null,
  admin_notes text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  variant_id uuid references public.product_variants(id),
  product_name_en text not null,
  product_name_zh text not null,
  size_mm text not null,
  package_unit text not null,
  quantity integer not null,
  price_usd numeric(12, 4) not null,
  weight_grams numeric not null default 0
);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  name text not null,
  enabled boolean not null default true,
  countries text[] not null default array['IN'],
  currencies text[] not null default array['USD'],
  min_amount_usd numeric(12, 2),
  max_amount_usd numeric(12, 2),
  sort_order integer not null default 100,
  display_instructions_en text,
  display_instructions_zh text,
  admin_notes text,
  created_at timestamptz not null default now()
);

create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  payment_method_id uuid not null references public.payment_methods(id) on delete cascade,
  account_name text not null,
  account_number text not null,
  bank_name text not null,
  bank_address text,
  swift_code text,
  intermediary_bank text,
  currency text not null default 'USD',
  fee_bearer text not null default 'SHA'
);

create table public.payment_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_method_id uuid references public.payment_methods(id),
  requested_amount_usd numeric(12, 2) not null,
  received_amount_usd numeric(12, 2),
  status text not null default 'pending',
  proof_image_path text,
  admin_note text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.price_tiers enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_methods enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.payment_records enable row level security;
alter table public.audit_logs enable row level security;

create policy "public can read published products"
  on public.products for select
  using (status = 'published');

create policy "public can read variants for published products"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.products
      where products.id = product_variants.product_id
      and products.status = 'published'
    )
  );

create policy "public can read price tiers for published products"
  on public.price_tiers for select
  using (
    exists (
      select 1
      from public.product_variants
      join public.products on products.id = product_variants.product_id
      where product_variants.id = price_tiers.variant_id
      and products.status = 'published'
    )
  );
