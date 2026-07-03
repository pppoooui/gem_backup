# External Uptime & Health Monitoring

This document outlines how to configure free external monitoring for the
GEM B2B storefront and admin.

---

## 1. UptimeRobot (30-s price check)

[UptimeRobot](https://uptimerobot.com/) offers up to 50 monitors free with
5-minute checks.

### Monitors to create

| Monitor                  | URL                                          | Type      | Expected |
| ------------------------ | -------------------------------------------- | --------- | -------- |
| Storefront root          | `https://upgradegem.com/en`                  | HTTP(s)   | 200      |
| Products listing         | `https://upgradegem.com/en/products`         | HTTP(s)   | 200      |
| API health               | `https://upgradegem.com/api/health`          | HTTP(s)   | 200      |
| Admin login (avail)      | `https://upgradegem.com/admin/login`         | HTTP(s)   | 200      |

### Health-check endpoint spec

`GET /api/health` returns:

```json
{
  "status": "ok",
  "timestamp": "2026-06-10T11:00:00+08",
  "services": {
    "supabase": "ok"
  }
}
```

Possible `status` values: `ok`, `warn`, `error`.

### Keyword monitor (content validation)

Create a **Keyword monitor** on `https://upgradegem.com/api/health` that:

- **Must contain:** `"status":"ok"`
- Alert if the keyword is missing → indicates the API responded but is returning
  an error status.

### Alert contacts

Configure UptimeRobot to notify:
- WhatsApp (via UptimeRobot integration)
- Email to `ops@upgradegem.com`
- Slack webhook (if team uses it)

---

## 2. Vercel built-in checks (included with deployment)

Every deployment on the Pro plan includes:

- **Deployment Protection** — new deployments stay on a preview URL until
  promoted.
- **Logs & Metrics** — Vercel dashboard → Project → Analytics.
- **Web Vitals** — LCP / FID / CLS are reported automatically.

No extra configuration needed beyond enabling Analytics in the Vercel project
settings.

---

## 3. Supabase status (dashboard)

- Supabase Dashboard → Project → Reports → Database Health.
- Optional: enable [Supabase Logs to external provider](https://supabase.com/docs/guides/platform/logs).

---

## 4. Recommended checklist before going live

- [ ] UptimeRobot monitors created and verified (all four green).
- [ ] `/api/health` keyword check returns `"status":"ok"`.
- [ ] Vercel Analytics enabled.
- [ ] Supabase RLS confirmed on `orders`, `admin_users` tables.
- [ ] Log drain configured (Vercel → Axiom / BetterStack / Datadog if budget
      allows).