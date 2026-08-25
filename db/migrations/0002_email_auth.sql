-- ============================================================
--  التسجيل بالإيميل عوض الهاتف
--
--  الهاتف كيبقى حقل اختياري فالملف الشخصي (للاتصال والواتساب
--  فالإعلان)، ولكن ماشي هو معرّف الدخول.
-- ============================================================

-- 1. الهاتف ولّى اختياري
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- 2. تعمير الإيميلات الناقصة قبل ما نفرضو NOT NULL
--    (صفوف قديمة تدارو قبل هاد الهجرة)
UPDATE users
SET email = 'user-' || left(id::text, 8) || '@triq.local'
WHERE email IS NULL;

-- 3. الإيميل ولّى المعرّف الإجباري
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;

-- الإيميلات كتتخزن بحروف صغيرة، والفهرس الفريد كيمنع التكرار
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

-- 4. otp_codes: العمود ولّى عاماً (إيميل ولا هاتف من بعد)
ALTER TABLE otp_codes RENAME COLUMN phone TO identifier;
DROP INDEX IF EXISTS otp_phone_idx;
CREATE INDEX IF NOT EXISTS otp_identifier_idx ON otp_codes (identifier, created_at DESC);
