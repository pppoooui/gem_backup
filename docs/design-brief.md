# UpgradeGem MVP Design Brief

Reference visual: `public/design-reference/precision-wholesale-catalog.png`

## Direction

First version uses the Precision Wholesale Catalog direction: a mature B2B product catalog with left filters, product grid, MOQ/tier prices, and a right quote-cart panel.

## Borrowed Mature Patterns

- Supabase-style server/browser client split for auth and cookies.
- Vercel Commerce style product grid and cart surface.
- Medusa-style checkout language: request invoice first, payment later.
- shadcn-like restrained tables, buttons, forms, borders, and toast-ready surfaces.

## MVP Scope

- `/en` and `/zh` storefront catalog.
- `/en/products` mirrors the catalog path.
- `/admin` novice operations dashboard.
- `/admin/login` Supabase-auth-ready login shell.
- `/api/health` internal health endpoint for uptime monitoring.
- `supabase/migrations/0001_mvp_schema.sql` starter schema with RLS enabled.
