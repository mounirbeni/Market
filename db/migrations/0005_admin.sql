-- ============================================================
-- لوحة الإشراف — دخول مستقل
--
-- المشرف ماكيدخلش بحساب عادي: عندو دخول ديالو (كلمة سر + رمز
-- للإيميل) وجلسة منفصلة بكوكي آخر. حتى إلا تسرّبات جلسة مستخدم
-- عادي، ماكتعطي حتى صلاحية إشراف.
--
-- الإيميلات المسموحة كيجيو من ADMIN_EMAILS وكلمة السر من
-- ADMIN_PASSWORD_HASH — متغيّرات بيئة، ماشي صفوف فالقاعدة.
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  token_hash  text NOT NULL UNIQUE,          -- ماكنخزنوش الرمز خام
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_sessions_exp_idx ON admin_sessions (expires_at);

-- محاولات الدخول — باش نوقفو التخمين على كلمة السر
CREATE TABLE IF NOT EXISTS admin_attempts (
  id         bigserial PRIMARY KEY,
  email      text,
  ok         boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_attempts_idx ON admin_attempts (created_at DESC);

-- سجل الإجراءات: شكون دار شنو وفوقاش.
-- إجراء ديال مشرف على حساب ولا إعلان خاصو يبقى ليه أثر.
CREATE TABLE IF NOT EXISTS admin_log (
  id         bigserial PRIMARY KEY,
  email      text NOT NULL,
  action     text NOT NULL,
  target     text,
  detail     text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_log_idx ON admin_log (created_at DESC);
