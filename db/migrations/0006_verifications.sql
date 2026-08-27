-- ============================================================
-- توثيق الهوية
--
-- عمود users.id_verified كان كاين من الأول، ولكن ماكانش شي طريق
-- باش يتحط: ماكاينش لا رفع وثيقة لا مراجعة. المشرف كيقدر يضغط
-- «وثّق» بلا ما يشوف حتى شي حاجة — شارة بلا معنى.
--
-- دابا: المستخدم كيرفع الوثيقة، والمشرف كيشوفها وكيقرّر.
--
-- الوثائق حسّاسة: كتّخزن تحت `private/` فالخزّان، ومسار الصور
-- العادي كيرفض هاد البادئة. غير المشرف كيقدر يشوفها.
-- ============================================================

DO $$ BEGIN
  CREATE TYPE verification_kind   AS ENUM ('cin', 'registre');
  CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS verifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind        verification_kind NOT NULL DEFAULT 'cin',
  -- مسار الوثيقة فالخزّان (private/…) — ماشي رابط عام
  doc_path    text NOT NULL,
  doc_back_path text,
  status      verification_status NOT NULL DEFAULT 'pending',
  note        text,                       -- سبب الرفض، كيتشاف للمستخدم
  reviewed_by text,
  reviewed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS verifications_user_idx ON verifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS verifications_open_idx ON verifications (status, created_at)
  WHERE status = 'pending';
