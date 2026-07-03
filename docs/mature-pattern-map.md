# Mature Pattern Map

This project follows `../001开工前AI汇总建议/004实施方案.md`: borrow mature product patterns, but keep the B2B quote/payment logic custom.

## What We Borrow

| Source | Borrowed In This MVP | Files |
|---|---|---|
| Supabase `with-supabase` | Browser/server Supabase client split, cookie-ready auth shape, environment variables | `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `.env.example` |
| Vercel Commerce | Product grid, product cards, right cart/quote panel, server-rendered routes | `src/components/catalog/catalog-experience.tsx`, `src/app/[locale]/page.tsx` |
| Medusa Next.js Starter | Checkout information architecture: build order first, request final invoice, payment later | cart panel in `src/components/catalog/catalog-experience.tsx` |
| shadcn/ui | Restrained admin surfaces: borders, rows, compact forms, buttons, grouped panels | `src/components/admin/admin-dashboard.tsx` |
| Dribbble / ImageGen concepts | Visual polish: white catalog surface, gemstone photography, deep teal actions, tiny gold accents | `public/design-reference/precision-wholesale-catalog.png`, `public/products/*` |

## What We Do Not Borrow

- Shopify provider, hosted checkout, or retail payment assumptions.
- Medusa backend, Stripe checkout, customer account-first flows.
- One-click dangerous admin fixes or RLS override buttons.
- Luxury jewelry marketing mood, large hero-only landing pages, or copied third-party assets.

## Custom B2B Logic

- Orders start as `pending_quote`.
- Admin confirms inventory, shipping fee, discount, and payment method.
- Customer receives PI/payment instructions over WhatsApp or email.
- Payment proof and manual confirmation are tracked separately.
- RLS and server-side token checks protect order detail access.
