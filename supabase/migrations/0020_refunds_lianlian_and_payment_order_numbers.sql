-- 0020: negotiated refunds, LianLian Global, and readable custom-payment order numbers.

alter type public.order_status add value if not exists 'refund_requested';
alter type public.order_status add value if not exists 'refunded';

alter table public.orders
  add column if not exists refund_reason text,
  add column if not exists refund_requested_at timestamptz,
  add column if not exists refunded_at timestamptz;

create sequence if not exists public.custom_payment_order_no_seq;

create or replace function public.dfcgem_next_custom_payment_order_no(
  customer_name_input text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_part text;
  sequence_part text;
begin
  customer_part := upper(
    regexp_replace(
      coalesce(nullif(trim(customer_name_input), ''), 'CUSTOMER'),
      '[^[:alnum:]]+',
      '',
      'g'
    )
  );
  customer_part := left(coalesce(nullif(customer_part, ''), 'CUSTOMER'), 20);
  sequence_part := lpad(nextval('public.custom_payment_order_no_seq')::text, 4, '0');
  return customer_part || '-' || to_char(current_date, 'YYYYMMDD') || '-' || sequence_part;
end;
$$;

revoke all on function public.dfcgem_next_custom_payment_order_no(text)
  from public, anon, authenticated;
grant execute on function public.dfcgem_next_custom_payment_order_no(text)
  to service_role;

alter table public.custom_payment_links
  add column if not exists order_no text;

update public.custom_payment_links
set order_no = public.dfcgem_next_custom_payment_order_no(customer_name)
where order_no is null;

alter table public.custom_payment_links
  alter column order_no set not null;

create unique index if not exists custom_payment_links_order_no_key
  on public.custom_payment_links (order_no);

insert into public.payment_methods (
  provider,
  name,
  enabled,
  countries,
  currencies,
  min_amount_usd,
  sort_order,
  display_instructions_en,
  display_instructions_zh,
  admin_notes
)
select
  'lianlian',
  'LianLian Global',
  true,
  array['Global'],
  array['USD'],
  1,
  5,
  'Pay in USD using the secure LianLian checkout link supplied with your order.',
  '通过订单附带的连连支付安全收款链接，以美元在线付款。',
  'Paste the LianLian hosted checkout URL when generating a customer payment link.'
where not exists (
  select 1 from public.payment_methods where provider = 'lianlian'
);
