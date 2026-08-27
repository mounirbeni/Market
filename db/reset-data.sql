-- ============================================================
-- تفريغ البيانات — المخطط كيبقى كما هو
--
-- كيمسح كل الإعلانات والحسابات والمحادثات اللي دخلو فمرحلة
-- التجريب. الجداول والفهارس والهجرات ماكيتمسّوش، فالموقع كيبقى
-- خدّام ملي يسالي — غير خاوي.
--
-- ⚠ ماكاينش رجوع. شغّلو غير ملي تكون متأكّد.
--
-- الاستعمال: Neon SQL Editor → لصق → Run
-- ============================================================

BEGIN;

-- TRUNCATE … CASCADE كيمسح حتى الجداول المرتبطة (الصور، السجل،
-- الرسائل…) فضربة وحدة، وRESTART IDENTITY كيرجّع عدّاد المراجع
-- للصفر باش أول إعلان جديد يبدا من c1000.
TRUNCATE TABLE
  listing_views,
  price_history,
  listing_history,
  listing_media,
  promotions,
  reports,
  appointments,
  messages,
  threads,
  notifications,
  saved_searches,
  favorites,
  listings,
  dealers,
  sessions,
  otp_codes,
  users
RESTART IDENTITY CASCADE;

COMMIT;

-- التأكيد: خاص كلشي يكون 0
SELECT 'users' t, count(*) n FROM users
UNION ALL SELECT 'dealers', count(*) FROM dealers
UNION ALL SELECT 'listings', count(*) FROM listings
UNION ALL SELECT 'listing_media', count(*) FROM listing_media
UNION ALL SELECT 'threads', count(*) FROM threads
ORDER BY t;
