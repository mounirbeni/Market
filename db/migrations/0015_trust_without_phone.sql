-- 0015 — حذف توثيق الهاتف من مؤشر الثقة + النقطة الكاملة للمؤسس فجزء البائع.
--
-- المنصة ماعندهاش مزوّد SMS، فـusers.phone_verified عمرو ما تكتب فيه
-- حتى قيمة true. النتيجة: 4 نقط من 20 فجزء «البائع» كانو مقفولين على
-- الجميع. حيدنا الشرط بالكامل ووزّعنا نقطو على توثيق الهوية (8 → 12)،
-- فالمجموع باقي 20 والنقطة ولات قابلة للكسب بجد.
--
-- المؤسس (users.founder): الحساب الرسمي ديال المنصة — الهوية معروفة
-- والمسؤولية مباشرة، فجزء «البائع» كامل. باقي الأجزاء (الوثائق،
-- الفحص، جودة الإعلان، الثمن) كتبقى مكتسبة بحال أي بائع: الشارة
-- كتشهد على مَن هو البائع، ماشي على السيارة.
--
-- خاصها تبقى فتطابق مع trustScore() فـsrc/lib/market.ts — tests/review.test.ts
-- كيتحقق من التطابق.
-- idempotent: CREATE OR REPLACE + UPDATE بشروط.

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
    CASE WHEN u.founder THEN 20 ELSE greatest(0, least(20,
      CASE WHEN u.id_verified THEN 12 ELSE 0 END
      + CASE WHEN u.rating IS NULL THEN 0 ELSE floor(((u.rating - 3.5) / 1.5) * 4 + 0.5)::int END
      + least(4, greatest(0, yr - extract(year FROM u.member_since)::int)))) END
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

-- هوية المؤسس معروفة للمنصة بحكم كونو صاحبها — id_verified كيعكس واقع،
-- ماشي مجاملة. (باقي المستعملين كيبقاو كيمرّو من طلب توثيق عند الإشراف.)
UPDATE users SET id_verified = true WHERE founder AND NOT id_verified;

-- العمود listings.trust_score موروث: العرض والفرز كيحسبو النقطة حيّة
-- بالدالة فوق (listing_trust_score(l, u) AS trust_score). حتى لا يبقى
-- العمود المخزّن مختلفاً عمّا يراه المستعمل، كنعاودو نحسبوه بالجديدة.
UPDATE listings SET trust_score = fresh.score
  FROM (SELECT l.id, listing_trust_score(l, u) AS score
          FROM listings l JOIN users u ON u.id = l.seller_id
         WHERE l.trust_score IS NOT NULL) fresh
 WHERE listings.id = fresh.id AND listings.trust_score IS DISTINCT FROM fresh.score;
