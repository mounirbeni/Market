-- ============================================================
-- إفصاح أشمل عن المركبة — لتقليل أسئلة المشترين
--
-- البائع كيعطي دابا: مشاكل حالية معروفة، واش الصباغة أصلية وشحال
-- جزء متصبّغ، عدد المفاتيح، شنو رافق مع المركبة (إطار احتياطي،
-- دفتر الصيانة...)، سبب البيع (اختياري)، وإقرار نهائي بصحة
-- المعلومات قبل النشر.
--
-- known_issues/included_items: نفس نوع equipment بالضبط (نص[]) —
-- بلا حاجة لجدول منفصل. original_paint كيفترض "أصلية" للإعلانات
-- القديمة (بحال unpaid_vignette كيفترض false) — افتراض محايد
-- بلا تخمين سلبي. painted_panels/keys_count بلا افتراض: أرقام
-- كمّية، NULL كيعبّر بصح على "ماشي معروف" فالإعلانات القديمة.
-- ============================================================

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS known_issues    text[]   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS original_paint  boolean  NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS painted_panels  smallint,
  ADD COLUMN IF NOT EXISTS keys_count      smallint,
  ADD COLUMN IF NOT EXISTS included_items  text[]   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sale_reason     text,
  ADD COLUMN IF NOT EXISTS seller_declared boolean  NOT NULL DEFAULT false;
