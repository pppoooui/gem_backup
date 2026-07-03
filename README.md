# DFCgem

DFCgem is a bilingual B2B cubic-zirconia catalog and quote-order application.
It uses Next.js, TypeScript, Supabase, and Vercel, with token-protected customer
order pages and an authenticated operations dashboard.

## Local development

1. Copy `.env.example` to `.env.local` and fill in the Supabase values.
2. Apply the SQL files in `supabase/migrations/` in numeric order.
3. Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000/en` or `http://localhost:3000/zh`.

## Required production environment

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose it to the browser)
- `SUPABASE_PRODUCT_IMAGE_BUCKET`

WhatsApp notification variables are optional. Customer-facing WhatsApp links
are hidden until `WHATSAPP_VENDOR_PHONE_NUMBER` is configured.

## Verification

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

Playwright runs with Supabase disabled so tests never write into the production
or staging database.

## Deployment

Deploy the app to Vercel in Singapore and set the production environment there.
Use Cloudflare for DNS/CDN. Keep Supabase in Singapore and apply every migration,
including `0007_production_hardening.sql`, before accepting live orders.
