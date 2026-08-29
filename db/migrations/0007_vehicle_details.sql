-- ============================================================
-- الدفع ومصدر السيارة
--
-- صفحة الإعلان كانت كتخمّن «نوع الدفع» من نوع الهيكل (SUV = دفع
-- رباعي، الباقي = دفع أمامي) — تخمين ماشي معطى حقيقي. دابا عمود
-- حقيقي، اختياري، كيتعمر من البائع.
--
-- «مصدر السيارة» ماكانش كاين خالص: مغربية الأصل ولا مستوردة
-- (مؤدى عنها الرسوم الجمركية) — تصنيف بسيط ومعروف فسوق السيارات
-- المغربي.
--
-- الجوج اختياريين (nullable): الإعلانات القديمة ماعندهاش قيمة،
-- والبائع كيقدر يعمرها من صفحة التعديل.
-- ============================================================

DO $$ BEGIN
  CREATE TYPE drivetrain_type AS ENUM ('fwd', 'rwd', 'awd');
  CREATE TYPE origin_type     AS ENUM ('maghribia', 'mostawrada');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE listings ADD COLUMN IF NOT EXISTS drivetrain drivetrain_type;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS origin     origin_type;
