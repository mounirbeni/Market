-- Evidence metadata must survive a listing round trip. NULL means unknown,
-- never a fabricated confidence/sample count for pre-migration listings.
ALTER TABLE listings ADD COLUMN IF NOT EXISTS fair_price_meta jsonb;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_inspection_claimed boolean NOT NULL DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS legacy_technical_control date;

-- Previous inspection flags came from seller checkboxes, not approved reports.
-- Preserve their declarations without presenting them as independent evidence.
UPDATE listings SET seller_inspection_claimed = inspected, inspected = false;
-- These two dates were generated from a checkbox by both seller endpoints.
UPDATE listings SET legacy_technical_control = technical_control, technical_control = NULL
 WHERE technical_control IN (DATE '2026-01-01', DATE '2027-01-01');

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  key_hash text PRIMARY KEY,
  attempts integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_rate_limits_expiry_idx ON auth_rate_limits (expires_at);
CREATE INDEX IF NOT EXISTS admin_attempts_email_idx ON admin_attempts (email, created_at DESC);

-- Live scores prevent a seller verification or a date rollover from leaving
-- search/facets on stale scores. Keep in parity with market.ts (regression tests).
CREATE OR REPLACE FUNCTION listing_trust_score(
  l listings, u users,
  as_of date DEFAULT (now() AT TIME ZONE 'Africa/Casablanca')::date
) RETURNS integer LANGUAGE sql STABLE PARALLEL SAFE AS $$
  WITH inputs AS (
    SELECT extract(year FROM as_of)::int AS yr,
      l.km::numeric / greatest(1, extract(year FROM as_of)::int - l.year) AS kpy,
      CASE WHEN l.kind = 'car' THEN 6000 ELSE 2500 END AS lo,
      CASE WHEN l.kind = 'car' THEN 30000 ELSE 14000 END AS hi,
      (coalesce(l.fair_price_mad, 0) = 0
        OR coalesce((l.fair_price_meta->>'confidence')::numeric, 0) < 0.5
        OR coalesce((l.fair_price_meta->>'sampleSize')::integer, 0) < 3) AS weak,
      (l.price_mad - l.fair_price_mad)::numeric / nullif(l.fair_price_mad, 0) AS delta
  )
  SELECT
    greatest(0, least(20,
      CASE WHEN u.id_verified THEN 8 ELSE 0 END
      + CASE WHEN u.phone_verified THEN 4 ELSE 0 END
      + CASE WHEN u.rating IS NULL THEN 0 ELSE floor(((u.rating - 3.5) / 1.5) * 4 + 0.5)::int END
      + least(4, greatest(0, yr - extract(year FROM u.member_since)::int))))
    + greatest(0,
      CASE WHEN l.papers_ok THEN 8 ELSE 0 END
      + CASE WHEN l.vin_checked THEN 6 ELSE 0 END
      + CASE WHEN l.technical_control >= as_of THEN 6 ELSE 0 END
      - CASE WHEN l.unpaid_vignette THEN 3 ELSE 0 END
      - CASE WHEN l.unpaid_fines THEN 3 ELSE 0 END
      - CASE WHEN l.under_lien THEN 6 ELSE 0 END)
    + CASE WHEN l.service_book THEN 7 ELSE 0 END
    + CASE l.owners WHEN 1 THEN 7 WHEN 2 THEN 5 WHEN 3 THEN 2 ELSE 0 END
    + CASE WHEN l.accident_declared OR EXISTS (
        SELECT 1 FROM listing_history h WHERE h.listing_id = l.id AND h.type = 'accident'
      ) THEN 0 ELSE 4 END
    + least(18,
      CASE WHEN l.photo_count >= 6 THEN 7 WHEN l.photo_count >= 3 THEN 4 ELSE 2 END
      + CASE WHEN l.has_video THEN 4 ELSE 0 END
      + CASE WHEN char_length(l.description) > 220 THEN 3 WHEN char_length(l.description) > 120 THEN 2 ELSE 0 END
      + CASE WHEN cardinality(l.equipment) >= 8 THEN 4 WHEN cardinality(l.equipment) >= 4 THEN 2 ELSE 1 END)
    + CASE WHEN kpy BETWEEN lo AND hi THEN 8 WHEN kpy < lo THEN 3 ELSE 5 END
    + CASE WHEN weak THEN 4 WHEN delta <= -0.14 THEN 2 WHEN delta < 0.14 THEN 6 ELSE 3 END
    + CASE WHEN l.inspected THEN 10 ELSE 0 END
  FROM inputs;
$$;
