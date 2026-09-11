-- 0017 — توحيد الموديلات المكرّرة فالكتالوج + موديلات BMW ناقصة.
--
-- الكتالوج كان فيه نفس الموديل بلغتين: «Série 3» و«3 Series»،
-- «Classe C» و«C-Class»… النتيجة أن نفس السيارة كتتقسّم على
-- مدخلين، والثمن المرجعي كيقارن الموديل بمطابقة نص حرفية
-- (market.ts) — فكل مجموعة كتبقى بلا مقارنات كافية.
--
-- الاتجاه: الإنجليزية هي المعتمدة، حيت هي الأغلبية فالكتالوج
-- (2/4/5/7/8 Series و B-Class/G-Class/S-Class موجودين
-- بالإنجليزية وحدها).
--
-- «X5 PHEV» ماشي موديل: PHEV نوع محرك، وعمود fuel كيغطيه وعندو
-- فلتر ديجا. فكيندمج مع X5.
--
-- idempotent: كل خطوة مشروطة، والتشغيل مرّتين ماكيبدّل والو.

-- 1) الإعلانات كتّحوّل للكتابة المعتمدة قبل حذف المدخل المكرّر،
--    باش مايبقى حتى إعلان كيشير لموديل ماكاينش فالكتالوج.
UPDATE listings l SET model = d.canonical
  FROM (VALUES
    ('BMW',      'Série 1',  '1 Series'),
    ('BMW',      'Série 3',  '3 Series'),
    ('BMW',      'X5 PHEV',  'X5'),
    ('Mercedes', 'Classe A', 'A-Class'),
    ('Mercedes', 'Classe C', 'C-Class'),
    ('Mercedes', 'Classe E', 'E-Class')
  ) AS d(make, duplicate, canonical)
 WHERE l.make = d.make AND l.model = d.duplicate;

-- 2) حذف المدخلات المكرّرة — غير إلا كانت المعتمدة موجودة فعلاً
DELETE FROM catalog_models c
 USING (VALUES
    ('BMW',      'Série 1',  '1 Series'),
    ('BMW',      'Série 3',  '3 Series'),
    ('BMW',      'X5 PHEV',  'X5'),
    ('Mercedes', 'Classe A', 'A-Class'),
    ('Mercedes', 'Classe C', 'C-Class'),
    ('Mercedes', 'Classe E', 'E-Class')
 ) AS d(make, duplicate, canonical)
 WHERE c.kind = 'car' AND c.make = d.make AND c.model = d.duplicate
   AND EXISTS (SELECT 1 FROM catalog_models k
                WHERE k.kind = 'car' AND k.make = d.make AND k.model = d.canonical);

-- 3) موديلات BMW ناقصة — خطوط موديلات حقيقية، ماشي نسخ محرك.
--    (M3/M5… نسخ داخل الموديل، وكتتكتب فخانة «النسخة».)
INSERT INTO catalog_models (kind, make, model)
SELECT 'car', 'BMW', m FROM (VALUES
  ('6 Series'), ('Z3'), ('i3'), ('i8'), ('iX1'), ('iX2'), ('iX3')
) AS t(m)
ON CONFLICT (kind, make, model) DO NOTHING;
