-- ============================================================
--  طريق — المخطط الأولي
--  Postgres 16+ (Neon)
--
--  ملاحظات تصميم:
--  · trust_score و fair_price_delta محسوبة ومخزّنة كأعمدة حيت
--    كتُستعمل فـWHERE وORDER BY. حسابها فوقت القراءة كيقتل الأداء.
--  · الأثمنة بالسنتيم (integer) ماشي float — باش مايكونش خطأ تقريب.
--  · كل جدول عندو created_at/updated_at.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- بحث جزئي على أسماء الماركات
CREATE EXTENSION IF NOT EXISTS unaccent;     -- Citroën -> citroen

-- unaccent() هي STABLE ماشي IMMUTABLE فماتنفعش مباشرة فالفهارس.
-- هاد الغلاف كيثبّت القاموس فكيولّي الاستدعاء حتمي.
CREATE OR REPLACE FUNCTION latin_fold(text) RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
$$ SELECT lower(public.unaccent('public.unaccent'::regdictionary, $1)) $$;

-- ---------- أنواع محدّدة ----------
DO $$ BEGIN
  CREATE TYPE vehicle_kind  AS ENUM ('car','moto');
  CREATE TYPE fuel_type     AS ENUM ('diesel','essence','hybride','electrique');
  CREATE TYPE gearbox_type  AS ENUM ('manuelle','automatique');
  CREATE TYPE body_type     AS ENUM ('citadine','berline','suv','break','utilitaire',
                                     'cabriolet','scooter','roadster','trail','sportive','custom');
  CREATE TYPE condition_type AS ENUM ('excellent','tres-bon','bon','moyen');
  CREATE TYPE seller_type   AS ENUM ('particulier','professionnel');
  CREATE TYPE listing_status AS ENUM ('draft','pending','active','sold','expired','rejected');
  CREATE TYPE promo_tier    AS ENUM ('featured','urgent','top');
  CREATE TYPE history_type  AS ENUM ('mise-en-circulation','proprietaire','entretien',
                                     'visite','accident','km');
  CREATE TYPE media_kind    AS ENUM ('photo','video');
  CREATE TYPE report_reason AS ENUM ('fake','sold','price','photos','papers',
                                     'deposit','duplicate','other');
  CREATE TYPE report_status AS ENUM ('open','reviewing','actioned','dismissed');
  CREATE TYPE notif_type    AS ENUM ('message','price-drop','listing','appointment','system');
  CREATE TYPE appt_status   AS ENUM ('pending','confirmed','done','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- المستخدمون ----------
CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           text UNIQUE NOT NULL,              -- E.164: +2126…
  phone_verified  boolean NOT NULL DEFAULT false,
  email           text UNIQUE,
  name            text NOT NULL,
  password_hash   text,                              -- NULL = دخول بالـOTP فقط
  type            seller_type NOT NULL DEFAULT 'particulier',
  city            text,
  id_verified     boolean NOT NULL DEFAULT false,    -- البطاقة الوطنية / السجل التجاري
  avatar_url      text,
  -- سمعة محسوبة من التقييمات
  rating          numeric(2,1),
  sales_count     integer NOT NULL DEFAULT 0,
  response_minutes integer,
  member_since    date NOT NULL DEFAULT CURRENT_DATE,
  banned_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_city_idx ON users (city);

-- ---------- المعارض ----------
CREATE TABLE IF NOT EXISTS dealers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  tagline     text,
  about       text,
  address     text,
  hours       text,
  city        text NOT NULL,
  lat         numeric(9,6),
  lng         numeric(9,6),
  verified    boolean NOT NULL DEFAULT false,
  brands      text[] NOT NULL DEFAULT '{}',
  logo_url    text,
  cover_from  text,
  cover_to    text,
  -- الاشتراك
  plan            text NOT NULL DEFAULT 'free',
  plan_expires_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS dealers_city_idx ON dealers (city);

-- ---------- الإعلانات ----------
CREATE TABLE IF NOT EXISTS listings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref             text UNIQUE NOT NULL,              -- c001 — مرجع قصير للعرض
  slug            text UNIQUE NOT NULL,              -- bmw-serie-3-2016-c041
  seller_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dealer_id       uuid REFERENCES dealers(id) ON DELETE SET NULL,
  status          listing_status NOT NULL DEFAULT 'draft',

  kind            vehicle_kind NOT NULL,
  make            text NOT NULL,
  model           text NOT NULL,
  version         text NOT NULL DEFAULT '',
  year            smallint NOT NULL CHECK (year BETWEEN 1950 AND 2100),
  km              integer NOT NULL CHECK (km >= 0),
  price_mad       integer NOT NULL CHECK (price_mad > 0),   -- درهم كامل
  owners          smallint NOT NULL DEFAULT 1,

  fuel            fuel_type NOT NULL,
  gearbox         gearbox_type NOT NULL,
  body            body_type NOT NULL,
  fiscal_power    smallint NOT NULL,
  consumption     numeric(4,1),
  displacement    integer,
  doors           smallint,
  color           text,
  city            text NOT NULL,

  condition       condition_type NOT NULL,
  first_hand      boolean NOT NULL DEFAULT false,
  papers_ok       boolean NOT NULL DEFAULT true,
  technical_control date,
  inspected       boolean NOT NULL DEFAULT false,
  service_book    boolean NOT NULL DEFAULT false,
  vin_checked     boolean NOT NULL DEFAULT false,
  vin             text,

  description     text NOT NULL DEFAULT '',
  equipment       text[] NOT NULL DEFAULT '{}',
  negotiable      boolean NOT NULL DEFAULT true,
  exchange_accepted boolean NOT NULL DEFAULT false,

  -- قيم محسوبة ومخزّنة (كتُستعمل فالفلترة والترتيب)
  trust_score       smallint,
  fair_price_mad    integer,
  fair_price_delta  numeric(5,4),                    -- -0.1842 = تحت المرجع بـ18.42٪
  photo_count       smallint NOT NULL DEFAULT 0,
  has_video         boolean NOT NULL DEFAULT false,

  -- الترويج
  promo             promo_tier,
  promo_expires_at  timestamptz,

  views           integer NOT NULL DEFAULT 0,
  saves           integer NOT NULL DEFAULT 0,

  published_at    timestamptz,
  expires_at      timestamptz,
  sold_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- فهارس البحث والفلترة
CREATE INDEX IF NOT EXISTS listings_live_idx      ON listings (status, published_at DESC)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS listings_kind_idx      ON listings (kind, status);
CREATE INDEX IF NOT EXISTS listings_make_idx      ON listings (make, model);
CREATE INDEX IF NOT EXISTS listings_city_idx      ON listings (city);
CREATE INDEX IF NOT EXISTS listings_price_idx     ON listings (price_mad);
CREATE INDEX IF NOT EXISTS listings_year_idx      ON listings (year);
CREATE INDEX IF NOT EXISTS listings_km_idx        ON listings (km);
CREATE INDEX IF NOT EXISTS listings_trust_idx     ON listings (trust_score DESC);
CREATE INDEX IF NOT EXISTS listings_deal_idx      ON listings (fair_price_delta);
CREATE INDEX IF NOT EXISTS listings_seller_idx    ON listings (seller_id, status);
CREATE INDEX IF NOT EXISTS listings_dealer_idx    ON listings (dealer_id) WHERE dealer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS listings_promo_idx     ON listings (promo, promo_expires_at)
  WHERE promo IS NOT NULL;
-- بحث جزئي على «Dacia Logan» بلا حساسية للواصلات
CREATE INDEX IF NOT EXISTS listings_search_trgm_idx ON listings
  USING gin (latin_fold(make || ' ' || model || ' ' || version) gin_trgm_ops);

-- ---------- الصور والفيديو ----------
CREATE TABLE IF NOT EXISTS listing_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  kind        media_kind NOT NULL DEFAULT 'photo',
  url         text NOT NULL,
  thumb_url   text,
  width       integer,
  height      integer,
  bytes       integer,
  position    smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_listing_idx ON listing_media (listing_id, position);

-- ---------- سجل المركبة ----------
CREATE TABLE IF NOT EXISTS listing_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  event_date  date NOT NULL,
  type        history_type NOT NULL,
  label       text NOT NULL,
  km          integer,
  detail      text
);
CREATE INDEX IF NOT EXISTS history_listing_idx ON listing_history (listing_id, event_date);

-- ---------- تاريخ الأثمنة (لتنبيه انخفاض السعر) ----------
CREATE TABLE IF NOT EXISTS price_history (
  id          bigserial PRIMARY KEY,
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price_mad   integer NOT NULL,
  changed_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS price_history_listing_idx ON price_history (listing_id, changed_at DESC);

-- ---------- المفضلة وتنبيه السعر ----------
CREATE TABLE IF NOT EXISTS favorites (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price_watch boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);
CREATE INDEX IF NOT EXISTS favorites_watch_idx ON favorites (listing_id) WHERE price_watch;

-- ---------- البحوث المحفوظة ----------
CREATE TABLE IF NOT EXISTS saved_searches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       text NOT NULL,
  query       text NOT NULL,                          -- querystring ديال الفلاتر
  alert       boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS saved_searches_user_idx ON saved_searches (user_id);

-- ---------- المحادثات ----------
CREATE TABLE IF NOT EXISTS threads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_at     timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, buyer_id)
);
CREATE INDEX IF NOT EXISTS threads_buyer_idx  ON threads (buyer_id, last_at DESC);
CREATE INDEX IF NOT EXISTS threads_seller_idx ON threads (seller_id, last_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id          bigserial PRIMARY KEY,
  thread_id   uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        text NOT NULL,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_thread_idx ON messages (thread_id, created_at);

-- ---------- المواعيد ----------
CREATE TABLE IF NOT EXISTS appointments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  place       text,
  status      appt_status NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS appointments_seller_idx ON appointments (seller_id, scheduled_at);

-- ---------- التبليغات ----------
CREATE TABLE IF NOT EXISTS reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reason      report_reason NOT NULL,
  note        text,
  status      report_status NOT NULL DEFAULT 'open',
  handled_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  handled_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reports_open_idx ON reports (status, created_at) WHERE status = 'open';

-- ---------- الإشعارات ----------
CREATE TABLE IF NOT EXISTS notifications (
  id          bigserial PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notif_type NOT NULL,
  title       text NOT NULL,
  body        text,
  href        text,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications (user_id, created_at DESC);

-- ---------- طلبات الترويج والأداء ----------
CREATE TABLE IF NOT EXISTS promotions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier        promo_tier NOT NULL,
  amount_mad  integer NOT NULL,
  days        smallint NOT NULL,
  -- الأداء
  provider    text,                                   -- cmi | stripe | manual
  provider_ref text,
  paid_at     timestamptz,
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS promotions_listing_idx ON promotions (listing_id, ends_at DESC);

-- ---------- رموز OTP ----------
CREATE TABLE IF NOT EXISTS otp_codes (
  id          bigserial PRIMARY KEY,
  phone       text NOT NULL,
  code_hash   text NOT NULL,                          -- ماكنخزنوش الرمز خام
  attempts    smallint NOT NULL DEFAULT 0,
  expires_at  timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS otp_phone_idx ON otp_codes (phone, created_at DESC);

-- ---------- الجلسات ----------
CREATE TABLE IF NOT EXISTS sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  text UNIQUE NOT NULL,
  user_agent  text,
  ip          inet,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);

-- ---------- تتبّع المشاهدات (لمنع التضخيم) ----------
CREATE TABLE IF NOT EXISTS listing_views (
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  day         date NOT NULL,
  visitor_key text NOT NULL,                          -- hash(ip+ua) ماشي معطى شخصي
  PRIMARY KEY (listing_id, day, visitor_key)
);

-- ---------- تحديث updated_at تلقائياً ----------
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','dealers','listings'] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I_touch ON %I; '
      'CREATE TRIGGER %I_touch BEFORE UPDATE ON %I '
      'FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t, t, t, t);
  END LOOP;
END $$;

-- ---------- تسجيل الهجرات ----------
CREATE TABLE IF NOT EXISTS schema_migrations (
  name       text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
