-- 0018 — فصل ثقة الحساب على ثقة الإعلان.
--
-- توثيق الهوية خاص بالحساب (userTrust.ts) وماخاصوش يبدّل نقطة إعلان بعينو.
-- نفس الشي للمؤسس/تقييم البائع/عمر الحساب: مؤشر الإعلان دابا كيقيس غير
-- المعطيات والإثباتات الخاصة بالمركبة والإعلان نفسه.
--
-- التوزيع الجديد = 100 نقطة، كلها قابلة للاكتساب من الإعلان:
--   الوثائق 28 · تاريخ المركبة 24 · شفافية الإعلان 22 · اتساق المعطيات 16 · الفحص 10
--
-- خاصها تبقى فتطابق مع trustScore() فـsrc/lib/market.ts.

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
    -- 1) الوثائق — 28
    greatest(0,
      CASE WHEN l.papers_ok THEN 12 ELSE 0 END
      + CASE WHEN l.vin_checked THEN 6 ELSE 0 END
      + CASE WHEN l.technical_control >= as_of THEN 10 ELSE 0 END
      - CASE WHEN l.unpaid_vignette THEN 3 ELSE 0 END
      - CASE WHEN l.unpaid_fines THEN 3 ELSE 0 END
      - CASE WHEN l.under_lien THEN 6 ELSE 0 END)
    -- 2) تاريخ المركبة — 24
    + CASE WHEN l.service_book THEN 7 ELSE 0 END
    + CASE l.owners WHEN 1 THEN 10 WHEN 2 THEN 7 WHEN 3 THEN 3 ELSE 0 END
    + CASE WHEN l.accident_declared OR EXISTS (
        SELECT 1 FROM listing_history h WHERE h.listing_id = l.id AND h.type = 'accident'
      ) THEN 0 ELSE 7 END
    -- 3) شفافية الإعلان — 22
    + least(22,
      CASE WHEN l.photo_count >= 6 THEN 7 WHEN l.photo_count >= 3 THEN 4 ELSE 2 END
      + CASE WHEN l.has_video THEN 4 ELSE 0 END
      + CASE WHEN char_length(l.description) > 220 THEN 3 WHEN char_length(l.description) > 120 THEN 2 ELSE 0 END
      + CASE WHEN cardinality(l.equipment) >= 8 THEN 4 WHEN cardinality(l.equipment) >= 4 THEN 2 ELSE 1 END
      + CASE WHEN l.seller_declared THEN 4 ELSE 0 END)
    -- 4) اتساق المعطيات — 16
    + CASE WHEN kpy BETWEEN lo AND hi THEN 10 WHEN kpy < lo THEN 4 ELSE 6 END
    + CASE WHEN weak THEN 4 WHEN delta <= -0.14 THEN 2 WHEN delta < 0.14 THEN 6 ELSE 3 END
    -- 5) الفحص المستقل — 10
    + CASE WHEN l.inspected THEN 10 ELSE 0 END
  FROM inputs;
$$;

-- خلّي القيمة المخزنة متطابقة مع الحساب الجديد للإعلانات الموجودة.
UPDATE listings SET trust_score = fresh.score
  FROM (SELECT l.id, listing_trust_score(l, u) AS score
          FROM listings l JOIN users u ON u.id = l.seller_id) fresh
 WHERE listings.id = fresh.id AND listings.trust_score IS DISTINCT FROM fresh.score;
