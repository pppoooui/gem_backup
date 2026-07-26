-- ============================================================================
-- 0013: Replace three testimonial images while preserving the second image.
-- Apply after 0012_price_only_catalog_control.sql.
-- ============================================================================

update public.site_settings
set
  value = jsonb_set(
    jsonb_set(
      jsonb_set(
        value::jsonb,
        '{testimonials,0,image}',
        to_jsonb('/media/testimonial-review-card.jpg'::text),
        false
      ),
      '{testimonials,2,image}',
      to_jsonb('/media/testimonial-packing-table.jpg'::text),
      false
    ),
    '{testimonials,3,image}',
    to_jsonb('/media/testimonial-verified-purchase.jpg'::text),
    false
  )::text,
  updated_at = now()
where key = 'home_content_json'
  and jsonb_typeof(value::jsonb -> 'testimonials') = 'array'
  and jsonb_array_length(value::jsonb -> 'testimonials') >= 4;
