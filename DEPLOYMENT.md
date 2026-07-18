# DFC Cubic Zirconia Factory Production Checklist

## Supabase

- Use the Singapore region.
- Enable Data API.
- Disable automatic exposure of new tables.
- Enable automatic RLS for new public tables.
- Run `supabase/migrations/0001_*.sql` through `0011_*.sql` in order.
- Confirm `anon` can select published products, variants, enabled payment methods,
  categories, exchange rates, and public site settings only. Public price tiers
  remain inaccessible while `catalog_show_prices` is false.
- Confirm `anon` cannot insert customers, orders, order items, or payment records.
- Create staff users in Supabase Authentication, then add matching UUID rows to
  `public.admin_users`. Do not place the service-role key in browser code.

## Vercel

- Import this repository and choose the Singapore execution region (`sin1`).
- Add every required variable from `.env.example`.
- Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.
- Keep `SUPABASE_SERVICE_ROLE_KEY` available only to Production and Preview
  server environments.
- Run the production build before promoting a deployment.

## Cloudflare

- Point the final domain to Vercel and keep SSL mode at Full (strict).
- Cache static Next.js assets and product media; do not cache `/api/*`, `/admin/*`,
  checkout, cart, or tokenized order pages.
- Add rate limits for `POST /api/orders` and admin login attempts.

## Launch verification

- Place one small test quote and open its tokenized customer order URL.
- Confirm the order appears in the authenticated admin dashboard.
- Update status, shipping fee, discount, and payment provider.
- Confirm an invalid order token returns no customer data.
- Confirm WhatsApp links are hidden until a real vendor number is configured.
- Submit one homepage inquiry and confirm it appears at `/admin/inquiries`.
- Replace provisional certificates, company facts, and contact copy with verified
  business information before public promotion.
