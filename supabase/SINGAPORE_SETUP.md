# DFCgem Singapore Supabase Setup

## 1. First Check

Open Supabase SQL Editor and run:

```sql
-- copy from supabase/check_singapore_status.sql
```

If `has_products` or `has_orders` errors with `relation does not exist`, the database is still fresh or only partly initialized.

## 2. Fresh Database

If this is a new Singapore Supabase project, run these files one by one, in order:

1. `supabase/migrations/0001_mvp_schema.sql`
2. `supabase/migrations/0002_orders_admin_ops.sql`
3. `supabase/migrations/0003_core_tables_and_rls.sql`
4. `supabase/migrations/0004_payment_methods_seed.sql`
5. `supabase/migrations/0005_payment_screenshot.sql`
6. `supabase/migrations/0006_api_grants.sql`
7. `supabase/migrations/0007_production_hardening.sql`
8. `supabase/migrations/0008_storage_and_home_content.sql`
9. `supabase/migrations/0009_reseed_order_number_sequence.sql`

Run them separately in SQL Editor. A successful run means no red error. Some files return a small result table; that is normal.

## 3. Partly Initialized Database

If `products`, `orders`, and `admin_users` already exist, do not rerun `0001_mvp_schema.sql`.

Run these in order instead:

1. `supabase/migrations/0002_orders_admin_ops.sql`
2. `supabase/migrations/0003_core_tables_and_rls.sql`
3. `supabase/migrations/0004_payment_methods_seed.sql`
4. `supabase/migrations/0005_payment_screenshot.sql`
5. `supabase/migrations/0006_api_grants.sql`
6. `supabase/migrations/0007_production_hardening.sql`
7. `supabase/migrations/0008_storage_and_home_content.sql`
8. `supabase/migrations/0009_reseed_order_number_sequence.sql`

`0007_production_hardening.sql` is important. It fixes admin RLS access, creates the server-only order-number function, and removes unsafe public inserts.
`0009_reseed_order_number_sequence.sql` is safe to rerun and prevents order number collisions when older orders already exist.

## 4. Final Check

Run `supabase/check_singapore_status.sql` again.

Expected important values:

- `has_products = true`
- `has_orders = true`
- `has_admin_users = true`
- `has_site_settings = true`
- `has_product_image_assets = true`
- `has_admin_rls_function = true`
- `has_next_order_number = true`
- `has_order_number_seq = true`
- `storage.buckets` has `product-images`
- `site_settings` has `home_content_json`

## 5. Admin User

Create a user in Supabase Authentication first, then run this with your real admin email:

```sql
insert into public.admin_users (id, email, role, is_active)
select id, email, 'superadmin', true
from auth.users
where email = 'YOUR_ADMIN_EMAIL'
on conflict (id) do update
set
  email = excluded.email,
  role = 'superadmin',
  is_active = true;
```

After that, `/admin/login` can use the same email and password.

## 6. Supabase API Settings

Recommended project settings:

- Enable Data API: on
- Automatically expose new tables: off
- Enable automatic RLS: on

The project grants are handled manually by `0006_api_grants.sql` and hardened by `0007_production_hardening.sql`.
