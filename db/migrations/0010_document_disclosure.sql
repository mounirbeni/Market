-- ============================================================
-- تصريح البائع بمشاكل الوثائق الإدارية والمالية
--
-- إصلاح الحادث (0009) خاصو نص حر — كل حادث مختلف. ولكن المشاكل
-- الإدارية الشائعة (فينيت، غرامات، رهن بنكي) هي حالات معروفة
-- ومحدودة — مربّع اختيار أسرع وأدق من نص حر، والبائع ماخاصوش
-- يكتب فقرة باش يقول "كاين غرامة".
--
-- الثلاثة بوليان، NOT NULL DEFAULT false: الإعلانات القديمة
-- كتفترض ماكاينش مشكل (البقاء بلا افتراض سلبي أحسن من تخمين).
-- ============================================================

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS unpaid_vignette boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unpaid_fines    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS under_lien      boolean NOT NULL DEFAULT false;
