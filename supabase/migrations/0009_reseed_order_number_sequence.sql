-- ============================================================================
-- 0009: Reseed order number sequence after legacy/imported orders
-- Apply after 0007_production_hardening.sql.
-- ============================================================================

do $$
declare
  max_order_suffix bigint;
  sequence_last_value bigint;
  sequence_is_called boolean;
  sequence_next_value bigint;
begin
  create sequence if not exists public.order_number_seq as bigint;

  select coalesce(
    max((regexp_match(order_no, '^GEM-[0-9]{8}-([0-9]+)$'))[1]::bigint),
    0
  )
  into max_order_suffix
  from public.orders
  where order_no ~ '^GEM-[0-9]{8}-[0-9]+$';

  select last_value, is_called
  into sequence_last_value, sequence_is_called
  from public.order_number_seq;

  sequence_next_value := case
    when sequence_is_called then sequence_last_value + 1
    else sequence_last_value
  end;

  if max_order_suffix > 0 and sequence_next_value <= max_order_suffix then
    perform setval('public.order_number_seq', max_order_suffix, true);
  end if;
end $$;
