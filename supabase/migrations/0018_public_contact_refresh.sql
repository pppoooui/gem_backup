-- 0018: publish the requested global WhatsApp, LINE and email contact details.

insert into public.site_settings (
  key, value, label_en, label_zh, description_en, description_zh, updated_at
)
values
  (
    'whatsapp_number',
    '+852 6034 4227',
    'WhatsApp number',
    'WhatsApp 号码',
    'Public WhatsApp sales and order-support number.',
    '公开 WhatsApp 销售与订单支持号码。',
    now()
  ),
  (
    'line_chat_url',
    'https://line.me/ti/p/~85260344227',
    'LINE chat URL',
    'LINE 聊天链接',
    'Public LINE add-friend or chat URL.',
    '前台 LINE 加好友或聊天网址。',
    now()
  ),
  (
    'contact_email',
    'emilydfccz@gmail.com',
    'Contact email',
    '联系邮箱',
    'Public sales contact email.',
    '公开销售联系邮箱。',
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
