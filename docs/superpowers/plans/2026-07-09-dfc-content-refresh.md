# DFC Content Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement every approved recommendation from `网站(1).doc` while preserving the existing UI.

**Architecture:** Centralize public brand/contact defaults, update the existing homepage content model and component order, import the supplied photos as static assets, and add an idempotent Supabase migration so persisted production data matches the code. Keep historical orders untouched and hide catalog products that are not round and colorless.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase/Postgres, Vitest, Playwright

---

### Task 1: Brand, Domain, And Contact Defaults

**Files:**
- Create: `src/lib/site-config.ts`
- Create: `src/lib/site-config.test.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/robots.ts`
- Modify: public pages and admin labels containing the old visible brand

- [ ] Write a failing test asserting the default name, URL, and email are `DFC Cubic Zirconia Factory`, `https://dfccz.top`, and `sales@dfccz.top`.
- [ ] Run `npm test -- src/lib/site-config.test.ts` and confirm failure because the module does not exist.
- [ ] Add typed exported site constants and replace visible old brand/domain/email defaults.
- [ ] Rerun the focused test and search for remaining public old-brand references.

### Task 2: Approved Homepage Copy And Assets

**Files:**
- Create: `public/media/dfc-factory-stock.jpeg`
- Create: `public/media/dfc-factory-sorting.jpeg`
- Create: `public/media/dfc-cz-stock.jpeg`
- Create: `public/media/dfc-customer-vietnam.jpeg`
- Create: `public/media/dfc-hearts-arrows.png`
- Create: `public/media/dfc-hearts-arrows-comparison.png`
- Modify: `src/components/home/home-experience.tsx`
- Modify: `src/lib/home-content.ts`
- Modify: `src/lib/home-content-server.test.ts`

- [ ] Add failing assertions for the approved photos, Vietnam customer, and absence of Dubai/fancy-cut defaults.
- [ ] Run the focused test and confirm the assertions fail against current defaults.
- [ ] Import the original document photos and update bilingual company/factory copy and slogans.
- [ ] Move the factory section before the journey without changing the component styling system.
- [ ] Rerun the focused tests.

### Task 3: Round Colorless Public Catalog

**Files:**
- Create: `src/lib/public-products.ts`
- Create: `src/lib/public-products.test.ts`
- Modify: `src/lib/products-supabase.ts`
- Modify: `src/data/products.ts`
- Modify: affected cart/order fixtures

- [ ] Add failing tests proving non-round and non-colorless products are excluded.
- [ ] Run the focused test and confirm failure because filtering is not implemented.
- [ ] Add a pure public-product predicate/filter and apply it to Supabase and fallback data.
- [ ] Replace the static princess-cut fixture with a round colorless product while retaining stable order behavior.
- [ ] Rerun catalog, cart, and order tests.

### Task 4: Production Supabase Content Migration

**Files:**
- Create: `supabase/migrations/0010_dfc_content_refresh.sql`
- Modify: `supabase/SINGAPORE_SETUP.md`
- Modify: `supabase/check_singapore_status.sql`

- [ ] Add an idempotent migration that updates homepage JSON and marks non-round/non-colorless catalog products inactive.
- [ ] Preserve orders and related historical line items.
- [ ] Add deployment/status queries that verify the new homepage value and public catalog constraints.
- [ ] Review SQL for repeat execution, RLS compatibility, and bounded updates.

### Task 5: Verification And Backup Sync

**Files:**
- Modify: e2e assertions only when old visible copy is encoded in tests.

- [ ] Run old-brand/domain/Dubai searches and review every remaining occurrence.
- [ ] Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
- [ ] Run `npm run test:e2e`.
- [ ] Start the production server and verify English/Chinese homepages and product catalog through the in-app browser at desktop and mobile widths.
- [ ] Sync to `/Users/pppoooui/SynologyD/777Github/gem_backup`, excluding environment files, `node_modules`, `.next`, and test artifacts.
- [ ] Verify the destination diff and provide the SQL and Docker deployment commands.
