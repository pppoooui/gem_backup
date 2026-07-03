-- ============================================================================
-- 0004: Seed default payment methods and bank account placeholders
-- ============================================================================

insert into public.payment_methods (
  id,
  provider,
  name,
  enabled,
  countries,
  currencies,
  min_amount_usd,
  sort_order,
  display_instructions_en,
  display_instructions_zh
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'xtransfer',
    'XTransfer',
    true,
    array['IN'],
    array['USD', 'EUR'],
    100,
    10,
    'Pay via XTransfer for competitive rates and INR settlement. Account details will be shared on your Proforma Invoice.',
    '通过 XTransfer 支付，享受优惠汇率和 INR 结算。账户信息将在形式发票上提供。'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'worldfirst',
    'WorldFirst',
    true,
    array['IN'],
    array['USD', 'EUR', 'GBP', 'SGD'],
    100,
    20,
    'Multi-currency account for global traders. Transfer at wholesale FX rates.',
    '面向全球贸易商的多币种账户。以批发汇率转账。'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'airwallex',
    'Airwallex',
    false,
    array['IN'],
    array['USD', 'EUR', 'AUD', 'SGD'],
    100,
    30,
    'All-in-one business account with virtual cards and interbank rates.',
    '一体化商业账户，提供虚拟卡和银行间汇率。'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'wise',
    'Wise',
    true,
    array['IN'],
    array['USD', 'EUR', 'GBP'],
    50,
    40,
    'Transparent, low-cost transfers at the real mid-market exchange rate.',
    '透明低费率的转账，使用真实中间市场汇率。'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'bank_transfer',
    'Bank Transfer (SWIFT)',
    true,
    array['IN'],
    array['USD', 'EUR', 'GBP'],
    500,
    50,
    'Traditional wire transfer for larger orders. Unlimited amount, 3-5 business days.',
    '传统电汇，适用于大额订单。无金额限制，3-5个工作日。'
  )
on conflict (id) do update
set
  provider = excluded.provider,
  name = excluded.name,
  enabled = excluded.enabled,
  countries = excluded.countries,
  currencies = excluded.currencies,
  min_amount_usd = excluded.min_amount_usd,
  sort_order = excluded.sort_order,
  display_instructions_en = excluded.display_instructions_en,
  display_instructions_zh = excluded.display_instructions_zh;

insert into public.bank_accounts (
  id,
  payment_method_id,
  account_name,
  account_number,
  bank_name,
  bank_address,
  swift_code,
  currency,
  fee_bearer
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'UPGRADEGEM TRADING CO LTD',
    'CONFIG_ME',
    'DBS Bank (Hong Kong)',
    'Hong Kong',
    'CONFIG_ME',
    'USD',
    'SHA'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'UPGRADEGEM TRADING CO LTD',
    'CONFIG_ME',
    'HSBC',
    'Hong Kong',
    'CONFIG_ME',
    'USD',
    'SHA'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    'UPGRADEGEM TRADING CO LTD',
    'CONFIG_ME',
    'ICICI Bank',
    'Mumbai, India',
    'CONFIG_ME',
    'USD',
    'SHA'
  )
on conflict (id) do update
set
  payment_method_id = excluded.payment_method_id,
  account_name = excluded.account_name,
  account_number = excluded.account_number,
  bank_name = excluded.bank_name,
  bank_address = excluded.bank_address,
  swift_code = excluded.swift_code,
  currency = excluded.currency,
  fee_bearer = excluded.fee_bearer;
