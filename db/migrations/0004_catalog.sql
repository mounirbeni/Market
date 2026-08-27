-- ============================================================
-- كتالوج المركبات — مرجع الماركات والموديلات
--
-- قبل، لائحة الماركات والموديلات كانت مرفقة مع الكود وحدها.
-- دابا ولّات فقاعدة البيانات: تقدر تزيد ماركة جديدة ولا تصلّح
-- اسم موديل بلا ما تعاود تنشر الموقع.
--
-- هادي معطيات مرجعية — ماكاين لا ثمن لا كيلومتراج لا بائع.
-- الإعلانات الحقيقية كتبقى فجدول `listings`.
-- ============================================================

CREATE TABLE IF NOT EXISTS catalog_brands (
  make          text NOT NULL,
  kind          vehicle_kind NOT NULL DEFAULT 'car',
  country       text,
  parent_group  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (make, kind)
);

CREATE TABLE IF NOT EXISTS catalog_models (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       vehicle_kind NOT NULL DEFAULT 'car',
  make       text NOT NULL,
  model      text NOT NULL,
  -- نوع الهيكل ماكاينش لكل موديل: مصدر الكتالوج ماكيعطيهش،
  -- وأحسن NULL من قيمة مخمّنة
  body       body_type,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, make, model)
);

-- الاقتراحات كتقلّب بالماركة، والقوائم المنسدلة كتقلّب بالنوع
CREATE INDEX IF NOT EXISTS catalog_models_make_idx ON catalog_models (make);
CREATE INDEX IF NOT EXISTS catalog_models_kind_idx ON catalog_models (kind, make);
