# DFC Content Refresh Design

## Goal

Apply the approved recommendations from `网站(1).doc` without redesigning the
existing interface. Rebrand all public-facing content as
`DFC Cubic Zirconia Factory`, use `https://dfccz.top` as the provisional
canonical domain, and use `sales@dfccz.top` as the public contact email.

## Scope

- Preserve the current visual language, responsive layout, controls, and
  storefront workflows.
- Replace visible `DFCgem` branding throughout the public storefront, metadata,
  structured data, admin-facing brand labels, and transactional screens.
- Keep internal code identifiers unchanged when renaming them would add risk
  without changing visible output.
- Replace homepage copy with the approved Chinese and English company and
  factory introductions.
- Use the source photos embedded in the recommendation document for the
  factory, stock, cutting-quality, and customer-proof sections.
- Place the factory introduction before the company journey.
- Change the Dubai customer reference to Vietnam.
- Present only round, colorless cubic zirconia products.
- Place the approved slogans in the hero and final product call-to-action.

## Homepage Structure

1. Header and hero
2. Company profile
3. Factory introduction and authentic factory imagery
4. Company journey
5. Quality and certification proof
6. Customer feedback
7. Product call-to-action
8. Footer

The existing typography, colors, spacing system, and component treatment remain
unchanged except for small responsive adjustments required by the longer brand
name.

## Content

### English company profile

DFC Cubic Zirconia Factory is a professional manufacturer dedicated to Hearts
and Arrows (H&A) cubic zirconia in all standard and custom sizes. With over 20
years of focused expertise, we specialize in 5A-grade CZ that delivers
exceptional brilliance, fire, and light performance, designed to elevate
jewelry collections and increase product value.

DFC delivers value, trust, and long-term partnership, not only gemstones.

### Chinese company profile

DFC 锆石工厂是一家专业生产商，专注生产全常规尺寸及定制尺寸的八心八箭立方氧化锆石。工厂拥有二十余年行业经验，主打 5A 级锆石，以亮度、火彩和透光表现提升首饰系列质感及产品附加值。

DFC 不止提供宝石，也为客户提供长期合作所需的价值与信任。

### Factory introduction

The approved English and Chinese factory text from the recommendation document
will replace the current generic production description.

### Slogans

- Hero: `20 years. Real quality. Real partner.`
- Supporting line: `Vivid Fire CZ, Upgrade Your Designs`
- Product call-to-action: `20 years strong. Always in stock.`

Chinese equivalents will appear on the Chinese locale.

## Product Rules

- Static fallback products must all use round, colorless CZ content and imagery.
- Production Supabase data must not continue publishing non-round or
  non-colorless products after deployment.
- Existing order records remain untouched.
- A new idempotent migration will mark non-conforming catalog products as
  inactive rather than deleting historical records.

## Production Data

The homepage currently accepts content stored in `site_settings`, which can
override code defaults. A new idempotent migration will update the production
homepage JSON to the approved content and asset paths. It will also update the
provisional site URL and brand settings where those settings exist.

## Domain And Contact

- Canonical site URL: `https://dfccz.top`
- Public email: `sales@dfccz.top`
- Sitemap, robots, Open Graph metadata, JSON-LD, page metadata, contact links,
  and visible footer content will use the provisional domain and email.
- Deployment documentation and environment examples will be updated without
  exposing real secrets.

## Error Handling And Compatibility

- Existing Supabase fallback behavior remains available.
- Homepage content merging remains backward compatible with missing fields.
- Existing orders and order tokens are unaffected.
- Product filtering applies only to public catalog visibility and seed/default
  content.

## Verification

- Unit tests for homepage content fallback and public product filtering.
- Search audit for old visible brand, domain, email, and Dubai references.
- ESLint, TypeScript, Vitest, Next.js production build, and Playwright e2e.
- Browser QA on English and Chinese homepages at desktop and mobile widths.
- Confirm hero copy, section order, authentic images, Vietnam customer label,
  round/colorless product catalog, metadata, and contact links.
