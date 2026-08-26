-- ============================================================
--  طريق (TRIQ) — قاعدة البيانات كاملة
--
--  الصق هادشي كامل فـ Neon → SQL Editor واضغط Run.
--  كيصاوب 18 جدول و54 فهرس و14 نوع، وكيعمّرهم بـ104 إعلان.
--
--  المحتوى: 18 جدول، 54 فهرس، 14 نوع، ثم البيانات:
--    16 مستخدم · 9 معارض · 104 إعلان · 693 حدث سجل · 151 ثمن
--
--  كيسجّل الهجرات الثلاثة فـschema_migrations، فالتطبيق ماغاديش
--  يعاود يطبّقهم.
--
--  ⚠ كيتّدار مرة وحدة على قاعدة خاوية. إلا كانت الجداول كاينة،
--    الإدراجات غادي تطيح على المفاتيح المكررة.
--
--  مولّد بـ:
--    npm run db:setup                       # على قاعدة خاوية
--    pg_dump "$DATABASE_URL" --no-owner --no-privileges \
--            --no-comments --inserts --rows-per-insert=50
--    (وحيّد سطور \restrict و \unrestrict — هادوك ديال psql)
-- ============================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: appt_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.appt_status AS ENUM (
    'pending',
    'confirmed',
    'done',
    'cancelled'
);


--
-- Name: body_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.body_type AS ENUM (
    'citadine',
    'berline',
    'suv',
    'break',
    'utilitaire',
    'cabriolet',
    'scooter',
    'roadster',
    'trail',
    'sportive',
    'custom'
);


--
-- Name: condition_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.condition_type AS ENUM (
    'excellent',
    'tres-bon',
    'bon',
    'moyen'
);


--
-- Name: fuel_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.fuel_type AS ENUM (
    'diesel',
    'essence',
    'hybride',
    'electrique'
);


--
-- Name: gearbox_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gearbox_type AS ENUM (
    'manuelle',
    'automatique'
);


--
-- Name: history_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.history_type AS ENUM (
    'mise-en-circulation',
    'proprietaire',
    'entretien',
    'visite',
    'accident',
    'km'
);


--
-- Name: listing_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.listing_status AS ENUM (
    'draft',
    'pending',
    'active',
    'sold',
    'expired',
    'rejected'
);


--
-- Name: media_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.media_kind AS ENUM (
    'photo',
    'video'
);


--
-- Name: notif_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notif_type AS ENUM (
    'message',
    'price-drop',
    'listing',
    'appointment',
    'system'
);


--
-- Name: promo_tier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.promo_tier AS ENUM (
    'featured',
    'urgent',
    'top'
);


--
-- Name: report_reason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_reason AS ENUM (
    'fake',
    'sold',
    'price',
    'photos',
    'papers',
    'deposit',
    'duplicate',
    'other'
);


--
-- Name: report_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_status AS ENUM (
    'open',
    'reviewing',
    'actioned',
    'dismissed'
);


--
-- Name: seller_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.seller_type AS ENUM (
    'particulier',
    'professionnel'
);


--
-- Name: vehicle_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vehicle_kind AS ENUM (
    'car',
    'moto'
);


--
-- Name: latin_fold(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.latin_fold(text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    AS $_$ SELECT lower(public.unaccent('public.unaccent'::regdictionary, $1)) $_$;


--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    buyer_id uuid NOT NULL,
    seller_id uuid NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    place text,
    status public.appt_status DEFAULT 'pending'::public.appt_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: dealers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dealers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    tagline text,
    about text,
    address text,
    hours text,
    city text NOT NULL,
    lat numeric(9,6),
    lng numeric(9,6),
    verified boolean DEFAULT false NOT NULL,
    brands text[] DEFAULT '{}'::text[] NOT NULL,
    logo_url text,
    cover_from text,
    cover_to text,
    plan text DEFAULT 'free'::text NOT NULL,
    plan_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    user_id uuid NOT NULL,
    listing_id uuid NOT NULL,
    price_watch boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: listing_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listing_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    event_date date NOT NULL,
    type public.history_type NOT NULL,
    label text NOT NULL,
    km integer,
    detail text
);


--
-- Name: listing_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listing_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    kind public.media_kind DEFAULT 'photo'::public.media_kind NOT NULL,
    url text NOT NULL,
    thumb_url text,
    width integer,
    height integer,
    bytes integer,
    "position" smallint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: listing_ref_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.listing_ref_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: listing_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listing_views (
    listing_id uuid NOT NULL,
    day date NOT NULL,
    visitor_key text NOT NULL
);


--
-- Name: listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ref text NOT NULL,
    slug text NOT NULL,
    seller_id uuid NOT NULL,
    dealer_id uuid,
    status public.listing_status DEFAULT 'draft'::public.listing_status NOT NULL,
    kind public.vehicle_kind NOT NULL,
    make text NOT NULL,
    model text NOT NULL,
    version text DEFAULT ''::text NOT NULL,
    year smallint NOT NULL,
    km integer NOT NULL,
    price_mad integer NOT NULL,
    owners smallint DEFAULT 1 NOT NULL,
    fuel public.fuel_type NOT NULL,
    gearbox public.gearbox_type NOT NULL,
    body public.body_type NOT NULL,
    fiscal_power smallint NOT NULL,
    consumption numeric(4,1),
    displacement integer,
    doors smallint,
    color text,
    city text NOT NULL,
    condition public.condition_type NOT NULL,
    first_hand boolean DEFAULT false NOT NULL,
    papers_ok boolean DEFAULT true NOT NULL,
    technical_control date,
    inspected boolean DEFAULT false NOT NULL,
    service_book boolean DEFAULT false NOT NULL,
    vin_checked boolean DEFAULT false NOT NULL,
    vin text,
    description text DEFAULT ''::text NOT NULL,
    equipment text[] DEFAULT '{}'::text[] NOT NULL,
    negotiable boolean DEFAULT true NOT NULL,
    exchange_accepted boolean DEFAULT false NOT NULL,
    trust_score smallint,
    fair_price_mad integer,
    fair_price_delta numeric(5,4),
    photo_count smallint DEFAULT 0 NOT NULL,
    has_video boolean DEFAULT false NOT NULL,
    promo public.promo_tier,
    promo_expires_at timestamp with time zone,
    views integer DEFAULT 0 NOT NULL,
    saves integer DEFAULT 0 NOT NULL,
    published_at timestamp with time zone,
    expires_at timestamp with time zone,
    sold_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT listings_km_check CHECK ((km >= 0)),
    CONSTRAINT listings_price_mad_check CHECK ((price_mad > 0)),
    CONSTRAINT listings_year_check CHECK (((year >= 1950) AND (year <= 2100)))
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    thread_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    body text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    type public.notif_type NOT NULL,
    title text NOT NULL,
    body text,
    href text,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: otp_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_codes (
    id bigint NOT NULL,
    identifier text NOT NULL,
    code_hash text NOT NULL,
    attempts smallint DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: otp_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.otp_codes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: otp_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.otp_codes_id_seq OWNED BY public.otp_codes.id;


--
-- Name: price_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_history (
    id bigint NOT NULL,
    listing_id uuid NOT NULL,
    price_mad integer NOT NULL,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: price_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.price_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: price_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.price_history_id_seq OWNED BY public.price_history.id;


--
-- Name: promotions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    user_id uuid NOT NULL,
    tier public.promo_tier NOT NULL,
    amount_mad integer NOT NULL,
    days smallint NOT NULL,
    provider text,
    provider_ref text,
    paid_at timestamp with time zone,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    reporter_id uuid,
    reason public.report_reason NOT NULL,
    note text,
    status public.report_status DEFAULT 'open'::public.report_status NOT NULL,
    handled_by uuid,
    handled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: saved_searches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_searches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    label text NOT NULL,
    query text NOT NULL,
    alert boolean DEFAULT true NOT NULL,
    last_run_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    name text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    user_agent text,
    ip inet,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    buyer_id uuid NOT NULL,
    seller_id uuid NOT NULL,
    last_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    phone text,
    phone_verified boolean DEFAULT false NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password_hash text,
    type public.seller_type DEFAULT 'particulier'::public.seller_type NOT NULL,
    city text,
    id_verified boolean DEFAULT false NOT NULL,
    avatar_url text,
    rating numeric(2,1),
    sales_count integer DEFAULT 0 NOT NULL,
    response_minutes integer,
    member_since date DEFAULT CURRENT_DATE NOT NULL,
    banned_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    email_verified boolean DEFAULT false NOT NULL
);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: otp_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes ALTER COLUMN id SET DEFAULT nextval('public.otp_codes_id_seq'::regclass);


--
-- Name: price_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_history ALTER COLUMN id SET DEFAULT nextval('public.price_history_id_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: dealers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.dealers VALUES
	('494a2b05-dd36-4ec5-9977-e664d03a55f8', 'af266ff1-a7ab-4e04-8d29-5b4f7dc48f92', 'auto-plus-casa', 'أوطو بلاص كازا', 'وكالة سيارات مستعملة معتمدة', 'أوطو بلاص كازا معرض متخصص فالسيارات المستعملة المفحوصة، خدام من 2014. كل مركبة كتدوز من فحص 120 نقطة قبل ما تُعرض، وكنوفرو ضمان ميكانيكي 3 شهور على المحرك وناقل الحركة.', 'زنقة الزرقطوني، الدار البيضاء', 'الإثنين ـ السبت · 9:00 — 19:00', 'casablanca', NULL, NULL, true, '{Dacia,Renault,Peugeot,Volkswagen,Kia}', NULL, '#0d2a55', '#1f5fe0', 'free', NULL, '2026-08-26 14:44:18.024161+00', '2026-08-26 14:44:18.024161+00'),
	('1abf2c18-885b-4d44-aea4-6494a93412df', '89d64bb6-01a3-4c1a-b40e-3755e2be86a1', 'garage-atlas-marrakech', 'كراج الأطلس', 'بيع وشراء وتبادل', 'كراج الأطلس فمراكش، متخصص فالسيارات العائلية والدفع الرباعي. كنقبلو التبادل، وكل مركبة كتدوز من فحص قبل ما تُعرض.', 'شارع محمد السادس، مراكش', 'كل يوم · 8:30 — 20:00', 'marrakech', NULL, NULL, true, '{Dacia,Toyota,Hyundai,Nissan}', NULL, '#123a72', '#2f7dff', 'free', NULL, '2026-08-26 14:44:18.025655+00', '2026-08-26 14:44:18.025655+00'),
	('71fa13ec-2186-4ca9-b251-637d2d889caf', 'f6c8d3f6-bf53-4ce4-a951-15ad5084206e', 'siyarat-chamal-tanger', 'سيارات الشمال', 'أكبر مخزون فالشمال', 'سيارات الشمال بطنجة، أكثر من 12 سنة فالسوق. مخزون دائم يفوق 80 مركبة، مع خدمة توصيل لكل مدن الشمال.', 'طريق تطوان، طنجة', 'الإثنين ـ السبت · 9:00 — 18:30', 'tanger', NULL, NULL, true, '{Volkswagen,Mercedes,BMW,Audi,Seat}', NULL, '#0a1e3d', '#1550cc', 'free', NULL, '2026-08-26 14:44:18.026658+00', '2026-08-26 14:44:18.026658+00'),
	('259445a0-69da-4bab-8642-b9f29bcdbd08', 'd3ad54b8-e01a-4140-98a4-b714c12ec3dc', 'auto-souss-agadir', 'أوطو سوس', 'سيارات مضمونة بأثمنة معقولة', 'أوطو سوس بأكادير، متخصص فالسيارات الاقتصادية والمدينية. كل إعلان معاه تقرير حالة مفصّل.', 'شارع الحسن الثاني، أكادير', 'الإثنين ـ الجمعة · 9:00 — 19:00 · السبت · 9:00 — 14:00', 'agadir', NULL, NULL, true, '{Hyundai,Kia,Dacia,Suzuki}', NULL, '#0e2b56', '#2f7dff', 'free', NULL, '2026-08-26 14:44:18.027383+00', '2026-08-26 14:44:18.027383+00'),
	('3535a2d7-ed03-452b-886f-e17d182246cd', '80f06af8-1897-4a45-a7fd-0b42d16d3a05', 'motor-house-casa', 'موتور هاوس', 'دراجات نارية حصرياً', 'موتور هاوس أول معرض بالدار البيضاء متخصص كامل فالدراجات النارية: رياضية، طرق وعرة، سكوتر. كنوفرو الصيانة وقطع الغيار الأصلية.', 'بولفار غاندي، الدار البيضاء', 'الإثنين ـ السبت · 9:30 — 19:30', 'casablanca', NULL, NULL, true, '{Yamaha,Honda,Kawasaki,KTM,Benelli}', NULL, '#101c3d', '#2f7dff', 'free', NULL, '2026-08-26 14:44:18.028024+00', '2026-08-26 14:44:18.028024+00'),
	('326aa189-4b6f-469e-b170-305be968d099', 'd4b28e5b-0c52-4fdd-a238-bf58af0b4ec2', 'rahma-car-oujda', 'الرحمة كار', 'ثقة من 2019', 'الرحمة كار بوجدة، بيع وشراء السيارات المستعملة مع تسهيلات فالأداء ومساعدة فإجراءات التحويل.', 'شارع محمد الخامس، وجدة', 'الإثنين ـ السبت · 9:00 — 19:00', 'oujda', NULL, NULL, true, '{Fiat,Peugeot,Citroën,Renault}', NULL, '#0d2a55', '#1f5fe0', 'free', NULL, '2026-08-26 14:44:18.028638+00', '2026-08-26 14:44:18.028638+00'),
	('a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'premium-motors-rabat', 'بريميوم موتورز', 'سيارات راقية ومفحوصة', 'بريميوم موتورز بالرباط، متخصص فالعلامات الراقية. كل مركبة كتجي بتقرير فحص كامل وتاريخ صيانة موثّق من الوكالة.', 'حي الرياض، الرباط', 'الإثنين ـ السبت · 9:00 — 20:00', 'rabat', NULL, NULL, true, '{Mercedes,BMW,Audi,Volkswagen,"Land Rover"}', NULL, '#06152c', '#1550cc', 'free', NULL, '2026-08-26 14:44:18.029465+00', '2026-08-26 14:44:18.029465+00'),
	('4ed26878-0cac-454f-906c-3e9987f8465f', 'd6a86d41-9d4b-485a-a7c5-da03025be811', 'bike-store-casa', 'بايك ستور', 'سكوتر ودراجات المدينة', 'بايك ستور، متجر متخصص فالسكوتر والدراجات الصغيرة للمدينة، مع ورشة صيانة داخلية.', 'درب عمر، الدار البيضاء', 'كل يوم ماعدا الأحد · 9:00 — 19:00', 'casablanca', NULL, NULL, true, '{SYM,Peugeot,Vespa,Kymco,Honda}', NULL, '#0f2140', '#2f7dff', 'free', NULL, '2026-08-26 14:44:18.030121+00', '2026-08-26 14:44:18.030121+00'),
	('0eed6c78-7442-4274-a049-1eff4cc0588d', '0c5136df-b8f8-4b46-a4dc-3b0ca147f4a0', 'auto-deal-sud-laayoune', 'أوطو ديل الجنوب', 'مركبات الجنوب', 'أوطو ديل الجنوب بالعيون، متخصص فالمركبات النفعية والدفع الرباعي المناسبة لطرق الجنوب.', 'شارع مكة، العيون', 'الإثنين ـ السبت · 8:30 — 18:00', 'laayoune', NULL, NULL, true, '{Toyota,Mitsubishi,Isuzu,Ford}', NULL, '#0a1e3d', '#1f5fe0', 'free', NULL, '2026-08-26 14:44:18.030738+00', '2026-08-26 14:44:18.030738+00');


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: listing_history; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.listing_history VALUES
	('bbd17d5e-2a83-4864-8b7a-d248ed3625f3', 'c54d6da7-9d9f-4cc3-89d6-b8de57b9fcd8', '2015-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Dacia Logan 1.5 dCi Ambiance'),
	('5d8184f4-98bd-4733-b5e6-19a4c579c96a', 'c54d6da7-9d9f-4cc3-89d6-b8de57b9fcd8', '2017-04-12', 'entretien', 'صيانة دورية: زيت + فلاتر', 34000, NULL),
	('4a0a56e3-6eb5-41e5-b7c9-e72278a76bd2', 'c54d6da7-9d9f-4cc3-89d6-b8de57b9fcd8', '2019-11-23', 'entretien', 'تغيير البطارية', 68000, NULL),
	('d979e5be-b51f-4303-b972-b4f8554d4aa8', 'c54d6da7-9d9f-4cc3-89d6-b8de57b9fcd8', '2022-03-24', 'entretien', 'صيانة كبرى في الوكالة', 119000, NULL),
	('46ce2c23-e500-4209-a392-b13f5f46d248', 'c54d6da7-9d9f-4cc3-89d6-b8de57b9fcd8', '2024-08-26', 'entretien', 'صيانة كبرى في الوكالة', 153000, NULL),
	('6c613430-34c2-4620-aa37-c5fba77d1b98', 'c54d6da7-9d9f-4cc3-89d6-b8de57b9fcd8', '2026-03-16', 'visite', 'الفحص التقني — صالح', 185838, NULL),
	('da9c0219-d0c5-48fe-9172-48f09d434f47', '0b618a31-af03-4883-b52f-745df7c5b0c4', '2019-11-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Dacia Sandero Stepway 1.5 dCi'),
	('8c482da5-461e-488a-8075-08aaa658e373', '0b618a31-af03-4883-b52f-745df7c5b0c4', '2021-07-25', 'entretien', 'تغيير الفرامل الأمامية', 27500, NULL),
	('8afc065c-31da-4f1c-b7c6-f260fa4fa455', '0b618a31-af03-4883-b52f-745df7c5b0c4', '2023-06-25', 'entretien', 'صيانة دورية: زيت + فلاتر', 55000, NULL),
	('a2787572-aa8a-4308-85b7-696c910e72f3', '0b618a31-af03-4883-b52f-745df7c5b0c4', '2023-08-25', 'proprietaire', 'تغيير المالك رقم 2', 55000, NULL),
	('2e3c3caa-ffca-492d-a84d-a8fa86e4e07a', '0b618a31-af03-4883-b52f-745df7c5b0c4', '2024-06-19', 'entretien', 'تغيير الفرامل الأمامية', 68500, NULL),
	('a22aba13-444e-49d8-986c-764243390c6c', '0b618a31-af03-4883-b52f-745df7c5b0c4', '2026-06-23', 'visite', 'الفحص التقني — صالح', 93409, NULL),
	('f2734981-4a3b-4e4d-aa89-d32a09d3fe97', '95ad54d3-407c-40c4-955d-22e4961c2349', '2018-06-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Dacia Duster 1.5 dCi 4x2 Prestige'),
	('f3c8451c-0349-4c65-bbe9-969a22f44f0f', '95ad54d3-407c-40c4-955d-22e4961c2349', '2020-08-11', 'entretien', 'صيانة كبرى في الوكالة', 29500, NULL),
	('777e1311-d4c8-4a1c-8540-e235224f82b9', '95ad54d3-407c-40c4-955d-22e4961c2349', '2021-12-10', 'entretien', 'تغيير سير التوزيع', 44500, NULL),
	('9303db86-2fd7-4a3b-b1a6-f6dc1d57662a', '95ad54d3-407c-40c4-955d-22e4961c2349', '2022-01-22', 'proprietaire', 'تغيير المالك رقم 2', 59000, NULL),
	('fbcc879f-e0a6-4d9c-ba89-e5d957f36607', '95ad54d3-407c-40c4-955d-22e4961c2349', '2023-10-21', 'entretien', 'تغيير الإطارات الأربعة', 74000, NULL),
	('0318a748-4ea3-4abe-ad18-65ea87598b20', '95ad54d3-407c-40c4-955d-22e4961c2349', '2024-09-15', 'entretien', 'صيانة كبرى في الوكالة', 88500, NULL),
	('84e810be-3cb8-445b-b965-4a413ef1e284', '95ad54d3-407c-40c4-955d-22e4961c2349', '2026-05-27', 'visite', 'الفحص التقني — صالح', 117224, NULL),
	('61e051ef-c3f3-4593-9664-944b37adb904', '7a6717b6-d34d-42ff-946c-c0a34bde30b9', '2017-08-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Dacia Dokker 1.5 dCi Ambiance'),
	('667ac9b7-9b20-45da-9fe5-64f68a59191e', '7a6717b6-d34d-42ff-946c-c0a34bde30b9', '2019-11-26', 'entretien', 'تغيير سير التوزيع', 31500, NULL),
	('a3b3daf6-c5b2-4731-8440-b2a6506d42dd', '7a6717b6-d34d-42ff-946c-c0a34bde30b9', '2020-04-12', 'proprietaire', 'تغيير المالك رقم 2', 47500, NULL),
	('98c660a0-b68a-4afb-95eb-fbd9d1b3e25c', '7a6717b6-d34d-42ff-946c-c0a34bde30b9', '2021-05-27', 'entretien', 'تغيير سير التوزيع', 63000, NULL),
	('bb311c38-e5a5-4122-b3e7-7f2bc065a1a7', '7a6717b6-d34d-42ff-946c-c0a34bde30b9', '2022-06-23', 'entretien', 'تغيير البطارية', 79000, NULL),
	('b67ec2dd-dea9-4a08-9a3f-2b827a9c0410', '7a6717b6-d34d-42ff-946c-c0a34bde30b9', '2023-05-26', 'proprietaire', 'تغيير المالك رقم 3', 94500, NULL),
	('bba6541d-f006-40ec-9617-5d640a5cb89c', '7a6717b6-d34d-42ff-946c-c0a34bde30b9', '2024-02-21', 'entretien', 'صيانة دورية: زيت + فلاتر', 110500, NULL),
	('ba185ca7-37cd-442a-83fb-45d909387c9f', '7a6717b6-d34d-42ff-946c-c0a34bde30b9', '2026-07-11', 'visite', 'الفحص التقني — صالح', 141659, NULL),
	('39070eee-ce01-4cda-9435-d047f90c3977', '08e29a0f-3a11-42e9-bc17-72d6cb17f981', '2016-09-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Dacia Lodgy 1.5 dCi 7 places'),
	('f21a7857-4b96-4bf5-8c6d-3af14b427fa3', '08e29a0f-3a11-42e9-bc17-72d6cb17f981', '2018-04-25', 'entretien', 'تغيير سير التوزيع', 33000, NULL),
	('3283cd7f-3e54-4760-a750-786267d4efa3', '08e29a0f-3a11-42e9-bc17-72d6cb17f981', '2020-07-18', 'entretien', 'صيانة كبرى في الوكالة', 66000, NULL),
	('bfba1c90-5615-4cc8-9879-4d8673caa453', '08e29a0f-3a11-42e9-bc17-72d6cb17f981', '2022-04-22', 'entretien', 'تغيير الإطارات الأربعة', 99000, NULL),
	('36a0cfd1-f860-42cb-85f7-165ec1531f48', '08e29a0f-3a11-42e9-bc17-72d6cb17f981', '2024-01-19', 'entretien', 'صيانة دورية: زيت + فلاتر', 132000, NULL),
	('9cfc0ed1-5886-40fb-99fb-6cfda8a703ec', '08e29a0f-3a11-42e9-bc17-72d6cb17f981', '2026-06-20', 'visite', 'الفحص التقني — صالح', 164098, NULL),
	('445a21cc-f82b-4db3-a67d-fba619534083', '6dc0d3db-4e09-4d68-bc74-ef01034a1e20', '2017-06-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Renault Clio 4 1.5 dCi Business'),
	('73fda536-2d05-4ffb-9468-0e63c664ddb5', '6dc0d3db-4e09-4d68-bc74-ef01034a1e20', '2019-02-24', 'entretien', 'صيانة دورية: زيت + فلاتر', 28500, NULL),
	('35489d20-033e-482f-a1d4-4df8a3e2e912', '6dc0d3db-4e09-4d68-bc74-ef01034a1e20', '2020-05-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خفيفة في الصدام الأمامي — تم الإصلاح'),
	('02b01abe-4053-4498-9fec-ae56a5a107c3', '6dc0d3db-4e09-4d68-bc74-ef01034a1e20', '2021-02-26', 'entretien', 'صيانة كبرى في الوكالة', 57000, NULL),
	('119603d1-c859-4a87-9fb1-c2391bd73c81', '6dc0d3db-4e09-4d68-bc74-ef01034a1e20', '2022-08-17', 'entretien', 'تغيير الفرامل الأمامية', 71000, NULL),
	('3a05a652-9d97-4eec-9f27-90602b3806d7', '6dc0d3db-4e09-4d68-bc74-ef01034a1e20', '2024-02-19', 'entretien', 'تغيير الإطارات الأربعة', 99500, NULL),
	('b0ceb5e8-5e9f-43fe-a72b-62a5d40a1895', '6dc0d3db-4e09-4d68-bc74-ef01034a1e20', '2026-03-27', 'visite', 'الفحص التقني — صالح', 126423, NULL),
	('3e5a10d0-c7f5-4349-a5be-e3caddbae2f5', '078cd4a9-0388-45c2-91aa-d979e998b940', '2016-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Renault Symbol 1.5 dCi Life'),
	('bd7ac314-3bb2-41fa-8e57-8d3b5dadf991', '078cd4a9-0388-45c2-91aa-d979e998b940', '2018-08-23', 'entretien', 'تغيير البطارية', 31500, NULL),
	('05e1ee4e-b106-432a-9d47-6c9f615a7dc7', '078cd4a9-0388-45c2-91aa-d979e998b940', '2020-01-17', 'entretien', 'تغيير البطارية', 63000, NULL),
	('55c7ccc8-95df-43f6-ab34-2f26afbbbdf7', '078cd4a9-0388-45c2-91aa-d979e998b940', '2022-01-22', 'entretien', 'تغيير سير التوزيع', 95000, NULL),
	('fdf13cd6-32cb-478d-a7d9-3f806e68f5f3', '078cd4a9-0388-45c2-91aa-d979e998b940', '2024-01-23', 'entretien', 'صيانة كبرى في الوكالة', 126500, NULL),
	('ac1e5dff-096a-4ae5-a1e2-53715549365a', '078cd4a9-0388-45c2-91aa-d979e998b940', '2026-04-19', 'visite', 'الفحص التقني — صالح', 156515, NULL),
	('fe285448-6988-4fdc-9dbc-fe70b8c7038b', 'f45703fb-0547-43cb-bad0-654783251e26', '2018-10-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Renault Mégane 1.5 dCi Intens'),
	('d25d6022-039d-47c9-941b-824b72de0b36', 'f45703fb-0547-43cb-bad0-654783251e26', '2020-09-13', 'entretien', 'تغيير البطارية', 26000, NULL),
	('60c69b4f-423b-4488-b0b4-23fecd20f234', 'f45703fb-0547-43cb-bad0-654783251e26', '2021-02-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خفيفة في الصدام الأمامي — تم الإصلاح'),
	('80783aa8-d532-490a-9a9e-5af28af7a573', 'f45703fb-0547-43cb-bad0-654783251e26', '2021-06-24', 'entretien', 'صيانة دورية: زيت + فلاتر', 39000, NULL);
INSERT INTO public.listing_history VALUES
	('098f9a2c-5669-4fc8-85ad-95722a91b0d5', 'f45703fb-0547-43cb-bad0-654783251e26', '2022-07-16', 'proprietaire', 'تغيير المالك رقم 2', 52000, NULL),
	('ab38d067-9490-4bea-8449-1b49a6f02098', 'f45703fb-0547-43cb-bad0-654783251e26', '2023-03-13', 'entretien', 'تغيير الإطارات الأربعة', 65000, NULL),
	('7572bf94-83d6-4c6b-9b98-8163c8f9bdc7', 'f45703fb-0547-43cb-bad0-654783251e26', '2024-05-15', 'entretien', 'صيانة دورية: زيت + فلاتر', 78000, NULL),
	('6a5478b9-2325-43fa-abd0-d95cff49fa49', 'f45703fb-0547-43cb-bad0-654783251e26', '2026-07-23', 'visite', 'الفحص التقني — صالح', 102114, NULL),
	('3a22302e-128c-4064-aace-ad9736ace6f2', 'cf8b1b7a-6aa2-44ec-9f58-6398b0c3e638', '2016-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Renault Kangoo 1.5 dCi Confort'),
	('88f796b9-e8c3-4e9e-80c5-38bbc60a1cd4', 'cf8b1b7a-6aa2-44ec-9f58-6398b0c3e638', '2018-03-17', 'entretien', 'صيانة دورية: زيت + فلاتر', 35500, NULL),
	('981d3eab-2dc3-4e5c-a672-548ca9b03cad', 'cf8b1b7a-6aa2-44ec-9f58-6398b0c3e638', '2020-07-10', 'entretien', 'تغيير الإطارات الأربعة', 71000, NULL),
	('59c097f7-0736-4e1e-a15a-bf6c08378d56', 'cf8b1b7a-6aa2-44ec-9f58-6398b0c3e638', '2021-04-12', 'proprietaire', 'تغيير المالك رقم 2', 89000, NULL),
	('ce325819-ef27-4ef0-9d6e-bdac2275e494', 'cf8b1b7a-6aa2-44ec-9f58-6398b0c3e638', '2022-01-24', 'entretien', 'صيانة كبرى في الوكالة', 107000, NULL),
	('7f0830ff-8685-451e-8fb4-2727a2b0b89c', 'cf8b1b7a-6aa2-44ec-9f58-6398b0c3e638', '2024-12-13', 'entretien', 'تغيير البطارية', 142500, NULL),
	('a21d0360-9330-426a-946c-b5b6b15180cf', 'cf8b1b7a-6aa2-44ec-9f58-6398b0c3e638', '2026-02-23', 'visite', 'الفحص التقني — صالح', 176055, NULL),
	('441cc79b-169f-4639-9957-5366781e5cb9', 'e6440068-6d58-4384-b322-8ee2caf6aa12', '2019-08-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Renault Captur 1.5 dCi Zen'),
	('2e29c508-7e56-4959-807f-ba40aedf9b93', 'e6440068-6d58-4384-b322-8ee2caf6aa12', '2021-01-12', 'proprietaire', 'تغيير المالك رقم 2', 25000, NULL),
	('96972537-2241-4248-8b3e-b22ea67a6a6d', 'e6440068-6d58-4384-b322-8ee2caf6aa12', '2021-05-17', 'entretien', 'تغيير البطارية', 25000, NULL),
	('c5802375-72d1-41b0-9c55-0cb15ff4d911', 'e6440068-6d58-4384-b322-8ee2caf6aa12', '2023-09-10', 'entretien', 'تغيير الفرامل الأمامية', 50500, NULL),
	('6a7bb4f1-dde3-4f00-a8ff-9a02b70c7a37', 'e6440068-6d58-4384-b322-8ee2caf6aa12', '2024-06-10', 'entretien', 'تغيير الفرامل الأمامية', 63000, NULL),
	('d76122c1-928e-4624-9257-ce46ec2facdd', 'e6440068-6d58-4384-b322-8ee2caf6aa12', '2024-09-10', 'proprietaire', 'تغيير المالك رقم 3', 63000, NULL),
	('65aff005-bfc6-4464-b446-4c4c17dd0263', 'e6440068-6d58-4384-b322-8ee2caf6aa12', '2026-02-16', 'visite', 'الفحص التقني — صالح', 87638, NULL),
	('3d9be933-bcb3-4814-93b2-e0a5a0fb5604', '522305b6-043b-4a3a-ad2e-843e02db85c0', '2018-02-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Peugeot 208 1.6 BlueHDi Active'),
	('b651fd59-8bbc-4ccd-8350-68fd45bad65a', '522305b6-043b-4a3a-ad2e-843e02db85c0', '2020-11-26', 'entretien', 'صيانة كبرى في الوكالة', 28000, NULL),
	('37da8738-e944-40cc-bb07-7c84c18d995f', '522305b6-043b-4a3a-ad2e-843e02db85c0', '2021-09-26', 'entretien', 'تغيير الفرامل الأمامية', 42000, NULL),
	('8e0e6825-9c23-47c8-ad77-26e187f62e2e', '522305b6-043b-4a3a-ad2e-843e02db85c0', '2022-05-10', 'proprietaire', 'تغيير المالك رقم 2', 56000, NULL),
	('5f066675-1416-402c-afa3-2962ee50ef26', '522305b6-043b-4a3a-ad2e-843e02db85c0', '2023-10-22', 'entretien', 'تغيير الفرامل الأمامية', 70000, NULL),
	('51ee8240-39e4-4362-90c2-26f0ce2a7050', '522305b6-043b-4a3a-ad2e-843e02db85c0', '2024-04-14', 'entretien', 'تغيير الفرامل الأمامية', 84000, NULL),
	('206dc746-f31f-4154-a9a6-c0e8e2e1c7c2', '522305b6-043b-4a3a-ad2e-843e02db85c0', '2026-01-24', 'visite', 'الفحص التقني — صالح', 111237, NULL),
	('3a3b2098-a4de-4cd2-aa10-03e0cdc68e98', '14d4493c-5f13-4b7e-a91e-3d92a1b589f7', '2017-03-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Peugeot 301 1.6 HDi Allure'),
	('c0f9caad-39f7-4a63-b7e6-265871c7cce4', '14d4493c-5f13-4b7e-a91e-3d92a1b589f7', '2019-10-27', 'entretien', 'تغيير البطارية', 32500, NULL),
	('fe24f849-6d65-4daa-8839-f029c1f95048', '14d4493c-5f13-4b7e-a91e-3d92a1b589f7', '2021-10-24', 'entretien', 'تغيير البطارية', 65000, NULL),
	('f2876910-ffad-4b31-8dc4-87493025ae8f', '14d4493c-5f13-4b7e-a91e-3d92a1b589f7', '2022-09-16', 'entretien', 'تغيير سير التوزيع', 81000, NULL),
	('6609ba9b-3d02-47c9-9a3d-b10c6eb9e93d', '14d4493c-5f13-4b7e-a91e-3d92a1b589f7', '2024-08-21', 'entretien', 'تغيير سير التوزيع', 113500, NULL),
	('dfd9904a-6991-4438-85ea-c9223777563b', '14d4493c-5f13-4b7e-a91e-3d92a1b589f7', '2026-03-16', 'visite', 'الفحص التقني — صالح', 144659, NULL),
	('55c0d933-0270-4da0-afd4-6be1b12d8dd1', 'ea493a89-491c-464b-8769-6d316be9370e', '2019-01-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Peugeot 3008 1.5 BlueHDi GT Line'),
	('0f494568-e0c0-4aa0-9dc9-06f487c2e18e', 'ea493a89-491c-464b-8769-6d316be9370e', '2021-03-19', 'entretien', 'صيانة دورية: زيت + فلاتر', 26500, NULL),
	('0cdd851e-2d5a-495d-9500-43d62102cd9b', 'ea493a89-491c-464b-8769-6d316be9370e', '2023-06-21', 'entretien', 'تغيير الإطارات الأربعة', 52500, NULL),
	('54d848c6-3c9d-476b-9598-c3190b9fb5bc', 'ea493a89-491c-464b-8769-6d316be9370e', '2024-11-12', 'entretien', 'تغيير سير التوزيع', 65500, NULL),
	('3b45c5bc-18a9-42d5-89d2-31625b620535', 'ea493a89-491c-464b-8769-6d316be9370e', '2026-02-18', 'visite', 'الفحص التقني — صالح', 91006, NULL),
	('0e0d1d61-3527-4f94-9171-6c5f20974493', '07a5b91e-e137-4eb4-9c8a-a4fa28734430', '2018-04-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Peugeot Partner 1.6 HDi Pro'),
	('77f9480b-432c-40c0-b7ab-be4b06337d02', '07a5b91e-e137-4eb4-9c8a-a4fa28734430', '2020-06-15', 'entretien', 'تغيير الفرامل الأمامية', 33500, NULL),
	('e2c67faa-891a-4cca-a6d6-f0ea6b267b12', '07a5b91e-e137-4eb4-9c8a-a4fa28734430', '2021-05-19', 'entretien', 'تغيير الفرامل الأمامية', 50500, NULL),
	('8d559ac4-0aca-4a41-a51b-2edf41e506ff', '07a5b91e-e137-4eb4-9c8a-a4fa28734430', '2023-10-13', 'entretien', 'تغيير البطارية', 84000, NULL),
	('3df6eb99-3b9a-422b-a94d-8ca39be31dc1', '07a5b91e-e137-4eb4-9c8a-a4fa28734430', '2024-01-18', 'entretien', 'تغيير الإطارات الأربعة', 100500, NULL),
	('16109695-ed46-453d-b010-8b74b66dc0ad', '07a5b91e-e137-4eb4-9c8a-a4fa28734430', '2026-04-25', 'visite', 'الفحص التقني — صالح', 133395, NULL),
	('87a8dcd9-6417-469b-89cd-b56fdacfa99b', '2230879f-4d79-42a8-9c8b-15b90febfafc', '2018-08-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Citroën C-Elysée 1.6 HDi Feel'),
	('f98ba467-3a75-45af-8474-470d5cf7c25c', '2230879f-4d79-42a8-9c8b-15b90febfafc', '2020-09-22', 'entretien', 'تغيير سير التوزيع', 30500, NULL),
	('fa2486d6-44ab-4505-8eae-077cb580c9e3', '2230879f-4d79-42a8-9c8b-15b90febfafc', '2021-05-26', 'entretien', 'تغيير البطارية', 45500, NULL),
	('634524d9-4f19-46e8-8453-34ee6579a410', '2230879f-4d79-42a8-9c8b-15b90febfafc', '2021-08-16', 'proprietaire', 'تغيير المالك رقم 2', 45500, NULL),
	('d92ea3c3-73a2-4095-a072-0c4950c0561c', '2230879f-4d79-42a8-9c8b-15b90febfafc', '2023-04-18', 'proprietaire', 'تغيير المالك رقم 3', 75500, NULL),
	('009741e0-68b9-4700-864c-a4c4ecfa1e3a', '2230879f-4d79-42a8-9c8b-15b90febfafc', '2023-05-15', 'entretien', 'تغيير البطارية', 75500, NULL),
	('0c6988ba-b683-4c2b-8bbf-fa7dbbddb21c', '2230879f-4d79-42a8-9c8b-15b90febfafc', '2024-12-19', 'entretien', 'صيانة دورية: زيت + فلاتر', 91000, NULL),
	('780a407c-4567-435a-bad1-faf72d762e00', '2230879f-4d79-42a8-9c8b-15b90febfafc', '2026-07-12', 'visite', 'الفحص التقني — صالح', 120771, NULL);
INSERT INTO public.listing_history VALUES
	('268e81cb-1901-4605-bf38-75b3698c91d5', '484f378d-fd41-4d3e-ab6d-0dd15a60dbd1', '2019-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Citroën C3 1.5 BlueHDi Shine'),
	('6d807605-a9e4-43ef-bf8e-cdedd94271fc', '484f378d-fd41-4d3e-ab6d-0dd15a60dbd1', '2021-02-24', 'entretien', 'تغيير الإطارات الأربعة', 22500, NULL),
	('74dde837-5389-4450-8fed-b7f565b3d2f6', '484f378d-fd41-4d3e-ab6d-0dd15a60dbd1', '2022-10-14', 'accident', 'حادث مصرّح به', NULL, 'خدوش جانبية — صباغة جزئية للباب الأيمن'),
	('662177c5-6307-43a5-b66b-7c374318a365', '484f378d-fd41-4d3e-ab6d-0dd15a60dbd1', '2023-05-13', 'entretien', 'تغيير الإطارات الأربعة', 45000, NULL),
	('fd71c932-f725-434e-b36d-90e56d1d95f1', '484f378d-fd41-4d3e-ab6d-0dd15a60dbd1', '2023-05-15', 'proprietaire', 'تغيير المالك رقم 2', 45000, NULL),
	('ba4ce04b-5100-4a67-b3e7-3342fc7def2d', '484f378d-fd41-4d3e-ab6d-0dd15a60dbd1', '2024-10-23', 'entretien', 'تغيير البطارية', 56500, NULL),
	('35f4b2ca-f33b-4acd-b5b7-896d7deca660', '484f378d-fd41-4d3e-ab6d-0dd15a60dbd1', '2026-04-19', 'visite', 'الفحص التقني — صالح', 78046, NULL),
	('678c675a-3be0-44ca-a3b7-32dfb2ea33bb', '294aeaf0-dd54-4aca-bbd0-c8848ac7947c', '2016-01-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Volkswagen Golf 7 1.6 TDI Confortline'),
	('d0a98a13-7c32-4c35-ae61-c43c3402aeb8', '294aeaf0-dd54-4aca-bbd0-c8848ac7947c', '2018-03-25', 'entretien', 'تغيير سير التوزيع', 30000, NULL),
	('44797691-0a3f-4d27-895b-d310e6c5186a', '294aeaf0-dd54-4aca-bbd0-c8848ac7947c', '2019-08-19', 'proprietaire', 'تغيير المالك رقم 2', 44500, NULL),
	('28aa9bfe-6558-455b-b312-4fd52fd4cea4', '294aeaf0-dd54-4aca-bbd0-c8848ac7947c', '2020-01-14', 'entretien', 'تغيير البطارية', 59500, NULL),
	('e6d40111-17c0-4d5a-91cb-10b25b501547', '294aeaf0-dd54-4aca-bbd0-c8848ac7947c', '2022-11-11', 'entretien', 'تغيير الفرامل الأمامية', 89500, NULL),
	('ac20453b-0976-4a8d-810a-1e99001840cc', '294aeaf0-dd54-4aca-bbd0-c8848ac7947c', '2023-02-20', 'proprietaire', 'تغيير المالك رقم 3', 104500, NULL),
	('3e74f0e1-eef5-4647-b219-8024fe1e4af9', '294aeaf0-dd54-4aca-bbd0-c8848ac7947c', '2024-06-11', 'entretien', 'تغيير البطارية', 119000, NULL),
	('97b662aa-c647-4457-9424-2fc27e58d943', '294aeaf0-dd54-4aca-bbd0-c8848ac7947c', '2026-06-21', 'visite', 'الفحص التقني — صالح', 147152, NULL),
	('bd5bfa11-fc75-49fd-b91e-382e0b05c94c', '28d5c31c-c766-465a-8159-f18d594e9416', '2018-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Volkswagen Polo 1.6 TDI Trendline'),
	('a4194b6f-ad1d-4394-8c63-396b52cd16d8', '28d5c31c-c766-465a-8159-f18d594e9416', '2020-07-17', 'entretien', 'تغيير البطارية', 24500, NULL),
	('ed00b36d-66aa-4005-9ce7-2ee7b08c1bca', '28d5c31c-c766-465a-8159-f18d594e9416', '2021-02-23', 'proprietaire', 'تغيير المالك رقم 2', 37000, NULL),
	('44a0a2ef-e471-4e55-a58f-ffe3d673445b', '28d5c31c-c766-465a-8159-f18d594e9416', '2021-11-17', 'entretien', 'صيانة دورية: زيت + فلاتر', 37000, NULL),
	('ea0a63b5-20e2-4593-b9f3-3f4d51ec4e4e', '28d5c31c-c766-465a-8159-f18d594e9416', '2022-06-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خفيفة في الصدام الأمامي — تم الإصلاح'),
	('b4765fa7-4498-4f4d-9365-8f7fa06887cb', '28d5c31c-c766-465a-8159-f18d594e9416', '2023-02-24', 'proprietaire', 'تغيير المالك رقم 3', 61500, NULL),
	('c23e561d-02fa-4f45-a357-64ade7ce86ba', '28d5c31c-c766-465a-8159-f18d594e9416', '2023-03-14', 'entretien', 'تغيير البطارية', 61500, NULL),
	('c38c73f6-e18f-4d79-9a8a-bd7170c5d679', '28d5c31c-c766-465a-8159-f18d594e9416', '2024-01-26', 'entretien', 'تغيير سير التوزيع', 73500, NULL),
	('dcba846f-7629-4e63-90d7-aae5f438bdf7', '28d5c31c-c766-465a-8159-f18d594e9416', '2026-08-26', 'visite', 'الفحص التقني — صالح', 96601, NULL),
	('76027198-1a02-49cd-9fa3-1b37139a7c9c', 'edfae492-8b98-4e46-9b1e-e98d1827da50', '2015-10-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Volkswagen Passat 2.0 TDI Highline'),
	('331e9a5d-4a15-4a9d-b2ca-2dc575d1fd46', 'edfae492-8b98-4e46-9b1e-e98d1827da50', '2017-09-22', 'entretien', 'تغيير الإطارات الأربعة', 35500, NULL),
	('ed64ee9c-9aed-48c0-a2f4-e20d11439dca', 'edfae492-8b98-4e46-9b1e-e98d1827da50', '2019-02-10', 'entretien', 'تغيير الإطارات الأربعة', 71500, NULL),
	('a7664fbc-ba83-41d5-a22f-9e979d129be6', 'edfae492-8b98-4e46-9b1e-e98d1827da50', '2021-07-12', 'proprietaire', 'تغيير المالك رقم 2', 107000, NULL),
	('6525f20f-d20d-4637-880d-6d76001dd07a', 'edfae492-8b98-4e46-9b1e-e98d1827da50', '2022-07-23', 'entretien', 'صيانة كبرى في الوكالة', 124500, NULL),
	('0b10d4aa-4573-432c-9bd9-d53c37614278', 'edfae492-8b98-4e46-9b1e-e98d1827da50', '2024-06-10', 'entretien', 'تغيير سير التوزيع', 160500, NULL),
	('5389dfd8-1bea-474c-b309-ca4caf65ad52', 'edfae492-8b98-4e46-9b1e-e98d1827da50', '2026-05-13', 'visite', 'الفحص التقني — صالح', 193963, NULL),
	('be2dffcc-6ed6-4ef3-8253-625b86f30b94', '74dd8d06-0586-48f2-b92e-5178b782d27a', '2019-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Volkswagen Tiguan 2.0 TDI Carat'),
	('11b86612-190f-49f9-b009-38f401b4a8bd', '74dd8d06-0586-48f2-b92e-5178b782d27a', '2021-01-27', 'entretien', 'تغيير البطارية', 24500, NULL),
	('134a1dce-a46e-4fae-baf7-812ce4aac1fb', '74dd8d06-0586-48f2-b92e-5178b782d27a', '2023-02-10', 'proprietaire', 'تغيير المالك رقم 2', 49000, NULL),
	('b2233ee5-3906-4fbd-8920-f256b3784cf6', '74dd8d06-0586-48f2-b92e-5178b782d27a', '2023-07-10', 'entretien', 'صيانة كبرى في الوكالة', 49000, NULL),
	('c4cc1ccf-527b-4f50-8ccd-20fbd0678977', '74dd8d06-0586-48f2-b92e-5178b782d27a', '2024-01-15', 'entretien', 'تغيير الفرامل الأمامية', 61500, NULL),
	('8b29831d-ec8b-47d0-9d3b-8772900269d3', '74dd8d06-0586-48f2-b92e-5178b782d27a', '2026-07-14', 'visite', 'الفحص التقني — صالح', 84633, NULL),
	('836d8129-accd-4e0e-b4e9-4a81f5b492ef', '28880baf-ae9e-4c32-89a4-85570160d37c', '2019-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Hyundai i10 1.0 Essence Confort'),
	('3c3ffc6d-5256-49c8-b93d-731e94da1bdc', '28880baf-ae9e-4c32-89a4-85570160d37c', '2021-02-26', 'proprietaire', 'تغيير المالك رقم 2', 21000, NULL),
	('709604bd-25d8-4146-b3c8-26fc766732e9', '28880baf-ae9e-4c32-89a4-85570160d37c', '2021-02-27', 'entretien', 'تغيير الفرامل الأمامية', 21000, NULL),
	('860c71dd-e59e-488d-9b6a-e02b6d1b4829', '28880baf-ae9e-4c32-89a4-85570160d37c', '2023-12-27', 'entretien', 'صيانة دورية: زيت + فلاتر', 42500, NULL),
	('63c20ffc-1ed7-4d56-b612-829527de69b6', '28880baf-ae9e-4c32-89a4-85570160d37c', '2024-07-14', 'proprietaire', 'تغيير المالك رقم 3', 53000, NULL),
	('3c0ceb91-d1d1-42a9-b3a3-237a5266d0e2', '28880baf-ae9e-4c32-89a4-85570160d37c', '2024-07-27', 'entretien', 'صيانة كبرى في الوكالة', 53000, NULL),
	('f44055ba-69be-45ae-a63f-a9da359460ff', '28880baf-ae9e-4c32-89a4-85570160d37c', '2026-02-16', 'visite', 'الفحص التقني — صالح', 71751, NULL),
	('a3ecc3ef-a777-4980-ada4-141a91029b9e', '0cf5bf71-cacc-4992-818c-68b6978ed08a', '2016-08-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Hyundai Accent 1.5 CRDi GLS'),
	('4235c088-25c6-46f4-a99f-456d6a7697f5', '0cf5bf71-cacc-4992-818c-68b6978ed08a', '2018-07-24', 'entretien', 'تغيير الفرامل الأمامية', 30500, NULL),
	('304eb0b6-e075-4394-a551-325080c28d84', '0cf5bf71-cacc-4992-818c-68b6978ed08a', '2020-07-27', 'entretien', 'تغيير الفرامل الأمامية', 61000, NULL),
	('ff66549c-f844-42d9-bfe7-390146b527b4', '0cf5bf71-cacc-4992-818c-68b6978ed08a', '2022-04-15', 'entretien', 'تغيير الفرامل الأمامية', 91000, NULL),
	('6099c7ee-7795-4676-a9c7-30957698cc52', '0cf5bf71-cacc-4992-818c-68b6978ed08a', '2024-01-12', 'entretien', 'تغيير الإطارات الأربعة', 121500, NULL),
	('22b77b37-0615-4e08-8f12-b183e2585b09', '0cf5bf71-cacc-4992-818c-68b6978ed08a', '2026-03-26', 'visite', 'الفحص التقني — صالح', 150063, NULL);
INSERT INTO public.listing_history VALUES
	('3935b39f-e996-4716-bc3f-71f815b60bbf', 'a2b52849-e9f0-424f-9fb8-f5250d1cfee3', '2018-03-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Hyundai Tucson 2.0 CRDi Executive'),
	('3f79d120-689c-4116-a011-e191289e81d8', 'a2b52849-e9f0-424f-9fb8-f5250d1cfee3', '2020-08-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خفيفة في الصدام الأمامي — تم الإصلاح'),
	('aa2432aa-7ce4-443a-8f8e-bdcd4223bbef', 'a2b52849-e9f0-424f-9fb8-f5250d1cfee3', '2020-09-15', 'entretien', 'تغيير البطارية', 27000, NULL),
	('15df8a92-9e72-4cfd-9856-199d1a86440c', 'a2b52849-e9f0-424f-9fb8-f5250d1cfee3', '2021-03-25', 'proprietaire', 'تغيير المالك رقم 2', 40500, NULL),
	('215184ee-45c2-4015-bceb-b992c6deff05', 'a2b52849-e9f0-424f-9fb8-f5250d1cfee3', '2021-03-25', 'entretien', 'تغيير البطارية', 40500, NULL),
	('18a0a89a-88ef-487a-90c4-8c24c5584a47', 'a2b52849-e9f0-424f-9fb8-f5250d1cfee3', '2023-01-26', 'proprietaire', 'تغيير المالك رقم 3', 67500, NULL),
	('064c23d0-7181-4fc6-ba15-4e6c0e4b8190', 'a2b52849-e9f0-424f-9fb8-f5250d1cfee3', '2023-02-16', 'entretien', 'صيانة دورية: زيت + فلاتر', 67500, NULL),
	('d0b65039-5a8d-47e2-82be-7860b5f606b8', 'a2b52849-e9f0-424f-9fb8-f5250d1cfee3', '2024-10-25', 'entretien', 'صيانة دورية: زيت + فلاتر', 81000, NULL),
	('4e5efdcd-b4bd-427f-93fd-914ff55e5cdc', 'a2b52849-e9f0-424f-9fb8-f5250d1cfee3', '2026-01-22', 'visite', 'الفحص التقني — صالح', 106454, NULL),
	('563d588d-e4f9-417f-b67d-9b8828b3b884', 'd6cc02d9-dedb-4c47-862f-af6ba4e9bcb9', '2018-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Kia Picanto 1.0 Essence Motion'),
	('f1bbcf63-2530-40f5-8655-9af9ad1da785', 'd6cc02d9-dedb-4c47-862f-af6ba4e9bcb9', '2020-04-23', 'entretien', 'صيانة كبرى في الوكالة', 20500, NULL),
	('ddf4a9ec-0b9c-463e-a157-485d63717cd5', 'd6cc02d9-dedb-4c47-862f-af6ba4e9bcb9', '2021-08-25', 'entretien', 'تغيير الفرامل الأمامية', 31000, NULL),
	('09840ae8-00be-44b2-924e-ae0f7d6196e1', 'd6cc02d9-dedb-4c47-862f-af6ba4e9bcb9', '2022-04-10', 'proprietaire', 'تغيير المالك رقم 2', 41000, NULL),
	('72ed7250-75e6-48d8-9821-9b64363b8a0d', 'd6cc02d9-dedb-4c47-862f-af6ba4e9bcb9', '2023-03-14', 'entretien', 'تغيير سير التوزيع', 51500, NULL),
	('94f3085a-9d5d-4064-ad2c-05637413e583', 'd6cc02d9-dedb-4c47-862f-af6ba4e9bcb9', '2024-12-22', 'entretien', 'تغيير الفرامل الأمامية', 61500, NULL),
	('65e3316c-2d31-4f35-9e1c-8c32ca2c84c8', 'd6cc02d9-dedb-4c47-862f-af6ba4e9bcb9', '2026-02-11', 'visite', 'الفحص التقني — صالح', 80725, NULL),
	('7cbef72b-167f-4878-bda0-5f78442d91e3', '32f9c753-86d0-491c-935e-3ca71ee91f25', '2017-01-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Kia Rio 1.4 CRDi Active'),
	('91e79099-df2e-4f68-a449-d671508bcce3', '32f9c753-86d0-491c-935e-3ca71ee91f25', '2019-12-27', 'entretien', 'صيانة كبرى في الوكالة', 26000, NULL),
	('5e886b9b-c0d1-4efc-8ad0-64312a16442e', '32f9c753-86d0-491c-935e-3ca71ee91f25', '2020-03-24', 'proprietaire', 'تغيير المالك رقم 2', 39500, NULL),
	('1121d64e-8b0e-49cf-9f29-b70acb42f1ee', '32f9c753-86d0-491c-935e-3ca71ee91f25', '2021-11-22', 'entretien', 'صيانة دورية: زيت + فلاتر', 52500, NULL),
	('c857abf5-1677-49d3-b33b-be102ae881cd', '32f9c753-86d0-491c-935e-3ca71ee91f25', '2022-07-17', 'entretien', 'تغيير البطارية', 65500, NULL),
	('9b1c38fe-402d-4e93-8b05-17a5ea69e522', '32f9c753-86d0-491c-935e-3ca71ee91f25', '2023-07-27', 'proprietaire', 'تغيير المالك رقم 3', 78500, NULL),
	('450aaf8f-ca00-4e0a-8194-c32f2a35e07b', '32f9c753-86d0-491c-935e-3ca71ee91f25', '2024-07-15', 'entretien', 'تغيير الفرامل الأمامية', 92000, NULL),
	('ba41337a-eaf3-4e01-b9fe-3a159b371e94', '32f9c753-86d0-491c-935e-3ca71ee91f25', '2026-05-11', 'visite', 'الفحص التقني — صالح', 117553, NULL),
	('2247f5e4-5f97-43b5-b08d-523eec748330', 'fa17c904-82af-4d20-96bf-71529d997320', '2019-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Kia Sportage 1.7 CRDi Style'),
	('1070b0f9-2a10-48ed-805c-d35c16ead1d2', 'fa17c904-82af-4d20-96bf-71529d997320', '2021-03-20', 'entretien', 'تغيير الفرامل الأمامية', 27000, NULL),
	('631dbaf5-434b-44da-a004-5039b0ccdde4', 'fa17c904-82af-4d20-96bf-71529d997320', '2023-06-17', 'entretien', 'صيانة دورية: زيت + فلاتر', 53500, NULL),
	('2e0f0507-2476-4879-81f0-9c23eb26de00', 'fa17c904-82af-4d20-96bf-71529d997320', '2023-06-26', 'proprietaire', 'تغيير المالك رقم 2', 53500, NULL),
	('496923cd-962a-4e0c-a47a-5c60726fb064', 'fa17c904-82af-4d20-96bf-71529d997320', '2024-03-16', 'entretien', 'صيانة دورية: زيت + فلاتر', 67000, NULL),
	('5fa025ad-60b3-4472-aacb-68f46f827859', 'fa17c904-82af-4d20-96bf-71529d997320', '2026-05-15', 'visite', 'الفحص التقني — صالح', 91379, NULL),
	('a67807f0-6b3f-420e-84bc-1bb0681dd5e9', 'a97049ee-ca89-4f8d-a565-88c20f7db46a', '2017-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Toyota Yaris 1.4 D-4D Luna'),
	('e1ad2aa5-aecb-41fb-a4e6-68e8f7c9a947', 'a97049ee-ca89-4f8d-a565-88c20f7db46a', '2019-03-15', 'entretien', 'تغيير الفرامل الأمامية', 27500, NULL),
	('e9748b8c-8b4a-4aa5-ae2d-792e52adfc17', 'a97049ee-ca89-4f8d-a565-88c20f7db46a', '2021-05-24', 'entretien', 'صيانة كبرى في الوكالة', 55000, NULL),
	('b16c2170-8d58-412a-b469-cc7be1a15106', 'a97049ee-ca89-4f8d-a565-88c20f7db46a', '2022-04-15', 'proprietaire', 'تغيير المالك رقم 2', 69000, NULL),
	('b1709e4a-2235-42e6-b98d-9b66881144ce', 'a97049ee-ca89-4f8d-a565-88c20f7db46a', '2022-11-22', 'entretien', 'تغيير الإطارات الأربعة', 69000, NULL),
	('092d3b0b-30db-48d0-a9f0-eb9b9214d1ec', 'a97049ee-ca89-4f8d-a565-88c20f7db46a', '2024-01-16', 'entretien', 'تغيير الإطارات الأربعة', 96500, NULL),
	('7e2bd987-fe8b-413e-9e80-5acdd29d9f97', 'a97049ee-ca89-4f8d-a565-88c20f7db46a', '2026-03-26', 'visite', 'الفحص التقني — صالح', 123510, NULL),
	('d9621818-2d09-47ac-a735-fa6a0f60df72', 'c61b9dc2-a974-44aa-ba75-d2e2d611a5d1', '2020-03-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Toyota Corolla 1.8 Hybride Dynamic'),
	('a5f9c0bc-a8d7-4876-b9b1-54f179bacb92', 'c61b9dc2-a974-44aa-ba75-d2e2d611a5d1', '2022-04-22', 'entretien', 'صيانة دورية: زيت + فلاتر', 22500, NULL),
	('a254bf6a-857d-4f5f-8471-8e346d049bf7', 'c61b9dc2-a974-44aa-ba75-d2e2d611a5d1', '2023-09-11', 'proprietaire', 'تغيير المالك رقم 2', 34000, NULL),
	('c2407ba2-c6d4-4701-a926-f7849620f597', 'c61b9dc2-a974-44aa-ba75-d2e2d611a5d1', '2023-09-19', 'entretien', 'صيانة دورية: زيت + فلاتر', 34000, NULL),
	('0bcafe38-87de-4c19-a368-b4cfed8534a8', 'c61b9dc2-a974-44aa-ba75-d2e2d611a5d1', '2025-05-26', 'entretien', 'تغيير الفرامل الأمامية', 56500, NULL),
	('310b4b3f-052a-4047-904a-c8622f4cc6a6', 'c61b9dc2-a974-44aa-ba75-d2e2d611a5d1', '2026-08-26', 'visite', 'الفحص التقني — صالح', 66742, NULL),
	('dbfc27f7-12e7-43a7-97d1-f4853c057261', '5f528cd8-091a-4982-83ea-6d3d13d1c81f', '2018-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Toyota Hilux 2.4 D-4D 4x4 Double Cab'),
	('21fa04d8-f9eb-41fc-a7c7-8c40ad30d805', '5f528cd8-091a-4982-83ea-6d3d13d1c81f', '2020-07-12', 'entretien', 'تغيير سير التوزيع', 39000, NULL),
	('84045374-63e1-419d-b3aa-8ab6e8c25b46', '5f528cd8-091a-4982-83ea-6d3d13d1c81f', '2021-12-16', 'entretien', 'تغيير الفرامل الأمامية', 58500, NULL),
	('d214d99c-4fe2-49f5-8e2e-cc0ca47f943c', '5f528cd8-091a-4982-83ea-6d3d13d1c81f', '2022-07-12', 'proprietaire', 'تغيير المالك رقم 2', 78000, NULL),
	('fe942336-ef2c-4309-b5a4-47ff0050c458', '5f528cd8-091a-4982-83ea-6d3d13d1c81f', '2023-03-23', 'entretien', 'تغيير الفرامل الأمامية', 97500, NULL),
	('a6d006ee-8745-4ce3-9c51-4307d3d65379', '5f528cd8-091a-4982-83ea-6d3d13d1c81f', '2024-12-13', 'entretien', 'تغيير البطارية', 117000, NULL),
	('bd65f70c-66f6-4e8a-8792-b09509da406a', '5f528cd8-091a-4982-83ea-6d3d13d1c81f', '2026-07-23', 'visite', 'الفحص التقني — صالح', 155419, NULL);
INSERT INTO public.listing_history VALUES
	('4d3f37ab-e8b2-43bc-a8f8-b17c9e8782d3', '9a5a936c-da2b-4306-a00e-8e7537b20fce', '2016-06-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Ford Fiesta 1.5 TDCi Trend'),
	('808cdb00-beed-4fb4-bb0d-3736fa1e8671', '9a5a936c-da2b-4306-a00e-8e7537b20fce', '2018-09-14', 'entretien', 'صيانة كبرى في الوكالة', 27500, NULL),
	('c924b085-d327-4c23-8ccc-0fa6e2680b93', '9a5a936c-da2b-4306-a00e-8e7537b20fce', '2019-09-27', 'proprietaire', 'تغيير المالك رقم 2', 41500, NULL),
	('1f4e4d01-c201-4f7c-8eff-a4e6f4c3f3a6', '9a5a936c-da2b-4306-a00e-8e7537b20fce', '2020-03-13', 'entretien', 'تغيير سير التوزيع', 55000, NULL),
	('5372a022-152a-43d2-b1cb-7bf13bc5dd84', '9a5a936c-da2b-4306-a00e-8e7537b20fce', '2022-01-25', 'entretien', 'صيانة كبرى في الوكالة', 83000, NULL),
	('2ec415eb-ad89-40fa-86dd-45b451f23f08', '9a5a936c-da2b-4306-a00e-8e7537b20fce', '2023-09-15', 'proprietaire', 'تغيير المالك رقم 3', 96500, NULL),
	('6b6a55c2-bc19-459f-9fab-25555c48f6cc', '9a5a936c-da2b-4306-a00e-8e7537b20fce', '2024-10-21', 'entretien', 'تغيير الفرامل الأمامية', 110500, NULL),
	('b9d52113-5630-440b-9cc6-7ef1a3334012', '9a5a936c-da2b-4306-a00e-8e7537b20fce', '2026-06-24', 'visite', 'الفحص التقني — صالح', 136168, NULL),
	('7c8dee85-301c-41da-80db-96cf94009062', '0bb37c12-4cc8-41c5-a328-db3e11bca49a', '2022-06-16', 'entretien', 'تغيير البطارية', 8500, NULL),
	('f7eef6c4-ab31-40d7-a5a6-10b37ff0cf98', '3bd091a8-b5cc-4aea-b415-6b7ab4e59938', '2017-10-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Ford Focus 1.5 TDCi Titanium'),
	('2bdbf228-23b3-42af-90b2-aac39792e952', '3bd091a8-b5cc-4aea-b415-6b7ab4e59938', '2019-09-11', 'entretien', 'تغيير سير التوزيع', 28500, NULL),
	('37478f9a-2740-4a49-9290-4f7965395e72', '3bd091a8-b5cc-4aea-b415-6b7ab4e59938', '2021-06-27', 'entretien', 'صيانة كبرى في الوكالة', 57500, NULL),
	('9b19930e-8f0e-41b5-a5e0-0c1976ec69cf', '3bd091a8-b5cc-4aea-b415-6b7ab4e59938', '2022-02-17', 'proprietaire', 'تغيير المالك رقم 2', 71500, NULL),
	('a4271226-91ab-4cdd-8478-add6079230c8', '3bd091a8-b5cc-4aea-b415-6b7ab4e59938', '2022-06-23', 'entretien', 'تغيير سير التوزيع', 71500, NULL),
	('a589649b-9099-43c5-a102-30b67367218f', '3bd091a8-b5cc-4aea-b415-6b7ab4e59938', '2024-01-15', 'entretien', 'تغيير سير التوزيع', 100500, NULL),
	('ccd201ef-26c8-4776-aa16-a75d24ab807b', '3bd091a8-b5cc-4aea-b415-6b7ab4e59938', '2026-06-15', 'visite', 'الفحص التقني — صالح', 127771, NULL),
	('8166bbc5-b8b7-4f0e-b7d5-bc0c7eb34126', 'c15a776e-44aa-4cac-9252-fa14bb8c1738', '2014-11-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Fiat Punto 1.3 Multijet Easy'),
	('9dd461e7-42d8-4601-aecd-ae8a0f49951c', 'c15a776e-44aa-4cac-9252-fa14bb8c1738', '2016-12-22', 'entretien', 'تغيير الفرامل الأمامية', 28500, NULL),
	('6163ba4d-30ed-40d9-9078-4ad5537b61d8', 'c15a776e-44aa-4cac-9252-fa14bb8c1738', '2017-02-13', 'proprietaire', 'تغيير المالك رقم 2', 43000, NULL),
	('1004e87d-5908-41d0-87ab-fef5b1259c36', 'c15a776e-44aa-4cac-9252-fa14bb8c1738', '2019-08-19', 'entretien', 'صيانة دورية: زيت + فلاتر', 71500, NULL),
	('09447704-8c42-48d5-a54a-578fb387dbb1', 'c15a776e-44aa-4cac-9252-fa14bb8c1738', '2020-05-23', 'proprietaire', 'تغيير المالك رقم 3', 86000, NULL),
	('34675805-bf42-425c-b0e8-0d7555c8321a', 'c15a776e-44aa-4cac-9252-fa14bb8c1738', '2021-07-22', 'entretien', 'تغيير البطارية', 100500, NULL),
	('db065f05-b014-4a2c-8d7d-b7d15633363a', 'c15a776e-44aa-4cac-9252-fa14bb8c1738', '2023-02-10', 'proprietaire', 'تغيير المالك رقم 4', 129000, NULL),
	('1aab7a4f-1b8a-4090-8245-2877f2993981', 'c15a776e-44aa-4cac-9252-fa14bb8c1738', '2024-12-26', 'entretien', 'تغيير البطارية', 143500, NULL),
	('d27632aa-f2fd-4305-a85c-ab67e80afcd3', 'c15a776e-44aa-4cac-9252-fa14bb8c1738', '2026-03-26', 'visite', 'الفحص التقني — صالح', 169601, NULL),
	('62f38db3-2923-499d-a3c9-c09eb8c83b9d', '839812f3-c38d-492b-8b99-42667682ed9f', '2019-03-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Fiat Tipo 1.3 Multijet Lounge'),
	('ef946683-6d74-4838-ad0e-2efcdad8c1ca', '839812f3-c38d-492b-8b99-42667682ed9f', '2021-02-22', 'proprietaire', 'تغيير المالك رقم 2', 26000, NULL),
	('0411691d-ceec-4ca1-a31a-2cdc73a72389', '839812f3-c38d-492b-8b99-42667682ed9f', '2021-06-11', 'entretien', 'تغيير الفرامل الأمامية', 26000, NULL),
	('e4b9d41e-9cf9-4309-a8a7-583e412c7c7f', '839812f3-c38d-492b-8b99-42667682ed9f', '2022-05-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خفيفة في الصدام الأمامي — تم الإصلاح'),
	('a97ae678-0b2c-446a-8941-243af93070bd', '839812f3-c38d-492b-8b99-42667682ed9f', '2023-01-16', 'entretien', 'تغيير الإطارات الأربعة', 52000, NULL),
	('4f8a5216-ae6a-43ab-bcfa-809b07280fa1', '839812f3-c38d-492b-8b99-42667682ed9f', '2024-05-11', 'entretien', 'صيانة دورية: زيت + فلاتر', 65000, NULL),
	('fa67ee7e-7ea5-46cd-821d-fd0eb8d38b69', '839812f3-c38d-492b-8b99-42667682ed9f', '2024-09-14', 'proprietaire', 'تغيير المالك رقم 3', 65000, NULL),
	('38102778-ba63-4a81-bf7e-1abbdb173591', '839812f3-c38d-492b-8b99-42667682ed9f', '2026-01-18', 'visite', 'الفحص التقني — صالح', 89453, NULL),
	('a2a0a834-917b-435f-9fdc-c495e5caadac', 'e527e457-f89f-49cd-85a6-37b78ad9ecde', '2018-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Seat Ibiza 1.6 TDI Style'),
	('63dc4cd2-646e-4ecf-9ef1-935233964c18', 'e527e457-f89f-49cd-85a6-37b78ad9ecde', '2020-12-25', 'entretien', 'صيانة دورية: زيت + فلاتر', 26500, NULL),
	('2fd41cc3-5eb3-4495-9fae-3d0986781b00', 'e527e457-f89f-49cd-85a6-37b78ad9ecde', '2021-01-20', 'entretien', 'صيانة كبرى في الوكالة', 40000, NULL),
	('ddc8de6c-77ea-4a4e-a1de-ee702dbf0482', 'e527e457-f89f-49cd-85a6-37b78ad9ecde', '2021-09-12', 'proprietaire', 'تغيير المالك رقم 2', 40000, NULL),
	('195250d6-4aaf-47d4-97c5-c03521206c4e', 'e527e457-f89f-49cd-85a6-37b78ad9ecde', '2023-01-27', 'proprietaire', 'تغيير المالك رقم 3', 66500, NULL),
	('012d1434-70e1-4c47-bf3a-791c2b5d200f', 'e527e457-f89f-49cd-85a6-37b78ad9ecde', '2023-07-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خلفية خفيفة — تغيير الصدام'),
	('5868ccfa-4cb4-4566-90c1-cf9caec549f9', 'e527e457-f89f-49cd-85a6-37b78ad9ecde', '2023-07-18', 'entretien', 'صيانة دورية: زيت + فلاتر', 66500, NULL),
	('4f982903-a039-4ee1-818e-b1d0c052b366', 'e527e457-f89f-49cd-85a6-37b78ad9ecde', '2024-12-19', 'entretien', 'تغيير سير التوزيع', 79500, NULL),
	('3b9370cc-9717-4512-b8da-5fa8d86e3159', 'e527e457-f89f-49cd-85a6-37b78ad9ecde', '2026-08-19', 'visite', 'الفحص التقني — صالح', 104062, NULL),
	('08a42990-809e-4ccd-be64-38f3430509fa', '62af184d-6656-4fda-a4ed-46b66ab54b2c', '2017-10-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Seat Leon 1.6 TDI FR'),
	('e41de0b7-a8d3-4d80-be9a-13e8c3ca4bd2', '62af184d-6656-4fda-a4ed-46b66ab54b2c', '2019-08-12', 'entretien', 'تغيير الفرامل الأمامية', 29500, NULL),
	('9e8c58af-a5d9-401a-bad8-7288b4ed42fe', '62af184d-6656-4fda-a4ed-46b66ab54b2c', '2021-09-26', 'entretien', 'تغيير البطارية', 58500, NULL),
	('db16ef8f-46ad-46ff-94a5-7fd27ffc3aa1', '62af184d-6656-4fda-a4ed-46b66ab54b2c', '2022-02-14', 'proprietaire', 'تغيير المالك رقم 2', 73500, NULL),
	('0234e12a-fdd8-46db-bcc3-513d5eb4ce2b', '62af184d-6656-4fda-a4ed-46b66ab54b2c', '2022-11-17', 'entretien', 'تغيير البطارية', 73500, NULL),
	('5b146a8b-220e-44bd-b489-482cd6ee219d', '62af184d-6656-4fda-a4ed-46b66ab54b2c', '2024-08-22', 'entretien', 'تغيير الفرامل الأمامية', 102500, NULL),
	('cea966c9-dbd6-44f9-84d1-8447f430ce89', '62af184d-6656-4fda-a4ed-46b66ab54b2c', '2026-04-16', 'visite', 'الفحص التقني — صالح', 129827, NULL),
	('6a6b5a2b-a450-423f-8a77-eedd1ba270d1', 'bf50e95c-37ff-429e-a07f-f475f3305d17', '2018-04-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Skoda Octavia 1.6 TDI Ambition');
INSERT INTO public.listing_history VALUES
	('224f7352-abb1-4b0a-b1d5-4140932f3e30', 'bf50e95c-37ff-429e-a07f-f475f3305d17', '2020-02-21', 'entretien', 'تغيير الفرامل الأمامية', 28500, NULL),
	('258c9a6d-7f59-40f4-8243-b3e43f5b2034', 'bf50e95c-37ff-429e-a07f-f475f3305d17', '2021-08-13', 'entretien', 'صيانة كبرى في الوكالة', 43000, NULL),
	('2ced7404-14c9-4c8f-ba18-b279662327a5', 'bf50e95c-37ff-429e-a07f-f475f3305d17', '2021-08-22', 'proprietaire', 'تغيير المالك رقم 2', 43000, NULL),
	('1f97cf36-ebe8-4efa-8339-bec471d8fbed', 'bf50e95c-37ff-429e-a07f-f475f3305d17', '2023-01-16', 'entretien', 'تغيير البطارية', 71500, NULL),
	('9bc06196-bf40-4e7f-8d39-8e49f320cc02', 'bf50e95c-37ff-429e-a07f-f475f3305d17', '2023-04-26', 'proprietaire', 'تغيير المالك رقم 3', 71500, NULL),
	('24606690-faef-480d-bb3e-9fd72e26fe2f', 'bf50e95c-37ff-429e-a07f-f475f3305d17', '2024-03-25', 'entretien', 'صيانة كبرى في الوكالة', 85500, NULL),
	('64228ef7-721b-422d-ba73-9faa6ac39dd0', 'bf50e95c-37ff-429e-a07f-f475f3305d17', '2026-04-27', 'visite', 'الفحص التقني — صالح', 112305, NULL),
	('d0a4644c-6ac9-44e9-b202-be0974f5949f', '91a91ab7-3660-4da1-8092-4e426967c1f7', '2017-05-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Skoda Fabia 1.4 TDI Active'),
	('8348a941-edf9-4941-b97a-3a9b9cd40572', '91a91ab7-3660-4da1-8092-4e426967c1f7', '2019-11-25', 'entretien', 'تغيير الفرامل الأمامية', 28000, NULL),
	('c3851688-c0c2-4274-b254-25b47347bb30', '91a91ab7-3660-4da1-8092-4e426967c1f7', '2020-09-10', 'proprietaire', 'تغيير المالك رقم 2', 42500, NULL),
	('5f14e1f6-14f2-43ba-95c6-1c7e1fe3ef32', '91a91ab7-3660-4da1-8092-4e426967c1f7', '2021-11-22', 'entretien', 'تغيير الإطارات الأربعة', 56500, NULL),
	('62ed1060-1ac0-47e1-a4dc-19fb524ad0b7', '91a91ab7-3660-4da1-8092-4e426967c1f7', '2022-03-10', 'entretien', 'صيانة دورية: زيت + فلاتر', 70500, NULL),
	('21ea1e15-90b6-43a1-a77e-da71f6d6c2fa', '91a91ab7-3660-4da1-8092-4e426967c1f7', '2023-01-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خلفية خفيفة — تغيير الصدام'),
	('3441c9a0-c415-4501-b94b-ce3774fafcdc', '91a91ab7-3660-4da1-8092-4e426967c1f7', '2023-08-18', 'proprietaire', 'تغيير المالك رقم 3', 84500, NULL),
	('decfcc86-378a-4cce-810f-d36bd64258c9', '91a91ab7-3660-4da1-8092-4e426967c1f7', '2024-01-19', 'entretien', 'تغيير البطارية', 99000, NULL),
	('b5ed9a4d-be9b-4545-a7d8-b51c3075bb74', '91a91ab7-3660-4da1-8092-4e426967c1f7', '2026-03-25', 'visite', 'الفحص التقني — صالح', 124350, NULL),
	('ee531dcc-56fd-47f9-9e4e-da1f83f47076', '5a7d6ede-e726-469b-89cd-f4a3d6aa04dc', '2016-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Mercedes Classe C 220 d Avantgarde'),
	('875a5e22-8ade-4f2c-bb34-876ebc9d232b', '5a7d6ede-e726-469b-89cd-f4a3d6aa04dc', '2018-12-25', 'entretien', 'تغيير الإطارات الأربعة', 29500, NULL),
	('ae600cde-9c86-4206-b0d1-f43d06820190', '5a7d6ede-e726-469b-89cd-f4a3d6aa04dc', '2020-02-23', 'entretien', 'تغيير سير التوزيع', 59000, NULL),
	('446c8d79-4ee7-44dc-950a-2a1d068b0905', '5a7d6ede-e726-469b-89cd-f4a3d6aa04dc', '2022-04-11', 'entretien', 'تغيير الإطارات الأربعة', 89000, NULL),
	('75de86db-5afe-4c52-b662-70e7ce0e6b78', '5a7d6ede-e726-469b-89cd-f4a3d6aa04dc', '2024-09-10', 'entretien', 'تغيير سير التوزيع', 118500, NULL),
	('84d76dad-e270-447a-81e5-45bd0eebd310', '5a7d6ede-e726-469b-89cd-f4a3d6aa04dc', '2026-07-21', 'visite', 'الفحص التقني — صالح', 147344, NULL),
	('cf7c8d7b-f0df-4634-9dfe-eb264fcb897a', 'c4c35c25-3b11-4e3a-8c88-891410365a05', '2018-04-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Mercedes Classe A 180 d AMG Line'),
	('d275ed12-8cd2-4a27-a71b-3cd53bc7db70', 'c4c35c25-3b11-4e3a-8c88-891410365a05', '2020-07-14', 'entretien', 'صيانة دورية: زيت + فلاتر', 24000, NULL),
	('30e2b48b-b50f-47b6-8f9b-03572a1fbbf7', 'c4c35c25-3b11-4e3a-8c88-891410365a05', '2021-10-13', 'entretien', 'تغيير سير التوزيع', 36000, NULL),
	('f8ad42a7-4963-4386-b038-e99c7cf161c5', 'c4c35c25-3b11-4e3a-8c88-891410365a05', '2023-07-15', 'entretien', 'تغيير الإطارات الأربعة', 60000, NULL),
	('49d2b54f-425f-41e2-9ff4-11dc05998c57', 'c4c35c25-3b11-4e3a-8c88-891410365a05', '2024-04-15', 'entretien', 'تغيير البطارية', 72000, NULL),
	('a7e202db-8aa5-4836-8a77-c31513d35af6', 'c4c35c25-3b11-4e3a-8c88-891410365a05', '2026-02-15', 'visite', 'الفحص التقني — صالح', 94825, NULL),
	('bce8e959-0c17-4d91-b237-984e18e801ee', '9ffebc7b-800c-4b19-ae17-2c1e84643811', '2014-08-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Mercedes Classe E 220 CDI Executive'),
	('f3a4d59f-beef-48a4-a2c6-cdb697c1634f', '9ffebc7b-800c-4b19-ae17-2c1e84643811', '2016-11-10', 'entretien', 'صيانة دورية: زيت + فلاتر', 35500, NULL),
	('c782e428-50af-477c-94ba-490ebe1c5714', '9ffebc7b-800c-4b19-ae17-2c1e84643811', '2019-08-21', 'entretien', 'تغيير سير التوزيع', 89000, NULL),
	('946cb2e1-9626-4f49-be02-3233982759c1', '9ffebc7b-800c-4b19-ae17-2c1e84643811', '2020-04-21', 'proprietaire', 'تغيير المالك رقم 2', 107000, NULL),
	('b30b06a2-5287-444d-ac04-1dea11617fb1', '9ffebc7b-800c-4b19-ae17-2c1e84643811', '2021-02-15', 'entretien', 'صيانة كبرى في الوكالة', 125000, NULL),
	('cb20ba17-0637-4438-8b98-07bcc4da608f', '9ffebc7b-800c-4b19-ae17-2c1e84643811', '2024-06-21', 'entretien', 'تغيير الإطارات الأربعة', 178500, NULL),
	('f4847ea2-5907-4445-bc9a-6b620165b075', '9ffebc7b-800c-4b19-ae17-2c1e84643811', '2026-05-13', 'visite', 'الفحص التقني — صالح', 213257, NULL),
	('4b89bd07-bbb1-4350-b46b-31b31d364a32', '8b6355f8-34bd-41a2-baf0-dc86892f1e0c', '2016-09-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'BMW Série 3 320d Sport Line'),
	('754fd9df-daa6-4474-848e-ab70a51154bc', '8b6355f8-34bd-41a2-baf0-dc86892f1e0c', '2018-04-25', 'entretien', 'تغيير الإطارات الأربعة', 31000, NULL),
	('7cbae551-04e8-4182-92bd-4c1c48024510', '8b6355f8-34bd-41a2-baf0-dc86892f1e0c', '2020-06-23', 'entretien', 'صيانة كبرى في الوكالة', 61500, NULL),
	('3982d768-5116-49f1-92f8-14d8429a7bad', '8b6355f8-34bd-41a2-baf0-dc86892f1e0c', '2021-06-19', 'proprietaire', 'تغيير المالك رقم 2', 77000, NULL),
	('243c4abb-4641-433f-a2c7-0c978fa5005f', '8b6355f8-34bd-41a2-baf0-dc86892f1e0c', '2022-01-18', 'entretien', 'تغيير الفرامل الأمامية', 92500, NULL),
	('8869ea25-799e-49d4-9325-e5c45ed9db90', '8b6355f8-34bd-41a2-baf0-dc86892f1e0c', '2024-01-24', 'entretien', 'تغيير الفرامل الأمامية', 123000, NULL),
	('1a067c32-52e1-41bf-9afa-f82f501e1857', '8b6355f8-34bd-41a2-baf0-dc86892f1e0c', '2026-03-23', 'visite', 'الفحص التقني — صالح', 152068, NULL),
	('d9ce711d-b25e-4de4-bd57-527eb9a2e918', '69332398-0da3-45e6-8d36-cea7ff148815', '2017-11-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'BMW X1 sDrive18d xLine'),
	('7cad1215-651a-4399-a15b-c3795345aab5', '69332398-0da3-45e6-8d36-cea7ff148815', '2019-05-25', 'entretien', 'تغيير الفرامل الأمامية', 28000, NULL),
	('a83f9027-c874-49e7-9f9c-e1b4d54d8042', '69332398-0da3-45e6-8d36-cea7ff148815', '2021-06-11', 'entretien', 'تغيير البطارية', 56000, NULL),
	('1e39d92c-4058-475d-b57c-0ad036d15511', '69332398-0da3-45e6-8d36-cea7ff148815', '2022-02-10', 'entretien', 'تغيير الإطارات الأربعة', 70000, NULL),
	('01dd70fa-ccdd-4b98-85dc-74fa63655752', '69332398-0da3-45e6-8d36-cea7ff148815', '2024-07-26', 'entretien', 'تغيير سير التوزيع', 98000, NULL),
	('c725889c-3676-4447-b5de-fb2cb2d47a3a', '69332398-0da3-45e6-8d36-cea7ff148815', '2026-01-25', 'visite', 'الفحص التقني — صالح', 123208, NULL),
	('e0e5995d-2fbb-44e1-a791-e4f5eb36c7a6', '65203abc-a955-4d3c-b67c-85fdfe3e95a9', '2015-06-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'BMW Série 1 116d Urban'),
	('b3c5f38c-466a-4609-b062-13814251922c', '65203abc-a955-4d3c-b67c-85fdfe3e95a9', '2017-07-11', 'entretien', 'تغيير سير التوزيع', 30500, NULL);
INSERT INTO public.listing_history VALUES
	('ce4a09fa-e56f-4f43-912e-9ec002a34157', '65203abc-a955-4d3c-b67c-85fdfe3e95a9', '2019-04-26', 'entretien', 'تغيير سير التوزيع', 61000, NULL),
	('b82c75de-1918-444c-8221-69168d323b4e', '65203abc-a955-4d3c-b67c-85fdfe3e95a9', '2021-02-25', 'proprietaire', 'تغيير المالك رقم 2', 91500, NULL),
	('9d7d409f-3b35-44aa-b28e-86bed3539ed9', '65203abc-a955-4d3c-b67c-85fdfe3e95a9', '2022-11-22', 'entretien', 'تغيير سير التوزيع', 107000, NULL),
	('814503a2-e3d4-4e47-b89d-f78e2e7ea01b', '65203abc-a955-4d3c-b67c-85fdfe3e95a9', '2024-05-22', 'entretien', 'تغيير البطارية', 137500, NULL),
	('d499327c-d87c-401c-baa0-eae542fe2069', '65203abc-a955-4d3c-b67c-85fdfe3e95a9', '2026-08-13', 'visite', 'الفحص التقني — صالح', 166359, NULL),
	('50951f9d-3711-4c0b-93a7-edec651f0f7b', '27a839e1-1290-473e-a0dd-e5dd854be97a', '2017-02-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Audi A3 2.0 TDI S line'),
	('c7091961-f2db-440a-9481-55f717e020e3', '27a839e1-1290-473e-a0dd-e5dd854be97a', '2019-03-11', 'entretien', 'تغيير الفرامل الأمامية', 30000, NULL),
	('c91faff4-41fc-452d-b9b8-538f9db3cf38', '27a839e1-1290-473e-a0dd-e5dd854be97a', '2021-06-12', 'entretien', 'تغيير سير التوزيع', 59500, NULL),
	('59c1ea6a-4838-4d09-af52-e86a0ebf2092', '27a839e1-1290-473e-a0dd-e5dd854be97a', '2022-05-10', 'entretien', 'تغيير الفرامل الأمامية', 74500, NULL),
	('070e17e8-d202-4e24-b5a4-70729d644e2e', '27a839e1-1290-473e-a0dd-e5dd854be97a', '2024-10-12', 'entretien', 'تغيير البطارية', 104000, NULL),
	('02614bb1-7108-4f66-8287-b45bf7361963', '27a839e1-1290-473e-a0dd-e5dd854be97a', '2026-04-21', 'visite', 'الفحص التقني — صالح', 133022, NULL),
	('51b12382-e519-4b3b-96b1-bf04cfdfafd4', '1f2c03b6-1f7e-4f4c-ab7b-0948fb8f1c73', '2016-01-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Audi Q3 2.0 TDI quattro'),
	('7f3ec13b-48c6-47bf-965c-b7a806e7542b', '1f2c03b6-1f7e-4f4c-ab7b-0948fb8f1c73', '2018-02-14', 'entretien', 'تغيير سير التوزيع', 31500, NULL),
	('9f1af5d8-2719-478f-ad28-fbce815bf1b4', '1f2c03b6-1f7e-4f4c-ab7b-0948fb8f1c73', '2020-11-10', 'entretien', 'صيانة دورية: زيت + فلاتر', 63000, NULL),
	('0b98649f-c95a-4d2a-98da-f101c6d32dec', '1f2c03b6-1f7e-4f4c-ab7b-0948fb8f1c73', '2022-11-18', 'entretien', 'صيانة كبرى في الوكالة', 95000, NULL),
	('345bfa84-16da-444a-b28d-096595d3c353', '1f2c03b6-1f7e-4f4c-ab7b-0948fb8f1c73', '2024-04-11', 'entretien', 'صيانة دورية: زيت + فلاتر', 126500, NULL),
	('04decd6b-a3a4-4978-b66d-a835a59c6dc7', '1f2c03b6-1f7e-4f4c-ab7b-0948fb8f1c73', '2026-03-15', 'visite', 'الفحص التقني — صالح', 156652, NULL),
	('32110e81-7f5f-4159-b9d5-c2a3e670636e', '229772c0-f5b7-4c0d-9c52-9d923a2ac28f', '2018-06-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Audi A4 2.0 TDI Design'),
	('ccc7bc50-cfc5-4c3c-9076-77de42c3bb1e', '229772c0-f5b7-4c0d-9c52-9d923a2ac28f', '2020-02-12', 'entretien', 'تغيير الإطارات الأربعة', 28000, NULL),
	('0ae89a59-dddc-488b-a5f0-b87b1a9ddebc', '229772c0-f5b7-4c0d-9c52-9d923a2ac28f', '2021-09-17', 'entretien', 'تغيير الإطارات الأربعة', 42000, NULL),
	('09d7acce-b942-45d3-bc61-147f7e1a0c85', '229772c0-f5b7-4c0d-9c52-9d923a2ac28f', '2022-09-24', 'proprietaire', 'تغيير المالك رقم 2', 56000, NULL),
	('c521a5fe-62ed-49b3-988b-a46b7120c356', '229772c0-f5b7-4c0d-9c52-9d923a2ac28f', '2023-09-14', 'entretien', 'تغيير سير التوزيع', 70000, NULL),
	('9fafc67e-1197-457a-acf6-75e2e4db5267', '229772c0-f5b7-4c0d-9c52-9d923a2ac28f', '2024-02-14', 'entretien', 'تغيير البطارية', 84000, NULL),
	('70db54d1-b4d5-45d2-bdfd-d5b79ff44b23', '229772c0-f5b7-4c0d-9c52-9d923a2ac28f', '2026-03-23', 'visite', 'الفحص التقني — صالح', 110336, NULL),
	('abcf3dce-f7fb-4053-a9f6-027aa31c7252', '32c5ca5e-ef86-42f0-b071-2d76f7a5ab7f', '2017-09-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Nissan Qashqai 1.5 dCi Acenta'),
	('6814210c-8bfb-40ea-8eca-5c56b154a01b', '32c5ca5e-ef86-42f0-b071-2d76f7a5ab7f', '2019-03-10', 'entretien', 'تغيير الإطارات الأربعة', 27000, NULL),
	('5b4e6f88-6f9d-4178-ab70-cd99ed04b827', '32c5ca5e-ef86-42f0-b071-2d76f7a5ab7f', '2020-01-27', 'proprietaire', 'تغيير المالك رقم 2', 40500, NULL),
	('426053c0-e6f7-4d59-93a8-b9b2898735f6', '32c5ca5e-ef86-42f0-b071-2d76f7a5ab7f', '2021-04-14', 'accident', 'حادث مصرّح به', NULL, 'خدوش جانبية — صباغة جزئية للباب الأيمن'),
	('13abdedb-b3c2-44cd-b9a0-dece67f3b9ad', '32c5ca5e-ef86-42f0-b071-2d76f7a5ab7f', '2021-06-17', 'entretien', 'صيانة كبرى في الوكالة', 54000, NULL),
	('1fea5428-ba3f-4c71-ab76-d63822992db0', '32c5ca5e-ef86-42f0-b071-2d76f7a5ab7f', '2022-05-21', 'entretien', 'تغيير الإطارات الأربعة', 68000, NULL),
	('04279779-fee5-4793-8b82-fdf8c9962e2e', '32c5ca5e-ef86-42f0-b071-2d76f7a5ab7f', '2023-02-14', 'proprietaire', 'تغيير المالك رقم 3', 81500, NULL),
	('4a1d3ecc-1cbd-4f5e-89be-b6647aff408b', '32c5ca5e-ef86-42f0-b071-2d76f7a5ab7f', '2024-11-16', 'entretien', 'تغيير البطارية', 95000, NULL),
	('e32b978d-3c00-4f46-a1d8-1568a5889015', '32c5ca5e-ef86-42f0-b071-2d76f7a5ab7f', '2026-04-25', 'visite', 'الفحص التقني — صالح', 120445, NULL),
	('a92345f9-6a17-4c30-ab99-b3d39b22e5b3', 'b48349e7-d5ba-4770-a375-e5485ce8a6a2', '2016-05-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Nissan Micra 1.5 dCi Acenta'),
	('958ce0a3-1169-4467-b0f5-87f1fe6824c4', 'b48349e7-d5ba-4770-a375-e5485ce8a6a2', '2018-07-24', 'entretien', 'صيانة كبرى في الوكالة', 28000, NULL),
	('2fcd4218-a60f-468d-9164-c24d459c2c9f', 'b48349e7-d5ba-4770-a375-e5485ce8a6a2', '2019-04-19', 'proprietaire', 'تغيير المالك رقم 2', 42500, NULL),
	('806d166a-ad22-411a-843b-6bf9021369ee', 'b48349e7-d5ba-4770-a375-e5485ce8a6a2', '2020-06-27', 'entretien', 'تغيير البطارية', 56500, NULL),
	('42bdd0e3-9997-4f08-a905-454680507556', 'b48349e7-d5ba-4770-a375-e5485ce8a6a2', '2022-05-14', 'entretien', 'تغيير البطارية', 84500, NULL),
	('f2819c39-ca4e-4659-823f-8854435175b4', 'b48349e7-d5ba-4770-a375-e5485ce8a6a2', '2023-08-20', 'proprietaire', 'تغيير المالك رقم 3', 98500, NULL),
	('9b8afaed-2c4f-4a3c-9e78-66fe86d42c45', 'b48349e7-d5ba-4770-a375-e5485ce8a6a2', '2024-03-13', 'entretien', 'تغيير الفرامل الأمامية', 113000, NULL),
	('fc2ae3cb-61ba-4b83-9c85-ecf04adbeda9', 'b48349e7-d5ba-4770-a375-e5485ce8a6a2', '2026-08-23', 'visite', 'الفحص التقني — صالح', 138153, NULL),
	('df0a077c-62c9-4de9-87d9-04142085f3ba', 'f8124c57-0e7f-4150-8951-ef9a80508002', '2017-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Opel Corsa 1.3 CDTi Enjoy'),
	('28f3c484-0e66-4785-bc22-6419a46b75f9', 'f8124c57-0e7f-4150-8951-ef9a80508002', '2019-04-20', 'entretien', 'تغيير سير التوزيع', 26000, NULL),
	('23edef78-571b-4c50-b2ea-dbc343af7daf', 'f8124c57-0e7f-4150-8951-ef9a80508002', '2021-01-20', 'entretien', 'تغيير الإطارات الأربعة', 51500, NULL),
	('dc393ced-4b72-410c-823e-daaab57556a8', 'f8124c57-0e7f-4150-8951-ef9a80508002', '2022-12-17', 'entretien', 'تغيير الفرامل الأمامية', 64500, NULL),
	('46e022d7-12a7-4522-8e54-60750e3620da', 'f8124c57-0e7f-4150-8951-ef9a80508002', '2024-01-22', 'entretien', 'تغيير الفرامل الأمامية', 90000, NULL),
	('88b97150-c014-4253-95c8-e5296cc76657', 'f8124c57-0e7f-4150-8951-ef9a80508002', '2026-07-19', 'visite', 'الفحص التقني — صالح', 114699, NULL),
	('dd7920bf-f13b-4692-924f-35e9910cca6f', '4abe0921-b16c-46b4-b970-275261f6d0fb', '2019-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Jeep Compass 1.6 MultiJet Limited'),
	('184d81db-1592-48cb-8a5e-e2df9b09ef5c', '4abe0921-b16c-46b4-b970-275261f6d0fb', '2021-02-21', 'entretien', 'تغيير الفرامل الأمامية', 25500, NULL),
	('68e965d9-fb28-4be0-9405-3bf61fa475d0', '4abe0921-b16c-46b4-b970-275261f6d0fb', '2023-03-12', 'proprietaire', 'تغيير المالك رقم 2', 51000, NULL);
INSERT INTO public.listing_history VALUES
	('0ccffd31-25ff-41c6-aa67-c23afa000881', '4abe0921-b16c-46b4-b970-275261f6d0fb', '2023-12-20', 'entretien', 'تغيير سير التوزيع', 51000, NULL),
	('658c7eb6-7aee-423f-b0ac-12468d5b9fe3', '4abe0921-b16c-46b4-b970-275261f6d0fb', '2024-07-10', 'entretien', 'صيانة كبرى في الوكالة', 63500, NULL),
	('a114fb70-04d2-4541-92b1-843c963eb968', '4abe0921-b16c-46b4-b970-275261f6d0fb', '2026-05-27', 'visite', 'الفحص التقني — صالح', 87266, NULL),
	('1147d1cb-6939-45a8-a77a-ef61ed33779f', 'e098952f-09b4-480a-8e7c-7f4eba6d847d', '2015-05-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Land Rover Range Rover Evoque 2.0 eD4 Pure'),
	('ab340008-7dfc-4bf3-9dbe-250ab9f97e58', 'e098952f-09b4-480a-8e7c-7f4eba6d847d', '2017-12-10', 'entretien', 'تغيير الإطارات الأربعة', 29500, NULL),
	('9dbf712b-f239-44f4-a980-739b0756999e', 'e098952f-09b4-480a-8e7c-7f4eba6d847d', '2019-03-25', 'entretien', 'تغيير البطارية', 59000, NULL),
	('a798a828-af40-4dc6-a4d3-19da243a5653', 'e098952f-09b4-480a-8e7c-7f4eba6d847d', '2019-04-19', 'proprietaire', 'تغيير المالك رقم 2', 59000, NULL),
	('3f28611c-3d03-4b7a-89c5-375a93ab5ed5', 'e098952f-09b4-480a-8e7c-7f4eba6d847d', '2022-08-21', 'proprietaire', 'تغيير المالك رقم 3', 103000, NULL),
	('d1afdfdb-5cea-46c1-af92-263c5751cf0d', 'e098952f-09b4-480a-8e7c-7f4eba6d847d', '2022-11-14', 'entretien', 'تغيير الفرامل الأمامية', 103000, NULL),
	('a856367c-e67d-4306-88a4-82a4e4f2e6d8', 'e098952f-09b4-480a-8e7c-7f4eba6d847d', '2024-04-26', 'entretien', 'تغيير الفرامل الأمامية', 132500, NULL),
	('67668558-851b-45f0-ab88-776722832792', 'e098952f-09b4-480a-8e7c-7f4eba6d847d', '2026-04-22', 'visite', 'الفحص التقني — صالح', 161589, NULL),
	('aafd4401-42ad-4e6d-8b2d-7cbdc77d5b2d', '36c42e43-6a01-465e-ba55-bdc1cc38bb79', '2018-03-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Suzuki Swift 1.2 Essence GL'),
	('0bcf990c-3e56-4f39-9053-fe316d9c6a65', '36c42e43-6a01-465e-ba55-bdc1cc38bb79', '2020-11-13', 'entretien', 'صيانة دورية: زيت + فلاتر', 22000, NULL),
	('8a30d207-8ff9-4e6a-a75f-eef7aae98a26', '36c42e43-6a01-465e-ba55-bdc1cc38bb79', '2021-10-15', 'entretien', 'تغيير البطارية', 32500, NULL),
	('66f0ccbd-0892-494f-921b-d5b20d2e1e24', '36c42e43-6a01-465e-ba55-bdc1cc38bb79', '2022-07-17', 'proprietaire', 'تغيير المالك رقم 2', 43500, NULL),
	('7cd2d1bd-4de9-4f9a-af01-95de3ed64c50', '36c42e43-6a01-465e-ba55-bdc1cc38bb79', '2023-02-25', 'entretien', 'تغيير الإطارات الأربعة', 54500, NULL),
	('de58f59b-8d2b-48bc-839b-41bdd303113b', '36c42e43-6a01-465e-ba55-bdc1cc38bb79', '2024-07-10', 'entretien', 'تغيير سير التوزيع', 65500, NULL),
	('254db8da-df4d-478b-b3d2-d3a72c3aa2f2', '36c42e43-6a01-465e-ba55-bdc1cc38bb79', '2026-06-13', 'visite', 'الفحص التقني — صالح', 84437, NULL),
	('f78454fb-c1d7-4359-a827-e46d5617b568', 'eb9a3d16-273e-4762-8818-691bdc6fe889', '2014-08-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Chevrolet Spark 1.0 Essence LS'),
	('5884b4ea-6ec1-4e12-b35e-b871510de469', 'eb9a3d16-273e-4762-8818-691bdc6fe889', '2016-05-10', 'entretien', 'تغيير الإطارات الأربعة', 26500, NULL),
	('b6cfd542-43d2-4291-b12c-ca573e2790d9', 'eb9a3d16-273e-4762-8818-691bdc6fe889', '2018-04-23', 'proprietaire', 'تغيير المالك رقم 2', 52500, NULL),
	('054d2931-3c08-4a2b-90a2-a1ca030e8a1f', 'eb9a3d16-273e-4762-8818-691bdc6fe889', '2019-11-25', 'entretien', 'صيانة كبرى في الوكالة', 66000, NULL),
	('285870ce-514c-4a75-b125-f866d61a8f6a', 'eb9a3d16-273e-4762-8818-691bdc6fe889', '2021-09-24', 'entretien', 'صيانة كبرى في الوكالة', 92000, NULL),
	('968e7cc7-ecc1-497c-a317-893b6dafd42b', 'eb9a3d16-273e-4762-8818-691bdc6fe889', '2022-01-25', 'proprietaire', 'تغيير المالك رقم 3', 105500, NULL),
	('4243d30a-c3c9-4760-b3a3-43bbc8dc83fb', 'eb9a3d16-273e-4762-8818-691bdc6fe889', '2024-07-17', 'entretien', 'صيانة كبرى في الوكالة', 131500, NULL),
	('c01bc14d-90e4-469b-9148-f48c4cdb7a93', 'eb9a3d16-273e-4762-8818-691bdc6fe889', '2026-01-11', 'visite', 'الفحص التقني — صالح', 157260, NULL),
	('07922e65-4f0b-4169-93c3-68e76959709f', '1f91c0ec-eda3-42f3-a253-be54d99e94e9', '2017-11-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Mitsubishi L200 2.4 DI-D 4x4 Intense'),
	('317310b1-782d-4cf0-a5a8-1664c6fcd33c', '1f91c0ec-eda3-42f3-a253-be54d99e94e9', '2019-06-20', 'entretien', 'صيانة دورية: زيت + فلاتر', 37500, NULL),
	('91a19e4d-6fb2-4384-8038-6c9ddab88065', '1f91c0ec-eda3-42f3-a253-be54d99e94e9', '2020-01-13', 'proprietaire', 'تغيير المالك رقم 2', 56000, NULL),
	('2b611611-091f-40a1-9d67-9aa70cdb17f9', '1f91c0ec-eda3-42f3-a253-be54d99e94e9', '2021-01-26', 'entretien', 'تغيير الفرامل الأمامية', 74500, NULL),
	('022e7cd1-a0e3-4a5c-b565-c1cb40ae1658', '1f91c0ec-eda3-42f3-a253-be54d99e94e9', '2022-08-11', 'entretien', 'صيانة كبرى في الوكالة', 93500, NULL),
	('c9df4d82-1413-421b-ad71-18267ee753ca', '1f91c0ec-eda3-42f3-a253-be54d99e94e9', '2023-06-10', 'proprietaire', 'تغيير المالك رقم 3', 112000, NULL),
	('0220d86f-32ca-4997-91d9-a6dddb7b8948', '1f91c0ec-eda3-42f3-a253-be54d99e94e9', '2024-01-27', 'entretien', 'تغيير الفرامل الأمامية', 130500, NULL),
	('6cdb2afa-f026-4494-b878-8405890b4ef3', '1f91c0ec-eda3-42f3-a253-be54d99e94e9', '2026-01-23', 'visite', 'الفحص التقني — صالح', 167012, NULL),
	('ea1d919e-835c-4308-8475-267d6ff0f37b', 'a4762a15-61c7-49fb-8bea-0c0e06fe6a7e', '2021-05-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Tesla Model 3 Standard Range Plus'),
	('0037e651-fcc8-4b3c-a30a-2915061f6739', 'a4762a15-61c7-49fb-8bea-0c0e06fe6a7e', '2023-09-10', 'entretien', 'تغيير الإطارات الأربعة', 21500, NULL),
	('b9561b0c-3f5a-48ba-902a-aa9d307acbc5', 'a4762a15-61c7-49fb-8bea-0c0e06fe6a7e', '2024-09-23', 'entretien', 'تغيير سير التوزيع', 32500, NULL),
	('0df383b9-224e-4fa9-96cb-89e805e06b45', 'a4762a15-61c7-49fb-8bea-0c0e06fe6a7e', '2026-08-20', 'visite', 'الفحص التقني — صالح', 53258, NULL),
	('b06ce14c-00c7-4ce9-8e40-6b2facae5c75', '7db9d656-c7e9-4279-ad30-49eae513bcb7', '2020-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Toyota Yaris 1.5 Hybride Dynamic'),
	('c191ef75-0c82-4b2b-af99-69625a970059', '7db9d656-c7e9-4279-ad30-49eae513bcb7', '2022-06-19', 'entretien', 'صيانة دورية: زيت + فلاتر', 20500, NULL),
	('298706fc-b91e-47fd-ac72-0dc97a6894c1', '7db9d656-c7e9-4279-ad30-49eae513bcb7', '2022-07-14', 'accident', 'حادث مصرّح به', NULL, 'خدوش جانبية — صباغة جزئية للباب الأيمن'),
	('7eb18fbd-fbbf-45b9-b2fa-41f6a0cf0b63', '7db9d656-c7e9-4279-ad30-49eae513bcb7', '2023-02-19', 'proprietaire', 'تغيير المالك رقم 2', 31000, NULL),
	('55af2dae-5394-42a9-9a36-237669254f9f', '7db9d656-c7e9-4279-ad30-49eae513bcb7', '2023-05-27', 'entretien', 'تغيير البطارية', 31000, NULL),
	('3bf98554-d5ca-460b-bdaf-ac848bc8f393', '7db9d656-c7e9-4279-ad30-49eae513bcb7', '2025-04-22', 'entretien', 'تغيير الإطارات الأربعة', 51500, NULL),
	('40f17ef9-d785-4287-bcca-003e64cc2be7', '7db9d656-c7e9-4279-ad30-49eae513bcb7', '2026-05-15', 'visite', 'الفحص التقني — صالح', 61180, NULL),
	('81428368-9044-4506-89e8-b3f08f5a3386', 'fef87298-562e-4aa8-9ce0-d3b8675e51a8', '2021-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Dacia Logan 1.0 SCe Essentiel'),
	('22a56b22-bb47-4383-b235-45264e04ca99', 'fef87298-562e-4aa8-9ce0-d3b8675e51a8', '2023-12-20', 'entretien', 'تغيير البطارية', 18500, NULL),
	('7d341e7e-c977-4d26-808d-f3e4f41ee52b', 'fef87298-562e-4aa8-9ce0-d3b8675e51a8', '2024-06-12', 'entretien', 'صيانة كبرى في الوكالة', 27500, NULL),
	('01986a9d-3b71-4efe-9fb3-7f23e1953939', 'fef87298-562e-4aa8-9ce0-d3b8675e51a8', '2026-06-24', 'visite', 'الفحص التقني — صالح', 43789, NULL),
	('f64235f8-5b0b-4225-9020-f290d01d8eec', 'd1a5b2b8-20c6-48e7-ba73-32942a6013f2', '2021-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Peugeot 208 1.2 PureTech Allure');
INSERT INTO public.listing_history VALUES
	('ccbafea1-c585-46c6-9e6a-823e2d2af605', 'd1a5b2b8-20c6-48e7-ba73-32942a6013f2', '2023-06-15', 'entretien', 'تغيير الإطارات الأربعة', 16500, NULL),
	('bab4bd2e-3b60-4403-80ce-fbf6646d8426', 'd1a5b2b8-20c6-48e7-ba73-32942a6013f2', '2024-01-27', 'proprietaire', 'تغيير المالك رقم 2', 24500, NULL),
	('4755b56f-166c-47bd-b12e-f4e9521b8d98', 'd1a5b2b8-20c6-48e7-ba73-32942a6013f2', '2024-06-22', 'entretien', 'تغيير الإطارات الأربعة', 24500, NULL),
	('aea5d142-7427-4a19-ae16-a40957635991', 'd1a5b2b8-20c6-48e7-ba73-32942a6013f2', '2026-05-16', 'visite', 'الفحص التقني — صالح', 38898, NULL),
	('6c4efe37-440c-453d-a6ad-ab68e3fe8ba8', 'dce2796d-5995-4087-b40f-b9015c32052c', '2021-09-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Volkswagen Golf 8 2.0 TDI Life'),
	('ebbb8f73-0096-49b8-a1ce-8b1df7291e0a', 'dce2796d-5995-4087-b40f-b9015c32052c', '2023-08-14', 'accident', 'حادث مصرّح به', NULL, 'خدوش جانبية — صباغة جزئية للباب الأيمن'),
	('9e1b211a-5a2c-4fa6-823a-f084bcdff46c', 'dce2796d-5995-4087-b40f-b9015c32052c', '2023-09-20', 'entretien', 'تغيير الإطارات الأربعة', 23000, NULL),
	('41045e44-154c-4b10-84a8-b7ed362cfb19', 'dce2796d-5995-4087-b40f-b9015c32052c', '2024-05-14', 'entretien', 'تغيير الفرامل الأمامية', 35000, NULL),
	('d9435209-7d20-4e0b-85a9-a18cb517d3f9', 'dce2796d-5995-4087-b40f-b9015c32052c', '2024-06-15', 'proprietaire', 'تغيير المالك رقم 2', 35000, NULL),
	('d38e111a-e27a-44a9-b049-255b522938e3', 'dce2796d-5995-4087-b40f-b9015c32052c', '2026-02-14', 'visite', 'الفحص التقني — صالح', 55026, NULL),
	('3b510179-2a1b-4332-80cf-e04327013e2a', 'a4523f41-20a6-4b00-ac7b-dafd3f9c0066', '2019-02-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Hyundai i20 1.4 CRDi Intuitive'),
	('7783f5ef-464d-4cd2-bd42-4de40aa6d726', 'a4523f41-20a6-4b00-ac7b-dafd3f9c0066', '2021-09-12', 'proprietaire', 'تغيير المالك رقم 2', 22500, NULL),
	('25dc1150-aa5e-4d25-abd7-ef86834d9abb', 'a4523f41-20a6-4b00-ac7b-dafd3f9c0066', '2021-12-18', 'entretien', 'تغيير البطارية', 22500, NULL),
	('82218c31-f398-4c9f-bcb6-642d65facfa2', 'a4523f41-20a6-4b00-ac7b-dafd3f9c0066', '2023-09-12', 'entretien', 'تغيير الإطارات الأربعة', 44500, NULL),
	('a29f2b79-a151-4d8b-a1d5-7352d1ca76a9', 'a4523f41-20a6-4b00-ac7b-dafd3f9c0066', '2024-03-22', 'entretien', 'تغيير البطارية', 55500, NULL),
	('1d81de9f-4868-404b-8fe5-c615a261bb95', 'a4523f41-20a6-4b00-ac7b-dafd3f9c0066', '2024-04-12', 'proprietaire', 'تغيير المالك رقم 3', 55500, NULL),
	('174755f4-fdc3-468b-8aad-e36d03c3a667', 'a4523f41-20a6-4b00-ac7b-dafd3f9c0066', '2026-01-26', 'visite', 'الفحص التقني — صالح', 77789, NULL),
	('a5e0ebaa-f97a-4815-9050-ed33f41af421', '6b4349d8-8f47-4cb2-9c53-a6a06e5e1981', '2019-10-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Yamaha MT-07 ABS'),
	('70a52d46-bd82-4664-9bda-ad8581a88d17', '6b4349d8-8f47-4cb2-9c53-a6a06e5e1981', '2021-02-12', 'proprietaire', 'تغيير المالك رقم 2', 7000, NULL),
	('90012df6-888a-4e75-acd3-ffac9cc9507e', '6b4349d8-8f47-4cb2-9c53-a6a06e5e1981', '2021-03-14', 'accident', 'حادث مصرّح به', NULL, 'خدوش جانبية — صباغة جزئية للباب الأيمن'),
	('3b9f244b-b58f-448f-8f22-32c95271f684', '6b4349d8-8f47-4cb2-9c53-a6a06e5e1981', '2021-04-20', 'entretien', 'تغيير البطارية', 7000, NULL),
	('25d48d27-205e-434e-8b38-6361d69e86c2', '6b4349d8-8f47-4cb2-9c53-a6a06e5e1981', '2023-03-11', 'entretien', 'صيانة دورية: زيت + فلاتر', 13500, NULL),
	('8e591ed7-e22a-4b8e-98ae-891a29ac6a4f', '6b4349d8-8f47-4cb2-9c53-a6a06e5e1981', '2024-06-11', 'entretien', 'صيانة دورية: زيت + فلاتر', 17000, NULL),
	('4083d162-ce36-4c2e-b252-b4d92a7d5868', '6b4349d8-8f47-4cb2-9c53-a6a06e5e1981', '2024-06-19', 'proprietaire', 'تغيير المالك رقم 3', 17000, NULL),
	('7be3035d-0596-488b-b135-a7929815b461', '6b4349d8-8f47-4cb2-9c53-a6a06e5e1981', '2026-03-13', 'visite', 'الفحص التقني — صالح', 23419, NULL),
	('e0a74d10-9926-4942-b5f4-7b28aae4ef8d', '2cce2757-2f51-4f6f-b064-7e09102e5ba3', '2020-01-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Yamaha Tracer 700 GT'),
	('e0f92418-33c0-4af4-bc46-ad856bf811d7', '2cce2757-2f51-4f6f-b064-7e09102e5ba3', '2022-09-13', 'entretien', 'تغيير البطارية', 6500, NULL),
	('a491eb6c-2a74-4f61-b397-5c8cde4e46a4', '2cce2757-2f51-4f6f-b064-7e09102e5ba3', '2023-10-23', 'entretien', 'صيانة دورية: زيت + فلاتر', 9500, NULL),
	('3d2b802f-6790-4418-80dd-b0f3167ae799', '2cce2757-2f51-4f6f-b064-7e09102e5ba3', '2025-01-24', 'entretien', 'صيانة كبرى في الوكالة', 16000, NULL),
	('401e7a86-8053-4a3d-931d-61db45d7f7a1', '2cce2757-2f51-4f6f-b064-7e09102e5ba3', '2026-04-19', 'visite', 'الفحص التقني — صالح', 16820, NULL),
	('e575b968-6fe4-42f7-b22c-e64b3a5177f2', '2f0ee47b-c80a-4dab-b8f6-fa4e214ada11', '2019-03-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Honda CB500X ABS'),
	('a92400c8-d912-4e39-9759-13fd7751e4b0', '2f0ee47b-c80a-4dab-b8f6-fa4e214ada11', '2021-07-24', 'entretien', 'تغيير البطارية', 8000, NULL),
	('435a0620-abf5-4335-aa61-d92adc4a87aa', '2f0ee47b-c80a-4dab-b8f6-fa4e214ada11', '2023-02-23', 'proprietaire', 'تغيير المالك رقم 2', 16000, NULL),
	('fe7cc452-dc96-40c6-bebb-ddb6fd809f1e', '2f0ee47b-c80a-4dab-b8f6-fa4e214ada11', '2023-09-13', 'entretien', 'صيانة دورية: زيت + فلاتر', 16000, NULL),
	('28f3ebd0-3842-4bbe-86ae-42f459fdf265', '2f0ee47b-c80a-4dab-b8f6-fa4e214ada11', '2024-10-27', 'entretien', 'تغيير الإطارات الأربعة', 20000, NULL),
	('cbdd6bb6-fa51-485c-8bdc-6ef0e79648b6', '2f0ee47b-c80a-4dab-b8f6-fa4e214ada11', '2026-03-19', 'visite', 'الفحص التقني — صالح', 26572, NULL),
	('04d832f6-7577-49a4-810b-a2ff9b526c69', '4df78941-de61-4c53-9966-b3b8db9c72fb', '2021-08-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Honda PCX 125 ABS'),
	('b1e53adb-f46f-4747-afc2-3ee40d7b0d48', '4df78941-de61-4c53-9966-b3b8db9c72fb', '2023-09-25', 'entretien', 'تغيير الإطارات الأربعة', 5500, NULL),
	('6e2be62f-041a-44e4-938f-14d1b5c502c3', '4df78941-de61-4c53-9966-b3b8db9c72fb', '2024-01-19', 'entretien', 'صيانة دورية: زيت + فلاتر', 8500, NULL),
	('8023ea26-cb7e-4e8f-a2fe-e67d0eca5067', '4df78941-de61-4c53-9966-b3b8db9c72fb', '2024-03-24', 'proprietaire', 'تغيير المالك رقم 2', 8500, NULL),
	('8eae9498-5139-4524-8f96-951c06b4fa41', '4df78941-de61-4c53-9966-b3b8db9c72fb', '2026-08-23', 'visite', 'الفحص التقني — صالح', 11072, NULL),
	('2f581ec5-6188-46c0-aa29-e17a9c412e34', 'e212e106-70a3-46d1-a518-b977fb3e7b4d', '2020-06-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'KTM Duke 390 ABS'),
	('25249dc9-4e0e-480f-b2f6-6f41fe122ba8', 'e212e106-70a3-46d1-a518-b977fb3e7b4d', '2022-01-16', 'proprietaire', 'تغيير المالك رقم 2', 5500, NULL),
	('aabfd7f6-a192-49bf-94aa-144943442850', 'e212e106-70a3-46d1-a518-b977fb3e7b4d', '2022-02-15', 'entretien', 'تغيير الإطارات الأربعة', 5500, NULL),
	('dff0fa27-8c74-45da-88a9-697f4ceb1c19', 'e212e106-70a3-46d1-a518-b977fb3e7b4d', '2023-10-23', 'entretien', 'تغيير سير التوزيع', 8500, NULL),
	('589820cd-ed4e-4e58-8b12-de173e190493', 'e212e106-70a3-46d1-a518-b977fb3e7b4d', '2024-09-15', 'proprietaire', 'تغيير المالك رقم 3', 11500, NULL),
	('96bec2b4-c124-4f75-884a-fbc973fe1094', 'e212e106-70a3-46d1-a518-b977fb3e7b4d', '2025-12-14', 'entretien', 'تغيير البطارية', 14000, NULL),
	('8e5488eb-d8bf-473a-81bc-c8e9cb8eb554', 'e212e106-70a3-46d1-a518-b977fb3e7b4d', '2026-08-20', 'visite', 'الفحص التقني — صالح', 14047, NULL),
	('f80dbf4f-bb3c-4c2b-a572-49c77eb5562a', '03c3a97a-74d0-4095-b1ce-24a40db6589a', '2018-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Royal Enfield Classic 500 EFI'),
	('623dafb6-aba3-4af9-9f63-9796ab821b17', '03c3a97a-74d0-4095-b1ce-24a40db6589a', '2020-08-13', 'entretien', 'تغيير سير التوزيع', 5500, NULL);
INSERT INTO public.listing_history VALUES
	('5e3ca5a6-cf4c-412f-9f5e-c0f24e0d70cb', '03c3a97a-74d0-4095-b1ce-24a40db6589a', '2021-01-13', 'entretien', 'تغيير البطارية', 8000, NULL),
	('9a6c8d58-4650-4f52-ab9f-48008ef9c58e', '03c3a97a-74d0-4095-b1ce-24a40db6589a', '2021-02-20', 'proprietaire', 'تغيير المالك رقم 2', 8000, NULL),
	('59331e0e-7638-4171-aa31-5c664f4c6e32', '03c3a97a-74d0-4095-b1ce-24a40db6589a', '2023-03-20', 'proprietaire', 'تغيير المالك رقم 3', 13000, NULL),
	('66f29cdb-e52c-4e78-a427-16339b5924e7', '03c3a97a-74d0-4095-b1ce-24a40db6589a', '2023-04-21', 'entretien', 'صيانة دورية: زيت + فلاتر', 13000, NULL),
	('220202b9-87c9-4f9c-9071-e7e8ecd4d965', '03c3a97a-74d0-4095-b1ce-24a40db6589a', '2024-08-16', 'entretien', 'تغيير الفرامل الأمامية', 16000, NULL),
	('3369f186-2c07-41a3-b42e-01e7b5309975', '03c3a97a-74d0-4095-b1ce-24a40db6589a', '2026-05-10', 'visite', 'الفحص التقني — صالح', 18759, NULL),
	('e7ca6138-43b5-4904-9e8d-47413527c6d2', 'cc2bf24c-72af-4f2f-98b3-96ab1ee9d496', '2019-10-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Kawasaki Z650 ABS'),
	('7950100a-f295-4ca2-b6db-ee2b49216f03', 'cc2bf24c-72af-4f2f-98b3-96ab1ee9d496', '2021-05-14', 'proprietaire', 'تغيير المالك رقم 2', 6500, NULL),
	('8611b433-1a38-4dcb-b8a8-c9bc3a5813bb', 'cc2bf24c-72af-4f2f-98b3-96ab1ee9d496', '2021-07-21', 'entretien', 'تغيير سير التوزيع', 6500, NULL),
	('4b766f6e-30f5-461b-89a4-52c643ec46ab', 'cc2bf24c-72af-4f2f-98b3-96ab1ee9d496', '2023-03-22', 'entretien', 'صيانة كبرى في الوكالة', 12500, NULL),
	('2c1861f0-d5c0-40ce-9149-d55e8f29c752', 'cc2bf24c-72af-4f2f-98b3-96ab1ee9d496', '2024-03-22', 'entretien', 'تغيير الفرامل الأمامية', 15500, NULL),
	('e830768d-cb7e-4ff1-9670-e49e2accf87a', 'cc2bf24c-72af-4f2f-98b3-96ab1ee9d496', '2024-09-19', 'proprietaire', 'تغيير المالك رقم 3', 15500, NULL),
	('9f3def55-1848-45c8-b430-a373ba99a2dd', 'cc2bf24c-72af-4f2f-98b3-96ab1ee9d496', '2026-05-16', 'visite', 'الفحص التقني — صالح', 20885, NULL),
	('597d7943-8499-45bd-b866-a9cd3c4b9604', '75afa67f-14c6-4960-bf9c-75ef86c78ccc', '2015-09-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'BMW R 1200 GS Adventure'),
	('0fdb0b55-af40-4693-afdf-19e11ee73f9d', '75afa67f-14c6-4960-bf9c-75ef86c78ccc', '2017-10-17', 'entretien', 'تغيير سير التوزيع', 11500, NULL),
	('28245dc1-a4b6-43ca-916e-b4226203dd65', '75afa67f-14c6-4960-bf9c-75ef86c78ccc', '2019-03-25', 'proprietaire', 'تغيير المالك رقم 2', 22500, NULL),
	('c06af34f-712b-4bfe-ada9-a048b9b9532b', '75afa67f-14c6-4960-bf9c-75ef86c78ccc', '2019-05-25', 'entretien', 'تغيير البطارية', 22500, NULL),
	('45df4ae3-e85d-40f2-a710-2c6f4ca0dc3e', '75afa67f-14c6-4960-bf9c-75ef86c78ccc', '2022-02-10', 'proprietaire', 'تغيير المالك رقم 3', 39500, NULL),
	('49971330-fc20-4bf9-a8ba-a7fd6cfc3f5c', '75afa67f-14c6-4960-bf9c-75ef86c78ccc', '2022-03-18', 'entretien', 'صيانة دورية: زيت + فلاتر', 39500, NULL),
	('cb5515fe-8be4-4f75-9e68-ca1c231e8eb3', '75afa67f-14c6-4960-bf9c-75ef86c78ccc', '2024-09-10', 'entretien', 'تغيير الفرامل الأمامية', 50500, NULL),
	('d566d5e4-d8a7-4d2c-9c02-d2f20271143c', '75afa67f-14c6-4960-bf9c-75ef86c78ccc', '2026-05-17', 'visite', 'الفحص التقني — صالح', 61274, NULL),
	('b1ad8241-609d-4590-a98c-34a91bc1d470', '17379b0a-185a-4fd5-b56c-e021381b6ebb', '2016-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Suzuki GSX-R 600 L6'),
	('d852e9e3-8ea6-429c-93b1-16bfb43fcc96', '17379b0a-185a-4fd5-b56c-e021381b6ebb', '2018-03-26', 'entretien', 'صيانة دورية: زيت + فلاتر', 7000, NULL),
	('461fa30a-2388-4396-9b32-057751925358', '17379b0a-185a-4fd5-b56c-e021381b6ebb', '2019-02-15', 'proprietaire', 'تغيير المالك رقم 2', 10000, NULL),
	('f229875a-ab87-4903-8996-672446d5b501', '17379b0a-185a-4fd5-b56c-e021381b6ebb', '2020-06-24', 'entretien', 'صيانة كبرى في الوكالة', 13500, NULL),
	('82db8aa3-7a28-48df-a5f4-066adf991510', '17379b0a-185a-4fd5-b56c-e021381b6ebb', '2022-04-15', 'entretien', 'تغيير الفرامل الأمامية', 20500, NULL),
	('ed05dbb3-4c20-4714-9418-d67023ad1f16', '17379b0a-185a-4fd5-b56c-e021381b6ebb', '2023-02-12', 'proprietaire', 'تغيير المالك رقم 3', 24000, NULL),
	('648dc16d-a03d-4c6d-8405-895f50adec9c', '17379b0a-185a-4fd5-b56c-e021381b6ebb', '2024-05-13', 'entretien', 'صيانة كبرى في الوكالة', 27000, NULL),
	('d7d20bad-e331-4a83-a683-603e23c44186', '17379b0a-185a-4fd5-b56c-e021381b6ebb', '2026-01-12', 'visite', 'الفحص التقني — صالح', 32328, NULL),
	('39cda248-0ab0-4734-9936-115788ba986d', 'e27c5eac-9c72-4b3b-a3a3-4f16baf80e78', '2020-08-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Vespa Primavera 125 iGet'),
	('7e01bcef-a0ef-4113-bc26-563a3e53932f', 'e27c5eac-9c72-4b3b-a3a3-4f16baf80e78', '2022-11-24', 'entretien', 'صيانة دورية: زيت + فلاتر', 3500, NULL),
	('79a22208-faeb-4dcc-864c-6a4520317397', 'e27c5eac-9c72-4b3b-a3a3-4f16baf80e78', '2023-03-17', 'proprietaire', 'تغيير المالك رقم 2', 5500, NULL),
	('19074522-87af-4211-a651-1c9eb99b77e4', 'e27c5eac-9c72-4b3b-a3a3-4f16baf80e78', '2023-09-24', 'entretien', 'صيانة كبرى في الوكالة', 5500, NULL),
	('667e6480-1039-4f14-82c8-b24c03de5570', 'e27c5eac-9c72-4b3b-a3a3-4f16baf80e78', '2025-01-14', 'accident', 'حادث مصرّح به', NULL, 'خدوش جانبية — صباغة جزئية للباب الأيمن'),
	('df5deeed-ceb2-442b-bedc-2fea024e6fd8', 'e27c5eac-9c72-4b3b-a3a3-4f16baf80e78', '2025-07-17', 'entretien', 'تغيير الفرامل الأمامية', 9000, NULL),
	('5298a974-6152-460c-97ba-3eef65823688', 'e27c5eac-9c72-4b3b-a3a3-4f16baf80e78', '2026-04-20', 'visite', 'الفحص التقني — صالح', 8547, NULL),
	('49f71878-1625-45a5-a1a2-791cd7c3f922', '8559490e-ad12-4692-aea2-993f913b3406', '2021-08-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'SYM Symphony 125 ST'),
	('5d09086f-e756-4f7d-8f37-730ce4852987', '8559490e-ad12-4692-aea2-993f913b3406', '2022-02-14', 'accident', 'حادث مصرّح به', NULL, 'خدوش جانبية — صباغة جزئية للباب الأيمن'),
	('32b8628e-b4b4-4976-b236-d1e8c92b83d4', '8559490e-ad12-4692-aea2-993f913b3406', '2023-01-15', 'entretien', 'تغيير الإطارات الأربعة', 6500, NULL),
	('ac33b5e0-0650-41ae-a998-8e91847df111', '8559490e-ad12-4692-aea2-993f913b3406', '2023-08-18', 'proprietaire', 'تغيير المالك رقم 2', 6500, NULL),
	('d8c017fb-ed4b-4946-8d3d-309be7ec4ad9', '8559490e-ad12-4692-aea2-993f913b3406', '2024-02-22', 'entretien', 'تغيير سير التوزيع', 9500, NULL),
	('72b72f9c-8620-46d5-a3ef-ced63651f1ec', '8559490e-ad12-4692-aea2-993f913b3406', '2024-05-20', 'proprietaire', 'تغيير المالك رقم 3', 9500, NULL),
	('8a2dc997-c048-46df-baa2-d58caa66a60a', '8559490e-ad12-4692-aea2-993f913b3406', '2026-04-23', 'visite', 'الفحص التقني — صالح', 13571, NULL),
	('ac46eb2d-3501-4436-9c1b-7856f89bbdd0', 'df6bf2e1-69b8-4e97-a7f1-7840d50bcaa8', '2020-08-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Peugeot Kisbee 50 4T'),
	('f0cc24ca-5a64-4840-a877-e6939ce82757', 'df6bf2e1-69b8-4e97-a7f1-7840d50bcaa8', '2022-09-12', 'entretien', 'تغيير البطارية', 4000, NULL),
	('3dbf5195-bbfa-43e8-89ab-e9dfccfc8b47', 'df6bf2e1-69b8-4e97-a7f1-7840d50bcaa8', '2023-02-13', 'proprietaire', 'تغيير المالك رقم 2', 6000, NULL),
	('62a2b836-bcd3-47d5-b241-d73079da6229', 'df6bf2e1-69b8-4e97-a7f1-7840d50bcaa8', '2023-07-14', 'entretien', 'صيانة دورية: زيت + فلاتر', 6000, NULL),
	('85ddef12-ef2d-45de-a7cd-b3de3f2f9415', 'df6bf2e1-69b8-4e97-a7f1-7840d50bcaa8', '2025-04-10', 'entretien', 'صيانة دورية: زيت + فلاتر', 10000, NULL),
	('923de73e-cb32-4845-98aa-a69e65c2f196', 'df6bf2e1-69b8-4e97-a7f1-7840d50bcaa8', '2026-02-11', 'visite', 'الفحص التقني — صالح', 11046, NULL),
	('02f772ee-6085-4245-8fc1-c82c2c295a71', '5250e406-08c3-47e7-b18b-0bf9133b80bf', '2018-06-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'MBK Booster Naked');
INSERT INTO public.listing_history VALUES
	('1132dd7f-cec3-4711-bb8a-8460fc3abd7f', '5250e406-08c3-47e7-b18b-0bf9133b80bf', '2020-08-14', 'entretien', 'تغيير البطارية', 5000, NULL),
	('59b174aa-829a-4698-b0da-17de7e86fa06', '5250e406-08c3-47e7-b18b-0bf9133b80bf', '2021-04-17', 'entretien', 'تغيير الإطارات الأربعة', 7000, NULL),
	('7c929f74-b8dd-4435-b48a-02c677f0dd74', '5250e406-08c3-47e7-b18b-0bf9133b80bf', '2022-07-16', 'proprietaire', 'تغيير المالك رقم 2', 9500, NULL),
	('c25abe50-0ba0-4a7e-a21c-d99d85e43522', '5250e406-08c3-47e7-b18b-0bf9133b80bf', '2023-04-12', 'entretien', 'صيانة كبرى في الوكالة', 12000, NULL),
	('3dc12ff5-35c5-452d-bead-c5f5923dcaf0', '5250e406-08c3-47e7-b18b-0bf9133b80bf', '2024-07-16', 'entretien', 'تغيير البطارية', 14500, NULL),
	('fcd7cd6a-b10c-4e4e-99f1-49a628b91eb1', '5250e406-08c3-47e7-b18b-0bf9133b80bf', '2026-04-11', 'visite', 'الفحص التقني — صالح', 16527, NULL),
	('fc11c553-5700-4ec8-bc16-06a2651aef5e', 'd04cf05b-1942-45cd-9e9d-ca0009378b35', '2021-01-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Docker Star 125'),
	('6bc1fe6d-7a11-46d5-be0a-6b6e810d3481', 'd04cf05b-1942-45cd-9e9d-ca0009378b35', '2023-05-10', 'entretien', 'تغيير البطارية', 9000, NULL),
	('99e57129-fa2e-4aef-85a5-3b6236b5cdb8', 'd04cf05b-1942-45cd-9e9d-ca0009378b35', '2023-09-15', 'proprietaire', 'تغيير المالك رقم 2', 9000, NULL),
	('9883459b-7f03-4476-b36b-23063648caba', 'd04cf05b-1942-45cd-9e9d-ca0009378b35', '2024-05-24', 'proprietaire', 'تغيير المالك رقم 3', 14000, NULL),
	('3903d414-b20f-4553-a33f-0892b8c1a3b0', 'd04cf05b-1942-45cd-9e9d-ca0009378b35', '2024-06-27', 'entretien', 'صيانة دورية: زيت + فلاتر', 14000, NULL),
	('3522ff6b-2caf-48eb-b3a8-6c5427b26770', 'd04cf05b-1942-45cd-9e9d-ca0009378b35', '2026-03-10', 'visite', 'الفحص التقني — صالح', 21324, NULL),
	('10290365-6c32-4c88-8b2d-8b634ab43d2c', '970b880f-bd1f-4498-a795-ea5601b3b298', '2020-05-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Bajaj Boxer 150 BM'),
	('e7827bb8-d4e5-4164-9dde-1edc098bec50', '970b880f-bd1f-4498-a795-ea5601b3b298', '2022-03-11', 'entretien', 'تغيير الإطارات الأربعة', 10500, NULL),
	('61752d50-f196-446e-bd79-7415d48b7888', '970b880f-bd1f-4498-a795-ea5601b3b298', '2023-03-11', 'proprietaire', 'تغيير المالك رقم 2', 15500, NULL),
	('84c5845d-7727-43b0-bfd9-0dc8021aa262', '970b880f-bd1f-4498-a795-ea5601b3b298', '2023-10-13', 'entretien', 'تغيير الفرامل الأمامية', 15500, NULL),
	('109aea1f-8c62-46cd-852a-04f65ebda12d', '970b880f-bd1f-4498-a795-ea5601b3b298', '2025-07-25', 'entretien', 'تغيير الإطارات الأربعة', 26000, NULL),
	('32e74214-638d-44da-8001-56317fdc8167', '970b880f-bd1f-4498-a795-ea5601b3b298', '2026-03-11', 'visite', 'الفحص التقني — صالح', 28595, NULL),
	('04bd6ad4-43ab-4ce2-b966-d26b5c54c336', 'f747262e-ff1f-408a-8926-f9f3e8d62684', '2021-02-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Haojue DK 150 HJ150'),
	('8912c21f-f3a8-44e8-b6f1-542700f5309f', 'f747262e-ff1f-408a-8926-f9f3e8d62684', '2023-02-21', 'proprietaire', 'تغيير المالك رقم 2', 7000, NULL),
	('98e54bc2-e882-4281-99f0-88794a6bb180', 'f747262e-ff1f-408a-8926-f9f3e8d62684', '2023-04-26', 'entretien', 'تغيير سير التوزيع', 7000, NULL),
	('4495a55c-ec40-4ff7-84a6-b25557b83bd3', 'f747262e-ff1f-408a-8926-f9f3e8d62684', '2024-01-12', 'proprietaire', 'تغيير المالك رقم 3', 11000, NULL),
	('303a393e-c1e4-40b7-ab33-d1ad1d8e518c', 'f747262e-ff1f-408a-8926-f9f3e8d62684', '2024-03-23', 'entretien', 'تغيير الفرامل الأمامية', 11000, NULL),
	('f942b85b-b306-431e-a50d-dfee9eb7a0c2', 'f747262e-ff1f-408a-8926-f9f3e8d62684', '2026-01-16', 'visite', 'الفحص التقني — صالح', 17689, NULL),
	('5534014b-202c-41ca-9b9e-b6f6bca30437', '4a00dbf3-a6d2-497d-a6a1-8e3898342c8c', '2022-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Yamaha Aerox 155 VVA'),
	('1b912330-e5e4-4e1f-9dd6-d4e7e676d8f9', '4a00dbf3-a6d2-497d-a6a1-8e3898342c8c', '2023-10-11', 'entretien', 'تغيير سير التوزيع', 2500, NULL),
	('38de9e98-d0f6-41f2-8c3a-957aa41f7e90', '4a00dbf3-a6d2-497d-a6a1-8e3898342c8c', '2024-04-27', 'proprietaire', 'تغيير المالك رقم 2', 4500, NULL),
	('18c439dd-39c4-454a-8f67-b434d9b4e2ae', '4a00dbf3-a6d2-497d-a6a1-8e3898342c8c', '2025-01-13', 'entretien', 'صيانة دورية: زيت + فلاتر', 7000, NULL),
	('6b79d65b-e686-4063-81dc-87ac63cf839b', '4a00dbf3-a6d2-497d-a6a1-8e3898342c8c', '2026-06-19', 'visite', 'الفحص التقني — صالح', 6683, NULL),
	('0b4170d3-949f-4295-b65b-d56faad331d2', 'fc3c9c14-3cf4-4417-8a37-2dbfb03929f3', '2018-06-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Honda Africa Twin CRF1000L DCT'),
	('1ef56514-ca40-4ed0-95b0-c9f494489b0d', 'fc3c9c14-3cf4-4417-8a37-2dbfb03929f3', '2020-08-25', 'entretien', 'صيانة كبرى في الوكالة', 11500, NULL),
	('ff54f85c-d093-45d9-8a67-4f663c510602', 'fc3c9c14-3cf4-4417-8a37-2dbfb03929f3', '2021-02-27', 'entretien', 'تغيير الإطارات الأربعة', 17500, NULL),
	('e7a01594-fb68-4924-bd9c-bcd231e21993', 'fc3c9c14-3cf4-4417-8a37-2dbfb03929f3', '2023-03-22', 'entretien', 'تغيير البطارية', 29000, NULL),
	('7d6a74d5-9f3c-407a-8f39-572e829ccb66', 'fc3c9c14-3cf4-4417-8a37-2dbfb03929f3', '2023-05-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خلفية خفيفة — تغيير الصدام'),
	('9c31558f-65f8-4ddf-af92-76ff7c7b7728', 'fc3c9c14-3cf4-4417-8a37-2dbfb03929f3', '2024-10-21', 'entretien', 'تغيير البطارية', 34500, NULL),
	('48878a39-7b0b-4e06-8fe9-3765b7541850', 'fc3c9c14-3cf4-4417-8a37-2dbfb03929f3', '2026-04-20', 'visite', 'الفحص التقني — صالح', 43285, NULL),
	('64233ab9-e0ef-4f01-ab76-7b4da96c590b', 'f2d7ae0e-5341-4532-bbfd-1ff573f27b14', '2017-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Harley-Davidson Iron 883 Sportster'),
	('839140f0-4e6a-49ec-abca-36cdeae488ab', 'f2d7ae0e-5341-4532-bbfd-1ff573f27b14', '2019-05-14', 'entretien', 'تغيير الإطارات الأربعة', 6000, NULL),
	('f36efa62-e250-4bf3-bdbb-d9934fb27446', 'f2d7ae0e-5341-4532-bbfd-1ff573f27b14', '2021-10-13', 'entretien', 'صيانة كبرى في الوكالة', 12000, NULL),
	('113524b0-7905-412a-84bd-40a51d2fae28', 'f2d7ae0e-5341-4532-bbfd-1ff573f27b14', '2022-03-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خلفية خفيفة — تغيير الصدام'),
	('7639fd47-c29f-4884-b495-92c196d0261b', 'f2d7ae0e-5341-4532-bbfd-1ff573f27b14', '2022-10-25', 'entretien', 'صيانة دورية: زيت + فلاتر', 15000, NULL),
	('4c92be18-acd5-4803-819d-b1e5424daa45', 'f2d7ae0e-5341-4532-bbfd-1ff573f27b14', '2024-05-10', 'entretien', 'صيانة كبرى في الوكالة', 21000, NULL),
	('62031b27-a498-464c-9829-24a8ef3c3278', 'f2d7ae0e-5341-4532-bbfd-1ff573f27b14', '2026-01-11', 'visite', 'الفحص التقني — صالح', 25058, NULL),
	('cfc84a13-d353-4f46-a37d-8e7b07682622', 'a24873b6-2b78-4192-aa5f-268748a1485b', '2021-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Benelli TRK 502 X'),
	('72e984c9-ba5f-454b-9dbf-81953c497aa9', 'a24873b6-2b78-4192-aa5f-268748a1485b', '2023-07-24', 'entretien', 'صيانة دورية: زيت + فلاتر', 6000, NULL),
	('141d4e42-3211-4363-bdaf-d4a5b17a5479', 'a24873b6-2b78-4192-aa5f-268748a1485b', '2024-02-10', 'entretien', 'تغيير سير التوزيع', 9000, NULL),
	('8d993aab-fe33-438b-a9db-355e74f250de', 'a24873b6-2b78-4192-aa5f-268748a1485b', '2024-05-22', 'proprietaire', 'تغيير المالك رقم 2', 9000, NULL),
	('8e81b336-68ef-4398-8e9c-13858dfdef44', 'a24873b6-2b78-4192-aa5f-268748a1485b', '2026-02-16', 'visite', 'الفحص التقني — صالح', 13790, NULL),
	('c3b15a15-effc-4b84-8bfc-eea20770c69f', 'cf10b172-6434-413d-a023-7274cbde364f', '2021-11-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Yamaha NMAX 155 ABS'),
	('67ebff65-39d9-4c47-b67a-1b9e6e09f032', 'cf10b172-6434-413d-a023-7274cbde364f', '2023-04-19', 'entretien', 'تغيير الفرامل الأمامية', 5000, NULL);
INSERT INTO public.listing_history VALUES
	('bea53557-1402-4139-84b5-0d44fe300ac4', 'cf10b172-6434-413d-a023-7274cbde364f', '2023-06-18', 'proprietaire', 'تغيير المالك رقم 2', 5000, NULL),
	('a7947ee0-a7d4-40db-ac9f-ce501bf665a4', 'cf10b172-6434-413d-a023-7274cbde364f', '2023-08-14', 'accident', 'حادث مصرّح به', NULL, 'خدوش جانبية — صباغة جزئية للباب الأيمن'),
	('0dd1d4cf-1d85-43c0-b758-6fb659dfb430', 'cf10b172-6434-413d-a023-7274cbde364f', '2024-03-27', 'proprietaire', 'تغيير المالك رقم 3', 8000, NULL),
	('61346373-2b3f-44eb-8992-81afd344853f', 'cf10b172-6434-413d-a023-7274cbde364f', '2024-04-21', 'entretien', 'صيانة كبرى في الوكالة', 8000, NULL),
	('f24fe929-fbf0-4f1a-9672-1d95bf9275ab', 'cf10b172-6434-413d-a023-7274cbde364f', '2026-05-23', 'visite', 'الفحص التقني — صالح', 11745, NULL),
	('4beb6fa7-ec59-43a3-8a14-06f85a4f4355', '0bb37c12-4cc8-41c5-a328-db3e11bca49a', '2020-02-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'KTM 790 Adventure R'),
	('72716b76-d8c6-4ac2-9e9b-d06ebc7e3196', '0bb37c12-4cc8-41c5-a328-db3e11bca49a', '2023-06-21', 'entretien', 'تغيير الإطارات الأربعة', 12500, NULL),
	('02aaa50e-4dde-48ec-9ca0-737c79e9cf04', '0bb37c12-4cc8-41c5-a328-db3e11bca49a', '2025-08-27', 'entretien', 'تغيير سير التوزيع', 21000, NULL),
	('ca12d4ee-7876-4b89-b35a-5421a51e33c0', '0bb37c12-4cc8-41c5-a328-db3e11bca49a', '2026-07-21', 'visite', 'الفحص التقني — صالح', 22821, NULL),
	('4dc3fd20-ac39-4ea7-874a-10041d97d3dc', '29f395c6-a69a-4e25-8e07-3dca3c681d8e', '2018-02-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Ford Ranger 2.2 TDCi 4x4 XLT'),
	('a36b0a69-b586-43df-838e-7a5d3af442e0', '29f395c6-a69a-4e25-8e07-3dca3c681d8e', '2020-03-10', 'entretien', 'صيانة دورية: زيت + فلاتر', 37000, NULL),
	('3575a428-0556-470c-8eb3-018b2da5a4f5', '29f395c6-a69a-4e25-8e07-3dca3c681d8e', '2021-09-22', 'entretien', 'صيانة كبرى في الوكالة', 55500, NULL),
	('bc593684-0f37-4a15-a143-07be2c4ddfa3', '29f395c6-a69a-4e25-8e07-3dca3c681d8e', '2023-06-14', 'accident', 'حادث مصرّح به', NULL, 'خدوش جانبية — صباغة جزئية للباب الأيمن'),
	('9005b13f-ac4d-4261-bcda-49c2000b6832', '29f395c6-a69a-4e25-8e07-3dca3c681d8e', '2023-08-24', 'entretien', 'صيانة دورية: زيت + فلاتر', 92500, NULL),
	('fdfb1641-eca2-4773-b4e4-6e1d50eb26e1', '29f395c6-a69a-4e25-8e07-3dca3c681d8e', '2024-08-20', 'entretien', 'صيانة دورية: زيت + فلاتر', 111000, NULL),
	('cf792923-5b0e-4c93-a251-7b0b4d89aced', '29f395c6-a69a-4e25-8e07-3dca3c681d8e', '2026-06-15', 'visite', 'الفحص التقني — صالح', 146750, NULL),
	('63525099-d541-40c9-b40b-600fad76109d', 'e1d47f16-f460-47cd-95de-3735374e6f98', '2019-11-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Isuzu D-Max 1.9 Ddi 4x4 LSX'),
	('71448010-d9d0-44dd-9fb5-7e6a51cea50d', 'e1d47f16-f460-47cd-95de-3735374e6f98', '2021-05-21', 'entretien', 'تغيير البطارية', 35000, NULL),
	('ddff747d-7434-449f-80e3-1334d282ca4f', 'e1d47f16-f460-47cd-95de-3735374e6f98', '2023-05-22', 'proprietaire', 'تغيير المالك رقم 2', 69500, NULL),
	('5c248392-d221-4896-a0ed-3ece4a3a37d5', 'e1d47f16-f460-47cd-95de-3735374e6f98', '2023-06-22', 'entretien', 'تغيير الفرامل الأمامية', 69500, NULL),
	('79275f5f-4fa3-46c0-abcd-70df1a595f06', 'e1d47f16-f460-47cd-95de-3735374e6f98', '2024-12-19', 'entretien', 'تغيير سير التوزيع', 87000, NULL),
	('0919bd34-bbca-42d6-aefd-1cfb25ecc95d', 'e1d47f16-f460-47cd-95de-3735374e6f98', '2026-08-15', 'visite', 'الفحص التقني — صالح', 120633, NULL),
	('691bcd73-77d6-4a2d-bcb9-93b4908a8fd0', 'f1177871-3abd-44e7-af60-b41ca3816bce', '2016-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Toyota Hilux 2.4 D-4D 4x2 Simple Cab'),
	('70f5b95c-b508-48a6-b864-8883650ea77c', 'f1177871-3abd-44e7-af60-b41ca3816bce', '2018-04-17', 'entretien', 'تغيير الإطارات الأربعة', 39500, NULL),
	('b426443a-84ad-4593-b292-1aa2014bbf10', 'f1177871-3abd-44e7-af60-b41ca3816bce', '2018-09-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خلفية خفيفة — تغيير الصدام'),
	('555e3b20-f58b-49db-b0f6-2a780e7662cb', 'f1177871-3abd-44e7-af60-b41ca3816bce', '2019-05-25', 'proprietaire', 'تغيير المالك رقم 2', 59500, NULL),
	('527f88d3-47eb-4157-b5a8-710c12a5f66e', 'f1177871-3abd-44e7-af60-b41ca3816bce', '2020-11-21', 'entretien', 'تغيير الإطارات الأربعة', 79000, NULL),
	('1c3c097c-990b-45ec-9fe8-6381bfe684b5', 'f1177871-3abd-44e7-af60-b41ca3816bce', '2022-10-11', 'entretien', 'صيانة كبرى في الوكالة', 119000, NULL),
	('f7f573fe-bbfb-4b4b-a30d-7e7420d51f71', 'f1177871-3abd-44e7-af60-b41ca3816bce', '2023-06-14', 'proprietaire', 'تغيير المالك رقم 3', 138500, NULL),
	('e2d0e96c-1cfd-495a-9e50-30e2cd323a73', 'f1177871-3abd-44e7-af60-b41ca3816bce', '2024-03-12', 'entretien', 'تغيير الإطارات الأربعة', 158500, NULL),
	('fc0df1fe-92ce-49fa-8d13-54a7a560974d', 'f1177871-3abd-44e7-af60-b41ca3816bce', '2026-02-11', 'visite', 'الفحص التقني — صالح', 196947, NULL),
	('f4a6f09c-c1a4-4332-aa10-33544bae4245', '2cf28799-27d2-4b28-a108-2707b57833c0', '2020-11-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Renault Zoe R110 Intens'),
	('4f5085a3-ac3f-4e0e-b08c-eee22c52e95f', '2cf28799-27d2-4b28-a108-2707b57833c0', '2021-09-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خلفية خفيفة — تغيير الصدام'),
	('dd02d47e-0fa6-4601-9e15-4aa87a080bfc', '2cf28799-27d2-4b28-a108-2707b57833c0', '2022-08-22', 'entretien', 'صيانة كبرى في الوكالة', 20500, NULL),
	('e0bcca5c-cf3c-462e-851f-0a0dec036c9c', '2cf28799-27d2-4b28-a108-2707b57833c0', '2023-06-11', 'proprietaire', 'تغيير المالك رقم 2', 30500, NULL),
	('aeee5059-3542-4f79-95b7-9b724d25f165', '2cf28799-27d2-4b28-a108-2707b57833c0', '2023-07-16', 'entretien', 'تغيير الفرامل الأمامية', 30500, NULL),
	('bf3be434-a701-4452-b6d2-9aba1939678f', '2cf28799-27d2-4b28-a108-2707b57833c0', '2025-10-20', 'entretien', 'تغيير سير التوزيع', 51000, NULL),
	('192690d1-72ee-4fb4-826b-9debe7f7c65d', '2cf28799-27d2-4b28-a108-2707b57833c0', '2026-05-12', 'visite', 'الفحص التقني — صالح', 59286, NULL),
	('7ee0e151-b506-4d8e-93aa-fe3a48ab3830', '54e457f8-465f-475e-8e4b-ce1fdb1048e3', '2022-06-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Dacia Spring Electric 45 Comfort'),
	('5f07d8b2-c6a1-48f2-afc1-1bda925e3f69', '54e457f8-465f-475e-8e4b-ce1fdb1048e3', '2023-06-23', 'entretien', 'تغيير الإطارات الأربعة', 9500, NULL),
	('0459389d-e9f1-459c-9b4c-4fda49d8ceeb', '54e457f8-465f-475e-8e4b-ce1fdb1048e3', '2024-01-24', 'proprietaire', 'تغيير المالك رقم 2', 19000, NULL),
	('189f8d5a-d28f-44e7-9216-abc6546d118e', '54e457f8-465f-475e-8e4b-ce1fdb1048e3', '2025-03-10', 'entretien', 'تغيير البطارية', 28500, NULL),
	('f55222b5-334c-4d58-a141-d611d76b7c02', '54e457f8-465f-475e-8e4b-ce1fdb1048e3', '2026-04-11', 'visite', 'الفحص التقني — صالح', 37483, NULL),
	('d4241624-ce62-42dc-a723-10f4263d6993', 'f819033d-ad58-49e1-99b5-8a44d8aa0018', '2021-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Hyundai Kona Electric 64 kWh Executive'),
	('b13abeee-4c06-4a24-9a0d-d9b99ddbfa6d', 'f819033d-ad58-49e1-99b5-8a44d8aa0018', '2022-11-14', 'accident', 'حادث مصرّح به', NULL, 'خدوش جانبية — صباغة جزئية للباب الأيمن'),
	('0ec5c964-fbcb-4f0b-aa92-ed55b4279bf3', 'f819033d-ad58-49e1-99b5-8a44d8aa0018', '2023-10-17', 'entretien', 'صيانة دورية: زيت + فلاتر', 21500, NULL),
	('63683ee4-c37f-4760-b6cf-7317ead3f4eb', 'f819033d-ad58-49e1-99b5-8a44d8aa0018', '2024-02-16', 'proprietaire', 'تغيير المالك رقم 2', 32500, NULL),
	('f441de14-a284-4024-b542-30d664fcd85e', 'f819033d-ad58-49e1-99b5-8a44d8aa0018', '2024-09-26', 'entretien', 'صيانة كبرى في الوكالة', 32500, NULL),
	('6aed6002-cd23-4866-a300-555ad9c8b42c', 'f819033d-ad58-49e1-99b5-8a44d8aa0018', '2026-06-24', 'visite', 'الفحص التقني — صالح', 52927, NULL),
	('38b6d4a3-7c16-403a-9240-94da337ba7b2', '171935ab-0c91-4432-bd15-5c000e835ba1', '2022-02-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Tesla Model 3 Long Range AWD');
INSERT INTO public.listing_history VALUES
	('8e9efad8-2b03-4dec-bc1e-5a2c53c8660a', '171935ab-0c91-4432-bd15-5c000e835ba1', '2023-10-24', 'entretien', 'تغيير الإطارات الأربعة', 10500, NULL),
	('7ffd3689-b973-467a-a103-07489313758a', '171935ab-0c91-4432-bd15-5c000e835ba1', '2024-09-21', 'proprietaire', 'تغيير المالك رقم 2', 20500, NULL),
	('516cbd90-26ed-4e09-887d-f61eca98215e', '171935ab-0c91-4432-bd15-5c000e835ba1', '2025-03-11', 'entretien', 'تغيير الفرامل الأمامية', 31000, NULL),
	('5634240e-d054-49be-bac1-fd6aafc99564', '171935ab-0c91-4432-bd15-5c000e835ba1', '2026-04-20', 'visite', 'الفحص التقني — صالح', 39836, NULL),
	('6a0a7148-5913-40aa-bd19-aec961630e23', '5cc4b812-e14e-4a1e-8093-33ef3134c10a', '2020-06-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Peugeot Partner 1.5 BlueHDi Fourgon'),
	('15d3f30d-d7c2-4915-9761-6316197d302d', '5cc4b812-e14e-4a1e-8093-33ef3134c10a', '2021-09-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خفيفة في الصدام الأمامي — تم الإصلاح'),
	('e9f54eae-e592-4e61-99c9-68e12db2d34c', '5cc4b812-e14e-4a1e-8093-33ef3134c10a', '2022-04-19', 'proprietaire', 'تغيير المالك رقم 2', 32000, NULL),
	('6c786055-5e94-48f9-8d23-9a35c26e0336', '5cc4b812-e14e-4a1e-8093-33ef3134c10a', '2022-09-11', 'entretien', 'تغيير سير التوزيع', 32000, NULL),
	('9f831bce-6ff9-4f64-9bff-650aadeaf412', '5cc4b812-e14e-4a1e-8093-33ef3134c10a', '2023-10-25', 'entretien', 'صيانة دورية: زيت + فلاتر', 48000, NULL),
	('12ab6f91-037d-4401-b893-2cf1caa3615c', '5cc4b812-e14e-4a1e-8093-33ef3134c10a', '2024-05-24', 'proprietaire', 'تغيير المالك رقم 3', 64000, NULL),
	('428d374d-b357-4259-80d0-3f9baa66868d', '5cc4b812-e14e-4a1e-8093-33ef3134c10a', '2025-06-16', 'entretien', 'صيانة كبرى في الوكالة', 80000, NULL),
	('7f479e3e-2e72-48f9-9929-24ff0c38c45b', '5cc4b812-e14e-4a1e-8093-33ef3134c10a', '2026-07-22', 'visite', 'الفحص التقني — صالح', 93156, NULL),
	('a32ee480-ca02-48d7-ab33-7db74298e253', 'a85dda26-4e34-4ffc-b06d-b1d6263cdfe7', '2018-04-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Volkswagen Caddy 2.0 TDI Fourgon'),
	('fe6b239d-6229-4e97-bbe4-c63637052c01', 'a85dda26-4e34-4ffc-b06d-b1d6263cdfe7', '2020-02-11', 'entretien', 'صيانة كبرى في الوكالة', 34500, NULL),
	('902a5ac6-8756-4d1a-afc0-104ebe808070', 'a85dda26-4e34-4ffc-b06d-b1d6263cdfe7', '2021-07-27', 'entretien', 'صيانة دورية: زيت + فلاتر', 52000, NULL),
	('63828ce8-56fb-445b-b428-0944e7b15d62', 'a85dda26-4e34-4ffc-b06d-b1d6263cdfe7', '2022-01-26', 'proprietaire', 'تغيير المالك رقم 2', 69000, NULL),
	('0e43381f-edc2-4044-b1c9-f19a02100f38', 'a85dda26-4e34-4ffc-b06d-b1d6263cdfe7', '2023-10-23', 'entretien', 'تغيير الإطارات الأربعة', 86500, NULL),
	('58f718dc-6adf-481d-be81-48d471dbe615', 'a85dda26-4e34-4ffc-b06d-b1d6263cdfe7', '2024-06-13', 'entretien', 'تغيير سير التوزيع', 103500, NULL),
	('0f07484a-ac05-4914-ba79-2932862ebebc', 'a85dda26-4e34-4ffc-b06d-b1d6263cdfe7', '2026-05-23', 'visite', 'الفحص التقني — صالح', 137403, NULL),
	('0ff436d1-5925-424f-ad03-9084cc486122', 'cf14f6bf-9c7f-4d68-babb-670ae442e6f4', '2021-02-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Yamaha Ténéré 700 ABS'),
	('5d81ddaa-d535-46a9-b369-b1b9e578eacb', 'cf14f6bf-9c7f-4d68-babb-670ae442e6f4', '2023-11-26', 'entretien', 'تغيير الإطارات الأربعة', 8500, NULL),
	('383ec35f-4ca9-4244-bcee-84be0180db97', 'cf14f6bf-9c7f-4d68-babb-670ae442e6f4', '2024-04-18', 'proprietaire', 'تغيير المالك رقم 2', 12500, NULL),
	('cdcdcc77-ba83-4cfe-9216-ee3cac768f58', 'cf14f6bf-9c7f-4d68-babb-670ae442e6f4', '2024-09-27', 'entretien', 'تغيير الإطارات الأربعة', 12500, NULL),
	('a8e43059-e117-4019-b3e4-36e8ddab3d4d', 'cf14f6bf-9c7f-4d68-babb-670ae442e6f4', '2026-05-20', 'visite', 'الفحص التقني — صالح', 20365, NULL),
	('86a6356e-af94-4409-9a61-0a7c39297252', '8b6103cd-7c50-4ec7-84c8-8970efb6d778', '2023-11-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Honda Transalp 750 XL750'),
	('a89c0c59-483c-4b03-9e1f-1f2bdb5487b6', '8b6103cd-7c50-4ec7-84c8-8970efb6d778', '2025-05-25', 'entretien', 'تغيير البطارية', 8000, NULL),
	('d5e34171-7487-4d01-b40a-6c046bf05a1d', '8b6103cd-7c50-4ec7-84c8-8970efb6d778', '2026-06-16', 'visite', 'الفحص التقني — صالح', 11747, NULL),
	('78e86a06-0aa6-4d91-973f-0aabb49d93ba', '6d4a19c4-569f-41ef-a09a-b8ebdd2ae025', '2020-04-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Kawasaki Ninja 650 ABS'),
	('6aebf31f-ded5-4311-ae50-74aa22780327', '6d4a19c4-569f-41ef-a09a-b8ebdd2ae025', '2022-08-16', 'proprietaire', 'تغيير المالك رقم 2', 6500, NULL),
	('b49bffc4-4522-4c95-b3f7-6dada1cc845b', '6d4a19c4-569f-41ef-a09a-b8ebdd2ae025', '2022-11-23', 'entretien', 'تغيير البطارية', 6500, NULL),
	('b171236e-371a-4852-96d1-cd3ad72a97f0', '6d4a19c4-569f-41ef-a09a-b8ebdd2ae025', '2023-09-15', 'entretien', 'صيانة دورية: زيت + فلاتر', 9500, NULL),
	('ab80f5b3-4ae4-48a2-b480-8258920d9d86', '6d4a19c4-569f-41ef-a09a-b8ebdd2ae025', '2024-02-10', 'proprietaire', 'تغيير المالك رقم 3', 12500, NULL),
	('81323a6e-e2d4-4880-8b48-c7ebddb78559', '6d4a19c4-569f-41ef-a09a-b8ebdd2ae025', '2025-09-23', 'entretien', 'تغيير الفرامل الأمامية', 16000, NULL),
	('e58aca5a-1929-46ca-9d94-7ab544c5fecb', '6d4a19c4-569f-41ef-a09a-b8ebdd2ae025', '2026-01-26', 'visite', 'الفحص التقني — صالح', 16953, NULL),
	('d0765590-e3fe-406b-88da-59724f0b3f48', '43aab1b7-46f4-428f-ab45-77711ed01341', '2017-12-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Yamaha R6 YZF-R6'),
	('829ca867-a70e-496c-9e96-e6a61abdeba3', '43aab1b7-46f4-428f-ab45-77711ed01341', '2019-07-17', 'entretien', 'تغيير الفرامل الأمامية', 6500, NULL),
	('61396ffd-96e2-4108-a40e-3bd753b36578', '43aab1b7-46f4-428f-ab45-77711ed01341', '2021-07-20', 'entretien', 'تغيير البطارية', 13000, NULL),
	('1ba553ab-dc81-4671-8372-feaee9331051', '43aab1b7-46f4-428f-ab45-77711ed01341', '2022-01-20', 'entretien', 'تغيير الفرامل الأمامية', 16000, NULL),
	('73fcae17-fc43-4446-82b8-f0ed92b7441b', '43aab1b7-46f4-428f-ab45-77711ed01341', '2022-09-13', 'proprietaire', 'تغيير المالك رقم 2', 16000, NULL),
	('b6634b88-545b-43b3-ae08-1b080d46f80f', '43aab1b7-46f4-428f-ab45-77711ed01341', '2024-06-11', 'entretien', 'تغيير الفرامل الأمامية', 22500, NULL),
	('800a2aee-3f0e-46b4-95e8-427c0952731f', '43aab1b7-46f4-428f-ab45-77711ed01341', '2026-06-21', 'visite', 'الفحص التقني — صالح', 28410, NULL),
	('3746f9bd-ad4c-44fd-8c92-a9e3680767c8', 'b582d7f9-4ca5-4216-975e-4e7fb0b0ce9e', '2015-05-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Honda CBR 600RR ABS'),
	('102845bd-593d-430c-8dd2-f1968e854682', 'b582d7f9-4ca5-4216-975e-4e7fb0b0ce9e', '2017-01-16', 'entretien', 'تغيير سير التوزيع', 7000, NULL),
	('46708442-9a31-4906-929a-bd98c55fd2d9', 'b582d7f9-4ca5-4216-975e-4e7fb0b0ce9e', '2017-04-14', 'accident', 'حادث مصرّح به', NULL, 'صدمة خفيفة في الصدام الأمامي — تم الإصلاح'),
	('a4a75d8e-d0c6-41d7-8c1b-4c7dc529670f', 'b582d7f9-4ca5-4216-975e-4e7fb0b0ce9e', '2019-03-23', 'entretien', 'صيانة كبرى في الوكالة', 14000, NULL),
	('b4249f5d-1ad8-440e-8ac8-355c2d070f65', 'b582d7f9-4ca5-4216-975e-4e7fb0b0ce9e', '2022-06-26', 'entretien', 'صيانة دورية: زيت + فلاتر', 24000, NULL),
	('9fb883e0-1678-4519-be63-7026c45c1da2', 'b582d7f9-4ca5-4216-975e-4e7fb0b0ce9e', '2024-11-13', 'entretien', 'صيانة دورية: زيت + فلاتر', 31000, NULL),
	('465a7ad2-c8bd-477d-b245-f46264bf5244', 'b582d7f9-4ca5-4216-975e-4e7fb0b0ce9e', '2026-04-24', 'visite', 'الفحص التقني — صالح', 37478, NULL),
	('9a74017a-5b9a-4286-9c3a-5c601834e704', '93f4f0e9-b088-4033-8f09-99c35147628b', '2021-02-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Honda Forza 125 ABS'),
	('4ed75f7c-996c-48a8-8bc6-ac565a097692', '93f4f0e9-b088-4033-8f09-99c35147628b', '2023-07-17', 'entretien', 'صيانة كبرى في الوكالة', 6000, NULL);
INSERT INTO public.listing_history VALUES
	('cd9929a6-4e76-443e-8c8f-ed7ac7f0b730', '93f4f0e9-b088-4033-8f09-99c35147628b', '2024-08-26', 'entretien', 'تغيير الإطارات الأربعة', 9000, NULL),
	('4f621228-0358-49f0-98c0-7b4632477df0', '93f4f0e9-b088-4033-8f09-99c35147628b', '2024-09-10', 'proprietaire', 'تغيير المالك رقم 2', 9000, NULL),
	('17726217-9679-4957-a0ea-67b87a4427cf', '93f4f0e9-b088-4033-8f09-99c35147628b', '2026-02-17', 'visite', 'الفحص التقني — صالح', 13489, NULL),
	('5c6dfd71-6a1e-4b1e-a6ce-042fe5f276ba', 'f5d4c4c0-b271-427b-a450-1952c1be6085', '2021-07-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Kymco Agility 125 City'),
	('64694b70-0479-4848-8479-498320522b0b', 'f5d4c4c0-b271-427b-a450-1952c1be6085', '2023-12-15', 'entretien', 'تغيير الفرامل الأمامية', 8500, NULL),
	('ae20963a-d204-4e09-bb5d-25ef97fbcb77', 'f5d4c4c0-b271-427b-a450-1952c1be6085', '2024-05-14', 'entretien', 'صيانة دورية: زيت + فلاتر', 12500, NULL),
	('d666e207-7f35-4236-8173-e89f9640b7fb', 'f5d4c4c0-b271-427b-a450-1952c1be6085', '2026-02-18', 'visite', 'الفحص التقني — صالح', 19728, NULL),
	('b0775679-2f26-4f7a-a28d-4d2c8b4c34c8', '6847ba46-8bef-459e-921e-523e2653a85d', '2020-04-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Peugeot Django 125 Allure'),
	('43877808-84e4-47c7-9b46-0b254dbcc6e3', '6847ba46-8bef-459e-921e-523e2653a85d', '2022-01-23', 'proprietaire', 'تغيير المالك رقم 2', 5500, NULL),
	('6fe9b46f-32d8-462b-8932-c16c68f27828', '6847ba46-8bef-459e-921e-523e2653a85d', '2022-04-22', 'entretien', 'صيانة دورية: زيت + فلاتر', 5500, NULL),
	('bc7c0cf0-9d7a-46ad-b2ed-3c577cb049ea', '6847ba46-8bef-459e-921e-523e2653a85d', '2023-11-26', 'entretien', 'تغيير سير التوزيع', 8500, NULL),
	('2faab3e3-7a40-4b88-bc09-4b061ba027bf', '6847ba46-8bef-459e-921e-523e2653a85d', '2024-05-10', 'proprietaire', 'تغيير المالك رقم 3', 11500, NULL),
	('722297d9-fd12-4672-9f45-ed4fe3395be2', '6847ba46-8bef-459e-921e-523e2653a85d', '2025-06-20', 'entretien', 'تغيير سير التوزيع', 14000, NULL),
	('4de6658e-d11c-42f6-9774-c88b8f6b3d1a', '6847ba46-8bef-459e-921e-523e2653a85d', '2026-08-15', 'visite', 'الفحص التقني — صالح', 14706, NULL),
	('e189b3f3-f107-46e6-9fcd-0f8b15517615', '1b70053e-40f9-4af5-967b-f42c9b9ceb87', '2022-06-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'SYM Jet 14 125'),
	('20fa0d9e-71a7-4406-be4e-013ae54a2087', '1b70053e-40f9-4af5-967b-f42c9b9ceb87', '2023-07-15', 'entretien', 'تغيير الفرامل الأمامية', 3000, NULL),
	('1d0171c5-7030-43b4-bac0-1b7313306e6b', '1b70053e-40f9-4af5-967b-f42c9b9ceb87', '2024-04-23', 'proprietaire', 'تغيير المالك رقم 2', 6000, NULL),
	('f31491ed-6e1f-4848-8193-332f0b798f98', '1b70053e-40f9-4af5-967b-f42c9b9ceb87', '2025-10-10', 'entretien', 'تغيير الإطارات الأربعة', 9000, NULL),
	('c2659f88-c6c0-4b3b-b40b-66343de23c12', '1b70053e-40f9-4af5-967b-f42c9b9ceb87', '2026-02-15', 'visite', 'الفحص التقني — صالح', 10507, NULL),
	('71e8a8b1-3b87-4d3e-b332-257e299e4ba8', 'ef69fcf2-5d6a-42f4-86e3-106ebd43745d', '2019-05-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'BMW F 850 GS Adventure'),
	('4370af58-5325-437a-9d92-0b1a981d77df', 'ef69fcf2-5d6a-42f4-86e3-106ebd43745d', '2021-03-15', 'proprietaire', 'تغيير المالك رقم 2', 9500, NULL),
	('af064e75-ffb3-4bae-8e3e-4b77e4cbf26b', 'ef69fcf2-5d6a-42f4-86e3-106ebd43745d', '2021-06-17', 'entretien', 'تغيير البطارية', 9500, NULL),
	('c3bee33e-1cda-4867-9fb4-8b3c73242092', 'ef69fcf2-5d6a-42f4-86e3-106ebd43745d', '2023-01-27', 'entretien', 'تغيير البطارية', 19500, NULL),
	('91bf6a37-7da1-4daa-af63-b6617ba2791b', 'ef69fcf2-5d6a-42f4-86e3-106ebd43745d', '2024-08-16', 'proprietaire', 'تغيير المالك رقم 3', 24500, NULL),
	('81d0e17c-3ede-45aa-aa0c-1eb4c3d50f75', 'ef69fcf2-5d6a-42f4-86e3-106ebd43745d', '2024-09-11', 'entretien', 'تغيير سير التوزيع', 24500, NULL),
	('410885b7-05c4-4d80-bdd1-2ef0911ece78', 'ef69fcf2-5d6a-42f4-86e3-106ebd43745d', '2026-05-13', 'visite', 'الفحص التقني — صالح', 33213, NULL),
	('f6388a19-0e69-481b-a0fe-7e1187fd7a84', '131567fc-707d-43bd-b5b5-8b0db40ebfae', '2019-02-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Harley-Davidson Forty-Eight XL1200X'),
	('4e229d79-f702-43f1-ad35-cdca8ff7d203', '131567fc-707d-43bd-b5b5-8b0db40ebfae', '2021-12-25', 'entretien', 'صيانة كبرى في الوكالة', 5000, NULL),
	('039f9dd6-60ee-4c9c-9304-72ac93bb1ec3', '131567fc-707d-43bd-b5b5-8b0db40ebfae', '2022-01-14', 'accident', 'حادث مصرّح به', NULL, 'خدوش جانبية — صباغة جزئية للباب الأيمن'),
	('fe5ac490-c9d8-4f02-865c-a9c28a32f1a6', '131567fc-707d-43bd-b5b5-8b0db40ebfae', '2023-01-13', 'proprietaire', 'تغيير المالك رقم 2', 10500, NULL),
	('e262e796-78c7-46c0-9cc6-4dd4f0ea2fe2', '131567fc-707d-43bd-b5b5-8b0db40ebfae', '2023-10-10', 'entretien', 'صيانة دورية: زيت + فلاتر', 10500, NULL),
	('21c59568-76ad-4d58-a2a8-55a0e324b65b', '131567fc-707d-43bd-b5b5-8b0db40ebfae', '2024-05-27', 'entretien', 'تغيير سير التوزيع', 13000, NULL),
	('e75c64f3-a518-47e7-991d-735c990802a6', '131567fc-707d-43bd-b5b5-8b0db40ebfae', '2026-02-26', 'visite', 'الفحص التقني — صالح', 17746, NULL),
	('229d2634-6032-4f95-8ecf-6bf6ea18b28f', 'b29d87d9-caa2-4060-a960-c9dd5ce558b2', '2022-02-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Royal Enfield Meteor 350 Fireball'),
	('4fe71dec-c3b2-41ce-8c92-32f91f11bfe7', 'b29d87d9-caa2-4060-a960-c9dd5ce558b2', '2023-04-11', 'entretien', 'صيانة كبرى في الوكالة', 3000, NULL),
	('afc1f296-6a90-4c40-ac8a-4e24a96cdbe2', 'b29d87d9-caa2-4060-a960-c9dd5ce558b2', '2025-04-20', 'entretien', 'صيانة دورية: زيت + فلاتر', 8500, NULL),
	('32bed119-c7d4-4d21-9a3e-32ae3d0e5c92', 'b29d87d9-caa2-4060-a960-c9dd5ce558b2', '2026-04-18', 'visite', 'الفحص التقني — صالح', 9939, NULL),
	('9e713f50-6f98-4cad-bb93-894d230acf77', '11c8ea17-89fd-4961-89d2-f01a91fd92d4', '2021-03-12', 'mise-en-circulation', 'أول تسجيل في المغرب', NULL, 'Bajaj Pulsar NS200'),
	('3ea024dd-2239-43db-9708-50f8aec58aaf', '11c8ea17-89fd-4961-89d2-f01a91fd92d4', '2023-04-10', 'entretien', 'تغيير البطارية', 9500, NULL),
	('4c885cef-6fd9-41ea-9fb6-86144ffa425c', '11c8ea17-89fd-4961-89d2-f01a91fd92d4', '2023-06-23', 'proprietaire', 'تغيير المالك رقم 2', 9500, NULL),
	('138ff046-d1b2-4f2b-9329-6ca565cea0a0', '11c8ea17-89fd-4961-89d2-f01a91fd92d4', '2024-02-19', 'proprietaire', 'تغيير المالك رقم 3', 14500, NULL),
	('d2905d5b-7bec-42db-851b-16fcb277f6d2', '11c8ea17-89fd-4961-89d2-f01a91fd92d4', '2024-12-27', 'entretien', 'تغيير الفرامل الأمامية', 14500, NULL),
	('6f055183-50c9-4e34-aaf0-0e6b94de6f47', '11c8ea17-89fd-4961-89d2-f01a91fd92d4', '2026-02-19', 'visite', 'الفحص التقني — صالح', 21158, NULL);


--
-- Data for Name: listing_media; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: listing_views; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.listings VALUES
	('c54d6da7-9d9f-4cc3-89d6-b8de57b9fcd8', 'c001', 'dacia-logan-2015-c001', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Dacia', 'Logan', '1.5 dCi Ambiance', 2015, 187000, 86000, 1, 'diesel', 'manuelle', 'berline', 6, 4.5, NULL, 4, 'فضي', 'casablanca', 'bon', true, false, '2026-12-25', false, false, true, NULL, 'للجادين فقط، الثمن قابل للنقاش الخفيف. Dacia Logan 1.5 dCi Ambiance موديل 2015، قاطعة 187 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. نقبل الفحص عند أي كراج ديال اختيارك.', '{"وسائد هوائية","نظام ESP","مكيف الهواء"}', false, false, 67, 85500, 0.0058, 15, false, NULL, NULL, 895, 45, '2026-08-12 17:00:00+00', NULL, NULL, '2026-08-26 14:44:18.032753+00', '2026-08-26 14:44:18.032753+00'),
	('0b618a31-af03-4883-b52f-745df7c5b0c4', 'c002', 'dacia-sandero-2019-c002', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'car', 'Dacia', 'Sandero', 'Stepway 1.5 dCi', 2019, 96000, 139000, 2, 'diesel', 'manuelle', 'citadine', 6, 4.3, NULL, 5, 'بني', 'rabat', 'tres-bon', false, true, '2026-10-06', true, true, true, NULL, 'ملكية واحدة منذ الشراء، الوثائق كاملة وسليمة. Dacia Sandero Stepway 1.5 dCi موديل 2019، قاطعة 96 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"نظام ABS","حساسات ركن","مقود متعدد الوظائف","فتحة سقف","مقاعد جلدية","مكيف الهواء"}', true, false, 89, 144000, -0.0347, 8, false, NULL, NULL, 4129, 91, '2026-08-06 06:00:00+00', NULL, NULL, '2026-08-26 14:44:18.038972+00', '2026-08-26 14:44:18.038972+00'),
	('95ad54d3-407c-40c4-955d-22e4961c2349', 'c003', 'dacia-duster-2018-c003', '89d64bb6-01a3-4c1a-b40e-3755e2be86a1', '1abf2c18-885b-4d44-aea4-6494a93412df', 'active', 'car', 'Dacia', 'Duster', '1.5 dCi 4x2 Prestige', 2018, 118000, 178000, 2, 'diesel', 'manuelle', 'suv', 7, 5.1, NULL, 5, 'أحمر', 'marrakech', 'tres-bon', false, true, '2026-09-17', false, true, false, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. Dacia Duster 1.5 dCi 4x2 Prestige موديل 2018، قاطعة 118 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"حساسات ركن","قفل مركزي","راديو Bluetooth","مقود متعدد الوظائف","تكييف أوتوماتيكي","نظام ABS","وسائد هوائية","شاشة تعمل باللمس"}', false, false, 74, 162000, 0.0988, 5, true, NULL, NULL, 4003, 45, '2026-08-12 08:00:00+00', NULL, NULL, '2026-08-26 14:44:18.041923+00', '2026-08-26 14:44:18.041923+00'),
	('7a6717b6-d34d-42ff-946c-c0a34bde30b9', 'c004', 'dacia-dokker-2017-c004', '6573e2ba-2d03-492a-9495-345dc461d080', NULL, 'active', 'car', 'Dacia', 'Dokker', '1.5 dCi Ambiance', 2017, 142000, 112000, 3, 'diesel', 'manuelle', 'utilitaire', 6, 4.8, NULL, 5, 'رمادي', 'fes', 'bon', false, true, '2026-11-24', false, true, true, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. Dacia Dokker 1.5 dCi Ambiance موديل 2017، قاطعة 142 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"نظام ESP","مثبت السرعة","مكيف الهواء"}', false, false, 66, 120000, -0.0667, 7, true, 'featured', '2026-09-09 14:44:18.045361+00', 2887, 57, '2026-08-12 03:00:00+00', NULL, NULL, '2026-08-26 14:44:18.045361+00', '2026-08-26 14:44:18.045361+00'),
	('08e29a0f-3a11-42e9-bc17-72d6cb17f981', 'c005', 'dacia-lodgy-2016-c005', '836bbe3f-193e-435d-8aef-ca5de0fb10d0', NULL, 'active', 'car', 'Dacia', 'Lodgy', '1.5 dCi 7 places', 2016, 165000, 118000, 1, 'diesel', 'manuelle', 'break', 6, 5.0, NULL, 5, 'أسود', 'agadir', 'bon', true, true, '2026-12-07', true, false, false, NULL, 'صيانة منتظمة، الزيت والفلاتر مغيّرين من قريب. Dacia Lodgy 1.5 dCi 7 places موديل 2016، قاطعة 165 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. التسليم فوري بعد إتمام الإجراءات.', '{GPS,"راديو Bluetooth","كاميرا الرجوع للخلف","جنطات ألومنيوم","قفل مركزي"}', true, true, 75, 111000, 0.0631, 11, false, NULL, NULL, 576, 101, '2026-08-13 16:00:00+00', NULL, NULL, '2026-08-26 14:44:18.048635+00', '2026-08-26 14:44:18.048635+00'),
	('6dc0d3db-4e09-4d68-bc74-ef01034a1e20', 'c006', 'renault-clio-4-2017-c006', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Renault', 'Clio 4', '1.5 dCi Business', 2017, 128000, 124000, 1, 'diesel', 'manuelle', 'citadine', 5, 3.9, NULL, 5, 'بيج', 'casablanca', 'tres-bon', true, true, '2026-12-14', false, true, true, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. Renault Clio 4 1.5 dCi Business موديل 2017، قاطعة 128 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"كاميرا الرجوع للخلف","وسائد هوائية","مكيف الهواء","مثبت السرعة","زجاج كهربائي","تكييف أوتوماتيكي",GPS,"مقود متعدد الوظائف"}', true, false, 81, 121500, 0.0206, 13, false, 'featured', '2026-09-09 14:44:18.051605+00', 553, 167, '2026-08-11 18:00:00+00', NULL, NULL, '2026-08-26 14:44:18.051605+00', '2026-08-26 14:44:18.051605+00'),
	('078cd4a9-0388-45c2-91aa-d979e998b940', 'c007', 'renault-symbol-2016-c007', 'f6c8d3f6-bf53-4ce4-a951-15ad5084206e', '71fa13ec-2186-4ca9-b251-637d2d889caf', 'active', 'car', 'Renault', 'Symbol', '1.5 dCi Life', 2016, 158000, 94000, 1, 'diesel', 'manuelle', 'berline', 6, 4.2, NULL, 4, 'بيج', 'tanger', 'bon', true, true, '2026-11-05', true, true, true, NULL, 'مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي. Renault Symbol 1.5 dCi Life موديل 2016، قاطعة 158 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"أضواء LED",GPS,"راديو Bluetooth","مقود متعدد الوظائف","كاميرا الرجوع للخلف","وسائد هوائية"}', true, false, 85, 106000, -0.1132, 4, false, 'featured', '2026-09-09 14:44:18.054664+00', 505, 173, '2026-08-02 07:00:00+00', NULL, NULL, '2026-08-26 14:44:18.054664+00', '2026-08-26 14:44:18.054664+00'),
	('f45703fb-0547-43cb-bad0-654783251e26', 'c008', 'renault-megane-2018-c008', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'car', 'Renault', 'Mégane', '1.5 dCi Intens', 2018, 104000, 158000, 2, 'diesel', 'automatique', 'berline', 7, 4.4, NULL, 5, 'أزرق ليلي', 'rabat', 'excellent', false, true, '2026-12-10', false, true, true, NULL, 'صيانة منتظمة، الزيت والفلاتر مغيّرين من قريب. Renault Mégane 1.5 dCi Intens موديل 2018، قاطعة 104 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. التسليم فوري بعد إتمام الإجراءات.', '{"كاميرا الرجوع للخلف","قفل مركزي","مكيف الهواء","تكييف أوتوماتيكي","راديو Bluetooth","نظام ESP","زجاج كهربائي","نظام ABS"}', false, true, 79, 178000, -0.1124, 14, false, NULL, NULL, 2990, 47, '2026-08-09 02:00:00+00', NULL, NULL, '2026-08-26 14:44:18.057552+00', '2026-08-26 14:44:18.057552+00'),
	('cf8b1b7a-6aa2-44ec-9f58-6398b0c3e638', 'c009', 'renault-kangoo-2016-c009', '0c5136df-b8f8-4b46-a4dc-3b0ca147f4a0', '0eed6c78-7442-4274-a049-1eff4cc0588d', 'active', 'car', 'Renault', 'Kangoo', '1.5 dCi Confort', 2016, 178000, 96000, 2, 'diesel', 'manuelle', 'utilitaire', 6, 5.2, NULL, 4, 'بني', 'settat', 'moyen', false, false, '2026-11-08', true, false, false, NULL, 'ملكية واحدة منذ الشراء، الوثائق كاملة وسليمة. Renault Kangoo 1.5 dCi Confort موديل 2016، قاطعة 178 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. التسليم فوري بعد إتمام الإجراءات.', '{"مثبت السرعة","جنطات ألومنيوم","حساسات ركن","شاشة تعمل باللمس","وسائد هوائية"}', true, false, 68, 132000, -0.2727, 9, true, NULL, NULL, 4228, 76, '2026-08-04 08:00:00+00', NULL, NULL, '2026-08-26 14:44:18.061066+00', '2026-08-26 14:44:18.061066+00'),
	('e6440068-6d58-4384-b322-8ee2caf6aa12', 'c010', 'renault-captur-2019-c010', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Renault', 'Captur', '1.5 dCi Zen', 2019, 88000, 172000, 3, 'diesel', 'manuelle', 'suv', 6, 4.4, NULL, 5, 'فضي', 'mohammedia', 'tres-bon', false, false, '2026-11-13', false, true, true, NULL, 'المركبة مصانة بزاف، الصيانة كاملة كتدار فالوكالة. Renault Captur 1.5 dCi Zen موديل 2019، قاطعة 88 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. التسليم فوري بعد إتمام الإجراءات.', '{"جنطات ألومنيوم","وسائد هوائية","مقود متعدد الوظائف","نظام ESP","زجاج كهربائي","مقاعد جلدية"}', true, true, 66, 218000, -0.2110, 13, false, 'featured', '2026-09-09 14:44:18.064469+00', 1769, 173, '2026-08-16 07:00:00+00', NULL, NULL, '2026-08-26 14:44:18.064469+00', '2026-08-26 14:44:18.064469+00'),
	('522305b6-043b-4a3a-ad2e-843e02db85c0', 'c011', 'peugeot-208-2018-c011', '80f06af8-1897-4a45-a7fd-0b42d16d3a05', '3535a2d7-ed03-452b-886f-e17d182246cd', 'active', 'car', 'Peugeot', '208', '1.6 BlueHDi Active', 2018, 112000, 132000, 2, 'diesel', 'manuelle', 'citadine', 5, 3.8, NULL, 5, 'رمادي', 'casablanca', 'tres-bon', false, true, '2026-12-17', false, false, true, NULL, 'الطوموبيل مزيانة بزاف، ما فيها لا صدمة لا صباغة. Peugeot 208 1.6 BlueHDi Active موديل 2018، قاطعة 112 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"تكييف أوتوماتيكي","كاميرا الرجوع للخلف",GPS,"مثبت السرعة","نظام ESP","مقاعد جلدية","نظام ABS","مكيف الهواء"}', true, true, 79, 129000, 0.0233, 16, true, NULL, NULL, 1149, 117, '2026-08-10 17:00:00+00', NULL, NULL, '2026-08-26 14:44:18.068364+00', '2026-08-26 14:44:18.068364+00'),
	('14d4493c-5f13-4b7e-a91e-3d92a1b589f7', 'c012', 'peugeot-301-2017-c012', 'd9e8ba57-f704-4b4f-8d15-87798fcaa33b', NULL, 'active', 'car', 'Peugeot', '301', '1.6 HDi Allure', 2017, 146000, 116000, 1, 'diesel', 'manuelle', 'berline', 6, 4.1, NULL, 4, 'بني', 'meknes', 'bon', true, true, '2026-09-24', false, false, true, NULL, 'صيانة منتظمة، الزيت والفلاتر مغيّرين من قريب. Peugeot 301 1.6 HDi Allure موديل 2017، قاطعة 146 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. نقبل الفحص عند أي كراج ديال اختيارك.', '{"فتحة سقف","جنطات ألومنيوم","مكيف الهواء","تكييف أوتوماتيكي"}', true, false, 63, 115500, 0.0043, 9, false, NULL, NULL, 253, 20, '2026-08-19 04:00:00+00', NULL, NULL, '2026-08-26 14:44:18.073143+00', '2026-08-26 14:44:18.073143+00'),
	('ea493a89-491c-464b-8769-6d316be9370e', 'c013', 'peugeot-3008-2019-c013', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'car', 'Peugeot', '3008', '1.5 BlueHDi GT Line', 2019, 92000, 268000, 1, 'diesel', 'automatique', 'suv', 7, 4.9, NULL, 5, 'بني', 'rabat', 'excellent', true, true, '2026-09-06', false, true, false, NULL, 'للجادين فقط، الثمن قابل للنقاش الخفيف. Peugeot 3008 1.5 BlueHDi GT Line موديل 2019، قاطعة 92 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"أضواء LED","شاشة تعمل باللمس","جنطات ألومنيوم","كاميرا الرجوع للخلف","زجاج كهربائي","وسائد هوائية","نظام ESP",GPS}', true, false, 74, 259000, 0.0347, 6, false, NULL, NULL, 3508, 130, '2026-07-29 07:00:00+00', NULL, NULL, '2026-08-26 14:44:18.076509+00', '2026-08-26 14:44:18.076509+00'),
	('07a5b91e-e137-4eb4-9c8a-a4fa28734430', 'c014', 'peugeot-partner-2018-c014', '80f06af8-1897-4a45-a7fd-0b42d16d3a05', '3535a2d7-ed03-452b-886f-e17d182246cd', 'active', 'car', 'Peugeot', 'Partner', '1.6 HDi Pro', 2018, 134000, 126000, 1, 'diesel', 'manuelle', 'utilitaire', 6, 5.0, NULL, 4, 'أسود', 'kenitra', 'bon', true, true, '2026-09-13', true, false, false, NULL, 'بيع بسبب شراء طوموبيل جديدة، الحالة ديالها ممتازة. Peugeot Partner 1.6 HDi Pro موديل 2018، قاطعة 134 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{GPS,"راديو Bluetooth","مثبت السرعة","حساسات ركن","مقاعد جلدية"}', true, false, 73, 134000, -0.0597, 4, false, NULL, NULL, 1437, 100, '2026-08-04 20:00:00+00', NULL, NULL, '2026-08-26 14:44:18.079592+00', '2026-08-26 14:44:18.079592+00'),
	('2230879f-4d79-42a8-9c8b-15b90febfafc', 'c015', 'citroen-c-elysee-2018-c015', 'd4b28e5b-0c52-4fdd-a238-bf58af0b4ec2', '326aa189-4b6f-469e-b170-305be968d099', 'active', 'car', 'Citroën', 'C-Elysée', '1.6 HDi Feel', 2018, 121000, 112000, 3, 'diesel', 'manuelle', 'berline', 6, 4.0, NULL, 4, 'أزرق ليلي', 'oujda', 'bon', false, false, '2026-09-19', true, true, true, NULL, 'المركبة مصانة بزاف، الصيانة كاملة كتدار فالوكالة. Citroën C-Elysée 1.6 HDi Feel موديل 2018، قاطعة 121 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"فتحة سقف","نظام ABS","مثبت السرعة","جنطات ألومنيوم","نظام ESP","مقاعد جلدية"}', true, false, 74, 133000, -0.1579, 12, false, 'featured', '2026-09-09 14:44:18.084168+00', 2408, 118, '2026-07-31 21:00:00+00', NULL, NULL, '2026-08-26 14:44:18.084168+00', '2026-08-26 14:44:18.084168+00'),
	('484f378d-fd41-4d3e-ab6d-0dd15a60dbd1', 'c016', 'citroen-c3-2019-c016', 'bf252bb9-478a-49a3-a9e6-fb52fed144aa', NULL, 'active', 'car', 'Citroën', 'C3', '1.5 BlueHDi Shine', 2019, 79000, 138000, 2, 'diesel', 'manuelle', 'citadine', 5, 3.9, NULL, 5, 'بيج', 'tetouan', 'tres-bon', false, true, '2026-11-19', false, true, false, NULL, 'ملكية واحدة منذ الشراء، الوثائق كاملة وسليمة. Citroën C3 1.5 BlueHDi Shine موديل 2019، قاطعة 79 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"مكيف الهواء","كاميرا الرجوع للخلف","جنطات ألومنيوم","حساسات ركن","وسائد هوائية","فتحة سقف",GPS,"قفل مركزي"}', true, false, 64, 151500, -0.0891, 16, false, NULL, NULL, 2708, 175, '2026-07-25 08:00:00+00', NULL, NULL, '2026-08-26 14:44:18.087967+00', '2026-08-26 14:44:18.087967+00'),
	('294aeaf0-dd54-4aca-bbd0-c8848ac7947c', 'c017', 'volkswagen-golf-7-2016-c017', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Volkswagen', 'Golf 7', '1.6 TDI Confortline', 2016, 149000, 176000, 3, 'diesel', 'manuelle', 'citadine', 6, 4.3, NULL, 5, 'أبيض', 'casablanca', 'tres-bon', false, true, '2026-10-21', false, true, false, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. Volkswagen Golf 7 1.6 TDI Confortline موديل 2016، قاطعة 149 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"نظام ABS","كاميرا الرجوع للخلف","فتحة سقف","مقاعد جلدية","وسائد هوائية","تكييف أوتوماتيكي"}', false, false, 73, 122000, 0.4426, 12, true, NULL, NULL, 4115, 5, '2026-08-20 07:00:00+00', NULL, NULL, '2026-08-26 14:44:18.090924+00', '2026-08-26 14:44:18.090924+00'),
	('28d5c31c-c766-465a-8159-f18d594e9416', 'c018', 'volkswagen-polo-2018-c018', 'd9e8ba57-f704-4b4f-8d15-87798fcaa33b', NULL, 'active', 'car', 'Volkswagen', 'Polo', '1.6 TDI Trendline', 2018, 98000, 162000, 3, 'diesel', 'manuelle', 'citadine', 5, 4.0, NULL, 5, 'أزرق ليلي', 'marrakech', 'tres-bon', false, true, '2026-12-14', true, false, true, NULL, 'مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي. Volkswagen Polo 1.6 TDI Trendline موديل 2018، قاطعة 98 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. التسليم فوري بعد إتمام الإجراءات.', '{"تكييف أوتوماتيكي","راديو Bluetooth","نظام ESP","مكيف الهواء","قفل مركزي","حساسات ركن","شاشة تعمل باللمس","نظام ABS"}', true, false, 68, 148500, 0.0909, 15, false, NULL, NULL, 478, 67, '2026-07-27 06:00:00+00', NULL, NULL, '2026-08-26 14:44:18.093647+00', '2026-08-26 14:44:18.093647+00'),
	('edfae492-8b98-4e46-9b1e-e98d1827da50', 'c019', 'volkswagen-passat-2015-c019', '6573e2ba-2d03-492a-9495-345dc461d080', NULL, 'active', 'car', 'Volkswagen', 'Passat', '2.0 TDI Highline', 2015, 196000, 172000, 2, 'diesel', 'automatique', 'berline', 8, 5.1, NULL, 4, 'أزرق ليلي', 'fes', 'bon', false, true, '2026-10-15', false, false, true, NULL, 'للجادين فقط، الثمن قابل للنقاش الخفيف. Volkswagen Passat 2.0 TDI Highline موديل 2015، قاطعة 196 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"نظام ESP","راديو Bluetooth","نظام ABS","قفل مركزي","مثبت السرعة","تكييف أوتوماتيكي"}', true, false, 62, 111000, 0.5495, 13, false, NULL, NULL, 2217, 163, '2026-07-23 21:00:00+00', NULL, NULL, '2026-08-26 14:44:18.096834+00', '2026-08-26 14:44:18.096834+00'),
	('74dd8d06-0586-48f2-b92e-5178b782d27a', 'c020', 'volkswagen-tiguan-2019-c020', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'car', 'Volkswagen', 'Tiguan', '2.0 TDI Carat', 2019, 86000, 298000, 2, 'diesel', 'automatique', 'suv', 8, 5.6, NULL, 5, 'رمادي', 'rabat', 'excellent', false, true, '2026-10-23', false, false, false, NULL, 'صيانة منتظمة، الزيت والفلاتر مغيّرين من قريب. Volkswagen Tiguan 2.0 TDI Carat موديل 2019، قاطعة 86 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. نقبل الفحص عند أي كراج ديال اختيارك.', '{"كاميرا الرجوع للخلف","فتحة سقف","زجاج كهربائي","راديو Bluetooth","شاشة تعمل باللمس",GPS,"نظام ABS","نظام ESP","تكييف أوتوماتيكي"}', false, false, 67, 293500, 0.0153, 11, false, NULL, NULL, 3726, 63, '2026-08-04 06:00:00+00', NULL, NULL, '2026-08-26 14:44:18.099891+00', '2026-08-26 14:44:18.099891+00'),
	('28880baf-ae9e-4c32-89a4-85570160d37c', 'c021', 'hyundai-i10-2019-c021', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Hyundai', 'i10', '1.0 Essence Confort', 2019, 74000, 108000, 3, 'essence', 'manuelle', 'citadine', 5, 5.2, NULL, 5, 'بني', 'casablanca', 'tres-bon', false, true, '2026-09-08', true, true, true, NULL, 'بيع بسبب شراء طوموبيل جديدة، الحالة ديالها ممتازة. Hyundai i10 1.0 Essence Confort موديل 2019، قاطعة 74 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"كاميرا الرجوع للخلف","مقاعد جلدية",GPS,"تكييف أوتوماتيكي"}', true, false, 80, 140500, -0.2313, 7, false, NULL, NULL, 3378, 38, '2026-08-04 21:00:00+00', NULL, NULL, '2026-08-26 14:44:18.102581+00', '2026-08-26 14:44:18.102581+00'),
	('0cf5bf71-cacc-4992-818c-68b6978ed08a', 'c022', 'hyundai-accent-2016-c022', 'd3ad54b8-e01a-4140-98a4-b714c12ec3dc', '259445a0-69da-4bab-8642-b9f29bcdbd08', 'active', 'car', 'Hyundai', 'Accent', '1.5 CRDi GLS', 2016, 152000, 96000, 1, 'diesel', 'manuelle', 'berline', 6, 4.6, NULL, 4, 'أزرق ليلي', 'safi', 'bon', true, false, '2026-11-06', true, false, false, NULL, 'ملكية واحدة منذ الشراء، الوثائق كاملة وسليمة. Hyundai Accent 1.5 CRDi GLS موديل 2016، قاطعة 152 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. التسليم فوري بعد إتمام الإجراءات.', '{"كاميرا الرجوع للخلف","مقاعد جلدية","زجاج كهربائي","نظام ABS"}', false, true, 70, 104500, -0.0813, 16, false, 'top', '2026-09-25 14:44:18.105214+00', 3700, 131, '2026-08-20 05:00:00+00', NULL, NULL, '2026-08-26 14:44:18.105214+00', '2026-08-26 14:44:18.105214+00'),
	('a2b52849-e9f0-424f-9fb8-f5250d1cfee3', 'c023', 'hyundai-tucson-2018-c023', 'f6c8d3f6-bf53-4ce4-a951-15ad5084206e', '71fa13ec-2186-4ca9-b251-637d2d889caf', 'active', 'car', 'Hyundai', 'Tucson', '2.0 CRDi Executive', 2018, 108000, 245000, 3, 'diesel', 'automatique', 'suv', 8, 5.8, NULL, 5, 'أزرق ليلي', 'tanger', 'tres-bon', false, true, '2026-11-17', false, true, true, NULL, 'بيع بسبب شراء طوموبيل جديدة، الحالة ديالها ممتازة. Hyundai Tucson 2.0 CRDi Executive موديل 2018، قاطعة 108 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. التسليم فوري بعد إتمام الإجراءات.', '{"زجاج كهربائي","مقاعد جلدية","كاميرا الرجوع للخلف","حساسات ركن","جنطات ألومنيوم","راديو Bluetooth","مقود متعدد الوظائف","فتحة سقف","نظام ABS"}', false, false, 70, 236000, 0.0381, 5, false, NULL, NULL, 1421, 80, '2026-08-12 19:00:00+00', NULL, NULL, '2026-08-26 14:44:18.108179+00', '2026-08-26 14:44:18.108179+00'),
	('d6cc02d9-dedb-4c47-862f-af6ba4e9bcb9', 'c024', 'kia-picanto-2018-c024', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Kia', 'Picanto', '1.0 Essence Motion', 2018, 82000, 97000, 2, 'essence', 'manuelle', 'citadine', 5, 5.0, NULL, 5, 'أبيض', 'sale', 'tres-bon', false, true, '2026-10-14', false, false, false, NULL, 'مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي. Kia Picanto 1.0 Essence Motion موديل 2018، قاطعة 82 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الثمن نهائي تقريباً، المرجو الجدية.', '{"كاميرا الرجوع للخلف","جنطات ألومنيوم","مقاعد جلدية"}', false, false, 57, 133500, -0.2734, 4, false, NULL, NULL, 1543, 61, '2026-08-05 17:00:00+00', NULL, NULL, '2026-08-26 14:44:18.110914+00', '2026-08-26 14:44:18.110914+00'),
	('32f9c753-86d0-491c-935e-3ca71ee91f25', 'c025', 'kia-rio-2017-c025', 'd9e8ba57-f704-4b4f-8d15-87798fcaa33b', NULL, 'active', 'car', 'Kia', 'Rio', '1.4 CRDi Active', 2017, 118000, 113000, 3, 'diesel', 'manuelle', 'citadine', 5, 4.1, NULL, 5, 'أبيض', 'el-jadida', 'bon', false, true, '2026-10-25', false, false, true, NULL, 'بيع بسبب شراء طوموبيل جديدة، الحالة ديالها ممتازة. Kia Rio 1.4 CRDi Active موديل 2017، قاطعة 118 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. التسليم فوري بعد إتمام الإجراءات.', '{"تكييف أوتوماتيكي","مقود متعدد الوظائف","جنطات ألومنيوم","زجاج كهربائي"}', false, true, 62, 118000, -0.0424, 9, true, 'urgent', '2026-09-16 14:44:18.113155+00', 3556, 50, '2026-07-23 02:00:00+00', NULL, NULL, '2026-08-26 14:44:18.113155+00', '2026-08-26 14:44:18.113155+00'),
	('fa17c904-82af-4d20-96bf-71529d997320', 'c026', 'kia-sportage-2019-c026', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Kia', 'Sportage', '1.7 CRDi Style', 2019, 94000, 242000, 2, 'diesel', 'automatique', 'suv', 7, 5.4, NULL, 5, 'بني', 'casablanca', 'excellent', false, true, '2026-10-14', true, false, true, NULL, 'المركبة مصانة بزاف، الصيانة كاملة كتدار فالوكالة. Kia Sportage 1.7 CRDi Style موديل 2019، قاطعة 94 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"مثبت السرعة","مقاعد جلدية","كاميرا الرجوع للخلف","شاشة تعمل باللمس","أضواء LED","نظام ABS","جنطات ألومنيوم","تكييف أوتوماتيكي"}', true, false, 86, 270000, -0.1037, 5, true, 'featured', '2026-09-09 14:44:18.115629+00', 979, 95, '2026-08-07 15:00:00+00', NULL, NULL, '2026-08-26 14:44:18.115629+00', '2026-08-26 14:44:18.115629+00'),
	('a97049ee-ca89-4f8d-a565-88c20f7db46a', 'c027', 'toyota-yaris-2017-c027', 'bf252bb9-478a-49a3-a9e6-fb52fed144aa', NULL, 'active', 'car', 'Toyota', 'Yaris', '1.4 D-4D Luna', 2017, 124000, 133000, 2, 'diesel', 'manuelle', 'citadine', 5, 3.9, NULL, 5, 'رمادي', 'agadir', 'tres-bon', false, true, '2026-11-15', false, true, true, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. Toyota Yaris 1.4 D-4D Luna موديل 2017، قاطعة 124 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"تكييف أوتوماتيكي","جنطات ألومنيوم","فتحة سقف","وسائد هوائية","مقود متعدد الوظائف","أضواء LED","نظام ESP","نظام ABS"}', true, false, 68, 120000, 0.1083, 4, false, NULL, NULL, 1330, 80, '2026-08-05 02:00:00+00', NULL, NULL, '2026-08-26 14:44:18.118067+00', '2026-08-26 14:44:18.118067+00'),
	('c61b9dc2-a974-44aa-ba75-d2e2d611a5d1', 'c028', 'toyota-corolla-2020-c028', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'car', 'Toyota', 'Corolla', '1.8 Hybride Dynamic', 2020, 68000, 236000, 2, 'hybride', 'automatique', 'berline', 7, 4.2, NULL, 4, 'أبيض', 'rabat', 'excellent', false, true, '2026-12-22', false, true, true, NULL, 'مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي. Toyota Corolla 1.8 Hybride Dynamic موديل 2020، قاطعة 68 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"مثبت السرعة","جنطات ألومنيوم","حساسات ركن","راديو Bluetooth","قفل مركزي","تكييف أوتوماتيكي","نظام ESP","مكيف الهواء","أضواء LED","وسائد هوائية","نظام ABS"}', false, true, 80, 235500, 0.0021, 9, false, NULL, NULL, 334, 89, '2026-08-11 02:00:00+00', NULL, NULL, '2026-08-26 14:44:18.120664+00', '2026-08-26 14:44:18.120664+00'),
	('5f528cd8-091a-4982-83ea-6d3d13d1c81f', 'c029', 'toyota-hilux-2018-c029', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'car', 'Toyota', 'Hilux', '2.4 D-4D 4x4 Double Cab', 2018, 156000, 328000, 2, 'diesel', 'manuelle', 'utilitaire', 9, 7.6, NULL, 4, 'بيج', 'errachidia', 'bon', false, true, '2026-09-18', false, true, true, NULL, 'مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي. Toyota Hilux 2.4 D-4D 4x4 Double Cab موديل 2018، قاطعة 156 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"كاميرا الرجوع للخلف","نظام ESP","مكيف الهواء","حساسات ركن","مقود متعدد الوظائف","شاشة تعمل باللمس","جنطات ألومنيوم","تكييف أوتوماتيكي",GPS}', true, true, 80, 235000, 0.3957, 16, false, NULL, NULL, 3202, 6, '2026-07-27 09:00:00+00', NULL, NULL, '2026-08-26 14:44:18.123448+00', '2026-08-26 14:44:18.123448+00'),
	('9a5a936c-da2b-4306-a00e-8e7537b20fce', 'c030', 'ford-fiesta-2016-c030', '6573e2ba-2d03-492a-9495-345dc461d080', NULL, 'active', 'car', 'Ford', 'Fiesta', '1.5 TDCi Trend', 2016, 138000, 104000, 3, 'diesel', 'manuelle', 'citadine', 5, 3.8, NULL, 5, 'أسود', 'khouribga', 'bon', false, true, '2026-09-11', true, true, false, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. Ford Fiesta 1.5 TDCi Trend موديل 2016، قاطعة 138 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"تكييف أوتوماتيكي","راديو Bluetooth","كاميرا الرجوع للخلف"}', true, false, 72, 106000, -0.0189, 6, true, NULL, NULL, 751, 84, '2026-08-15 23:00:00+00', NULL, NULL, '2026-08-26 14:44:18.126292+00', '2026-08-26 14:44:18.126292+00'),
	('3bd091a8-b5cc-4aea-b415-6b7ab4e59938', 'c031', 'ford-focus-2017-c031', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Ford', 'Focus', '1.5 TDCi Titanium', 2017, 129000, 134000, 2, 'diesel', 'manuelle', 'citadine', 6, 4.2, NULL, 5, 'بني', 'casablanca', 'bon', false, true, '2026-11-12', false, false, false, NULL, 'بيع بسبب شراء طوموبيل جديدة، الحالة ديالها ممتازة. Ford Focus 1.5 TDCi Titanium موديل 2017، قاطعة 129 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. التسليم فوري بعد إتمام الإجراءات.', '{"وسائد هوائية","مكيف الهواء","مقود متعدد الوظائف","راديو Bluetooth","جنطات ألومنيوم","قفل مركزي","مثبت السرعة","نظام ABS"}', true, false, 70, 125500, 0.0677, 14, false, NULL, NULL, 3694, 155, '2026-08-18 20:00:00+00', NULL, NULL, '2026-08-26 14:44:18.128631+00', '2026-08-26 14:44:18.128631+00'),
	('c15a776e-44aa-4cac-9252-fa14bb8c1738', 'c032', 'fiat-punto-2014-c032', '80f06af8-1897-4a45-a7fd-0b42d16d3a05', '3535a2d7-ed03-452b-886f-e17d182246cd', 'active', 'car', 'Fiat', 'Punto', '1.3 Multijet Easy', 2014, 172000, 68000, 4, 'diesel', 'manuelle', 'citadine', 5, 4.0, NULL, 5, 'بيج', 'beni-mellal', 'moyen', false, true, '2026-10-23', false, false, true, NULL, 'بيع بسبب شراء طوموبيل جديدة، الحالة ديالها ممتازة. Fiat Punto 1.3 Multijet Easy موديل 2014، قاطعة 172 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. نقبل الفحص عند أي كراج ديال اختيارك.', '{"راديو Bluetooth","مقود متعدد الوظائف","نظام ESP",GPS}', true, false, 72, 68000, 0.0000, 12, true, NULL, NULL, 3988, 112, '2026-08-08 07:00:00+00', NULL, NULL, '2026-08-26 14:44:18.131804+00', '2026-08-26 14:44:18.131804+00'),
	('839812f3-c38d-492b-8b99-42667682ed9f', 'c033', 'fiat-tipo-2019-c033', '836bbe3f-193e-435d-8aef-ca5de0fb10d0', NULL, 'active', 'car', 'Fiat', 'Tipo', '1.3 Multijet Lounge', 2019, 91000, 142000, 3, 'diesel', 'manuelle', 'berline', 6, 4.1, NULL, 4, 'أحمر', 'nador', 'tres-bon', false, true, '2026-09-27', false, true, false, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. Fiat Tipo 1.3 Multijet Lounge موديل 2019، قاطعة 91 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"مثبت السرعة","حساسات ركن","نظام ABS","نظام ESP","مقود متعدد الوظائف","زجاج كهربائي"}', true, true, 69, 145500, -0.0241, 11, true, NULL, NULL, 4100, 36, '2026-08-13 05:00:00+00', NULL, NULL, '2026-08-26 14:44:18.135093+00', '2026-08-26 14:44:18.135093+00'),
	('e527e457-f89f-49cd-85a6-37b78ad9ecde', 'c034', 'seat-ibiza-2018-c034', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'car', 'Seat', 'Ibiza', '1.6 TDI Style', 2018, 106000, 148000, 3, 'diesel', 'manuelle', 'citadine', 5, 4.0, NULL, 5, 'بيج', 'temara', 'tres-bon', false, true, '2026-12-06', false, false, false, NULL, 'الطوموبيل مزيانة بزاف، ما فيها لا صدمة لا صباغة. Seat Ibiza 1.6 TDI Style موديل 2018، قاطعة 106 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الثمن نهائي تقريباً، المرجو الجدية.', '{GPS,"قفل مركزي","نظام ABS","مقاعد جلدية","مقود متعدد الوظائف","مثبت السرعة","مكيف الهواء"}', true, false, 64, 142000, 0.0423, 14, true, NULL, NULL, 807, 178, '2026-07-30 23:00:00+00', NULL, NULL, '2026-08-26 14:44:18.138207+00', '2026-08-26 14:44:18.138207+00'),
	('62af184d-6656-4fda-a4ed-46b66ab54b2c', 'c035', 'seat-leon-2017-c035', '80f06af8-1897-4a45-a7fd-0b42d16d3a05', '3535a2d7-ed03-452b-886f-e17d182246cd', 'active', 'car', 'Seat', 'Leon', '1.6 TDI FR', 2017, 132000, 168000, 2, 'diesel', 'manuelle', 'citadine', 6, 4.3, NULL, 5, 'بني', 'casablanca', 'tres-bon', false, true, '2026-11-06', false, false, true, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. Seat Leon 1.6 TDI FR موديل 2017، قاطعة 132 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"شاشة تعمل باللمس","قفل مركزي","فتحة سقف","وسائد هوائية","زجاج كهربائي"}', true, false, 68, 132000, 0.2727, 4, true, NULL, NULL, 3388, 56, '2026-08-13 19:00:00+00', NULL, NULL, '2026-08-26 14:44:18.141241+00', '2026-08-26 14:44:18.141241+00'),
	('bf50e95c-37ff-429e-a07f-f475f3305d17', 'c036', 'skoda-octavia-2018-c036', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'car', 'Skoda', 'Octavia', '1.6 TDI Ambition', 2018, 114000, 189000, 3, 'diesel', 'automatique', 'berline', 6, 4.4, NULL, 5, 'أحمر', 'rabat', 'tres-bon', false, true, '2026-09-19', false, true, true, NULL, 'ملكية واحدة منذ الشراء، الوثائق كاملة وسليمة. Skoda Octavia 1.6 TDI Ambition موديل 2018، قاطعة 114 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"مقود متعدد الوظائف","نظام ABS","جنطات ألومنيوم","راديو Bluetooth","قفل مركزي","فتحة سقف","وسائد هوائية"}', true, false, 74, 147000, 0.2857, 16, false, NULL, NULL, 402, 17, '2026-08-07 22:00:00+00', NULL, NULL, '2026-08-26 14:44:18.144688+00', '2026-08-26 14:44:18.144688+00'),
	('91a91ab7-3660-4da1-8092-4e426967c1f7', 'c037', 'skoda-fabia-2017-c037', 'af266ff1-a7ab-4e04-8d29-5b4f7dc48f92', '494a2b05-dd36-4ec5-9977-e664d03a55f8', 'active', 'car', 'Skoda', 'Fabia', '1.4 TDI Active', 2017, 127000, 118000, 3, 'diesel', 'manuelle', 'citadine', 5, 3.9, NULL, 5, 'فضي', 'meknes', 'bon', false, false, '2026-09-24', false, true, false, NULL, 'الطوموبيل مزيانة بزاف، ما فيها لا صدمة لا صباغة. Skoda Fabia 1.4 TDI Active موديل 2017، قاطعة 127 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. التسليم فوري بعد إتمام الإجراءات.', '{"قفل مركزي","تكييف أوتوماتيكي","جنطات ألومنيوم","نظام ABS"}', true, false, 57, 117500, 0.0043, 10, false, NULL, NULL, 3848, 163, '2026-07-22 06:00:00+00', NULL, NULL, '2026-08-26 14:44:18.148038+00', '2026-08-26 14:44:18.148038+00'),
	('5a7d6ede-e726-469b-89cd-f4a3d6aa04dc', 'c038', 'mercedes-classe-c-2016-c038', '80f06af8-1897-4a45-a7fd-0b42d16d3a05', '3535a2d7-ed03-452b-886f-e17d182246cd', 'active', 'car', 'Mercedes', 'Classe C', '220 d Avantgarde', 2016, 148000, 322000, 1, 'diesel', 'automatique', 'berline', 9, 5.2, NULL, 4, 'أزرق ليلي', 'casablanca', 'tres-bon', true, true, '2026-09-17', true, false, false, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. Mercedes Classe C 220 d Avantgarde موديل 2016، قاطعة 148 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الثمن نهائي تقريباً، المرجو الجدية.', '{"قفل مركزي","فتحة سقف","شاشة تعمل باللمس","مقاعد جلدية","مكيف الهواء","نظام ABS","وسائد هوائية",GPS,"كاميرا الرجوع للخلف","أضواء LED"}', true, false, 79, 309000, 0.0421, 10, false, NULL, NULL, 1767, 45, '2026-08-06 07:00:00+00', NULL, NULL, '2026-08-26 14:44:18.151134+00', '2026-08-26 14:44:18.151134+00'),
	('c4c35c25-3b11-4e3a-8c88-891410365a05', 'c039', 'mercedes-classe-a-2018-c039', '89d64bb6-01a3-4c1a-b40e-3755e2be86a1', '1abf2c18-885b-4d44-aea4-6494a93412df', 'active', 'car', 'Mercedes', 'Classe A', '180 d AMG Line', 2018, 96000, 305000, 1, 'diesel', 'automatique', 'citadine', 7, 4.5, NULL, 5, 'أحمر', 'marrakech', 'excellent', true, true, '2026-12-07', false, true, false, NULL, 'مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي. Mercedes Classe A 180 d AMG Line موديل 2018، قاطعة 96 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"زجاج كهربائي","نظام ESP","مكيف الهواء","أضواء LED","فتحة سقف","جنطات ألومنيوم","قفل مركزي","راديو Bluetooth"}', true, false, 78, 337500, -0.0963, 9, true, 'featured', '2026-09-09 14:44:18.154268+00', 2726, 124, '2026-08-01 23:00:00+00', NULL, NULL, '2026-08-26 14:44:18.154268+00', '2026-08-26 14:44:18.154268+00'),
	('9ffebc7b-800c-4b19-ae17-2c1e84643811', 'c040', 'mercedes-classe-e-2014-c040', '836bbe3f-193e-435d-8aef-ca5de0fb10d0', NULL, 'active', 'car', 'Mercedes', 'Classe E', '220 CDI Executive', 2014, 214000, 285000, 2, 'diesel', 'automatique', 'berline', 10, 5.6, NULL, 4, 'بيج', 'tanger', 'bon', false, true, '2026-11-16', false, false, true, NULL, 'مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي. Mercedes Classe E 220 CDI Executive موديل 2014، قاطعة 214 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"أضواء LED","كاميرا الرجوع للخلف",GPS,"زجاج كهربائي","حساسات ركن","نظام ESP","مقاعد جلدية","مكيف الهواء","فتحة سقف","جنطات ألومنيوم","مقود متعدد الوظائف"}', true, false, 66, 197000, 0.4467, 4, false, 'featured', '2026-09-09 14:44:18.157509+00', 772, 87, '2026-08-09 22:00:00+00', NULL, NULL, '2026-08-26 14:44:18.157509+00', '2026-08-26 14:44:18.157509+00'),
	('8b6355f8-34bd-41a2-baf0-dc86892f1e0c', 'c041', 'bmw-serie-3-2016-c041', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'BMW', 'Série 3', '320d Sport Line', 2016, 154000, 288000, 2, 'diesel', 'automatique', 'berline', 9, 4.9, NULL, 4, 'فضي', 'casablanca', 'tres-bon', false, true, '2026-12-11', false, true, true, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. BMW Série 3 320d Sport Line موديل 2016، قاطعة 154 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{GPS,"زجاج كهربائي","كاميرا الرجوع للخلف","مقاعد جلدية","جنطات ألومنيوم","قفل مركزي","أضواء LED","مثبت السرعة","نظام ABS","تكييف أوتوماتيكي"}', false, false, 81, 294000, -0.0204, 8, false, NULL, NULL, 4120, 113, '2026-07-22 21:00:00+00', NULL, NULL, '2026-08-26 14:44:18.160732+00', '2026-08-26 14:44:18.160732+00'),
	('69332398-0da3-45e6-8d36-cea7ff148815', 'c042', 'bmw-x1-2017-c042', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'car', 'BMW', 'X1', 'sDrive18d xLine', 2017, 126000, 302000, 1, 'diesel', 'automatique', 'suv', 8, 5.1, NULL, 5, 'رمادي', 'rabat', 'tres-bon', true, true, '2026-11-13', false, false, true, NULL, 'ملكية واحدة منذ الشراء، الوثائق كاملة وسليمة. BMW X1 sDrive18d xLine موديل 2017، قاطعة 126 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"شاشة تعمل باللمس","راديو Bluetooth","مثبت السرعة","نظام ESP","نظام ABS","مقاعد جلدية","زجاج كهربائي","مقود متعدد الوظائف","فتحة سقف"}', false, false, 77, 303000, -0.0033, 7, true, NULL, NULL, 3763, 136, '2026-07-28 20:00:00+00', NULL, NULL, '2026-08-26 14:44:18.164044+00', '2026-08-26 14:44:18.164044+00'),
	('65203abc-a955-4d3c-b67c-85fdfe3e95a9', 'c043', 'bmw-serie-1-2015-c043', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'car', 'BMW', 'Série 1', '116d Urban', 2015, 168000, 186000, 2, 'diesel', 'manuelle', 'citadine', 6, 4.3, NULL, 5, 'أحمر', 'fes', 'bon', false, false, '2026-11-27', false, true, true, NULL, 'المركبة مصانة بزاف، الصيانة كاملة كتدار فالوكالة. BMW Série 1 116d Urban موديل 2015، قاطعة 168 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"فتحة سقف","مقود متعدد الوظائف","نظام ESP","راديو Bluetooth","نظام ABS"}', false, false, 68, 175000, 0.0629, 10, false, NULL, NULL, 2666, 126, '2026-08-04 15:00:00+00', NULL, NULL, '2026-08-26 14:44:18.167216+00', '2026-08-26 14:44:18.167216+00'),
	('27a839e1-1290-473e-a0dd-e5dd854be97a', 'c044', 'audi-a3-2017-c044', '80f06af8-1897-4a45-a7fd-0b42d16d3a05', '3535a2d7-ed03-452b-886f-e17d182246cd', 'active', 'car', 'Audi', 'A3', '2.0 TDI S line', 2017, 134000, 252000, 1, 'diesel', 'automatique', 'citadine', 8, 4.6, NULL, 5, 'رمادي', 'casablanca', 'tres-bon', true, true, '2026-09-22', true, true, true, NULL, 'للجادين فقط، الثمن قابل للنقاش الخفيف. Audi A3 2.0 TDI S line موديل 2017، قاطعة 134 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"مقاعد جلدية","قفل مركزي","نظام ESP","فتحة سقف","مثبت السرعة","حساسات ركن","شاشة تعمل باللمس",GPS,"نظام ABS","راديو Bluetooth","زجاج كهربائي"}', true, true, 90, 267000, -0.0562, 5, false, NULL, NULL, 1315, 48, '2026-08-04 10:00:00+00', NULL, NULL, '2026-08-26 14:44:18.170281+00', '2026-08-26 14:44:18.170281+00'),
	('1f2c03b6-1f7e-4f4c-ab7b-0948fb8f1c73', 'c045', 'audi-q3-2016-c045', 'd3ad54b8-e01a-4140-98a4-b714c12ec3dc', '259445a0-69da-4bab-8642-b9f29bcdbd08', 'active', 'car', 'Audi', 'Q3', '2.0 TDI quattro', 2016, 158000, 268000, 1, 'diesel', 'automatique', 'suv', 9, 5.5, NULL, 5, 'فضي', 'agadir', 'bon', true, false, '2026-11-09', false, false, true, NULL, 'بيع بسبب شراء طوموبيل جديدة، الحالة ديالها ممتازة. Audi Q3 2.0 TDI quattro موديل 2016، قاطعة 158 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"مقاعد جلدية","تكييف أوتوماتيكي","راديو Bluetooth","مقود متعدد الوظائف","مكيف الهواء","وسائد هوائية","أضواء LED","زجاج كهربائي"}', true, true, 66, 318500, -0.1586, 14, false, NULL, NULL, 224, 57, '2026-08-24 02:00:00+00', NULL, NULL, '2026-08-26 14:44:18.173637+00', '2026-08-26 14:44:18.173637+00'),
	('229772c0-f5b7-4c0d-9c52-9d923a2ac28f', 'c046', 'audi-a4-2018-c046', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'car', 'Audi', 'A4', '2.0 TDI Design', 2018, 112000, 325000, 2, 'diesel', 'automatique', 'berline', 9, 4.7, NULL, 4, 'أزرق ليلي', 'rabat', 'excellent', false, true, '2026-11-27', true, true, false, NULL, 'مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي. Audi A4 2.0 TDI Design موديل 2018، قاطعة 112 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"نظام ESP","أضواء LED",GPS,"وسائد هوائية","مقود متعدد الوظائف","مثبت السرعة","شاشة تعمل باللمس","مكيف الهواء","نظام ABS","جنطات ألومنيوم"}', true, false, 86, 358000, -0.0922, 14, false, 'urgent', '2026-09-16 14:44:18.177382+00', 989, 33, '2026-08-08 21:00:00+00', NULL, NULL, '2026-08-26 14:44:18.177382+00', '2026-08-26 14:44:18.177382+00'),
	('32c5ca5e-ef86-42f0-b071-2d76f7a5ab7f', 'c047', 'nissan-qashqai-2017-c047', '80f06af8-1897-4a45-a7fd-0b42d16d3a05', '3535a2d7-ed03-452b-886f-e17d182246cd', 'active', 'car', 'Nissan', 'Qashqai', '1.5 dCi Acenta', 2017, 122000, 212000, 3, 'diesel', 'manuelle', 'suv', 6, 4.5, NULL, 5, 'أسود', 'casablanca', 'tres-bon', false, true, '2026-10-08', false, false, false, NULL, 'للجادين فقط، الثمن قابل للنقاش الخفيف. Nissan Qashqai 1.5 dCi Acenta موديل 2017، قاطعة 122 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"حساسات ركن","فتحة سقف",GPS,"نظام ABS","مثبت السرعة"}', false, true, 55, 169000, 0.2544, 11, false, 'top', '2026-09-25 14:44:18.180739+00', 3951, 26, '2026-07-23 07:00:00+00', NULL, NULL, '2026-08-26 14:44:18.180739+00', '2026-08-26 14:44:18.180739+00'),
	('b48349e7-d5ba-4770-a375-e5485ce8a6a2', 'c048', 'nissan-micra-2016-c048', 'f6c8d3f6-bf53-4ce4-a951-15ad5084206e', '71fa13ec-2186-4ca9-b251-637d2d889caf', 'active', 'car', 'Nissan', 'Micra', '1.5 dCi Acenta', 2016, 141000, 94000, 3, 'diesel', 'manuelle', 'citadine', 5, 3.8, NULL, 5, 'بيج', 'kenitra', 'bon', false, true, '2026-10-15', false, true, false, NULL, 'المركبة مصانة بزاف، الصيانة كاملة كتدار فالوكالة. Nissan Micra 1.5 dCi Acenta موديل 2016، قاطعة 141 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"راديو Bluetooth","مقود متعدد الوظائف","جنطات ألومنيوم","مثبت السرعة","حساسات ركن","مكيف الهواء"}', true, true, 64, 109000, -0.1376, 4, false, NULL, NULL, 1875, 136, '2026-08-01 23:00:00+00', NULL, NULL, '2026-08-26 14:44:18.184211+00', '2026-08-26 14:44:18.184211+00'),
	('f8124c57-0e7f-4150-8951-ef9a80508002', 'c049', 'opel-corsa-2017-c049', 'cb5306a2-0159-4c0e-a113-f8f766cc3bf9', NULL, 'active', 'car', 'Opel', 'Corsa', '1.3 CDTi Enjoy', 2017, 116000, 109000, 1, 'diesel', 'manuelle', 'citadine', 5, 3.9, NULL, 5, 'أسود', 'mohammedia', 'bon', true, true, '2026-11-21', false, true, true, NULL, 'بيع بسبب شراء طوموبيل جديدة، الحالة ديالها ممتازة. Opel Corsa 1.3 CDTi Enjoy موديل 2017، قاطعة 116 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"كاميرا الرجوع للخلف","مقاعد جلدية","مثبت السرعة"}', true, false, 79, 119000, -0.0840, 10, false, 'urgent', '2026-09-16 14:44:18.18851+00', 1649, 83, '2026-08-04 08:00:00+00', NULL, NULL, '2026-08-26 14:44:18.18851+00', '2026-08-26 14:44:18.18851+00'),
	('4abe0921-b16c-46b4-b970-275261f6d0fb', 'c050', 'jeep-compass-2019-c050', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Jeep', 'Compass', '1.6 MultiJet Limited', 2019, 89000, 292000, 2, 'diesel', 'manuelle', 'suv', 7, 5.0, NULL, 5, 'بني', 'casablanca', 'excellent', false, true, '2026-11-18', false, true, true, NULL, 'ملكية واحدة منذ الشراء، الوثائق كاملة وسليمة. Jeep Compass 1.6 MultiJet Limited موديل 2019، قاطعة 89 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. التسليم فوري بعد إتمام الإجراءات.', '{"شاشة تعمل باللمس","كاميرا الرجوع للخلف","نظام ESP","مقاعد جلدية","زجاج كهربائي",GPS,"جنطات ألومنيوم","حساسات ركن","مثبت السرعة"}', true, false, 80, 249500, 0.1703, 16, false, 'top', '2026-09-25 14:44:18.192599+00', 3815, 19, '2026-08-12 15:00:00+00', NULL, NULL, '2026-08-26 14:44:18.192599+00', '2026-08-26 14:44:18.192599+00');
INSERT INTO public.listings VALUES
	('e098952f-09b4-480a-8e7c-7f4eba6d847d', 'c051', 'land-rover-range-rover-evoque-2015-c051', '89d64bb6-01a3-4c1a-b40e-3755e2be86a1', '1abf2c18-885b-4d44-aea4-6494a93412df', 'active', 'car', 'Land Rover', 'Range Rover Evoque', '2.0 eD4 Pure', 2015, 162000, 378000, 3, 'diesel', 'automatique', 'suv', 9, 5.9, NULL, 5, 'رمادي', 'marrakech', 'bon', false, false, '2026-09-13', false, true, true, NULL, 'المركبة مصانة بزاف، الصيانة كاملة كتدار فالوكالة. Land Rover Range Rover Evoque 2.0 eD4 Pure موديل 2015، قاطعة 162 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"زجاج كهربائي","نظام ABS","كاميرا الرجوع للخلف","جنطات ألومنيوم","وسائد هوائية","مكيف الهواء","نظام ESP","مثبت السرعة","حساسات ركن","قفل مركزي"}', true, true, 67, 245500, 0.5397, 10, false, NULL, NULL, 2029, 178, '2026-08-20 06:00:00+00', NULL, NULL, '2026-08-26 14:44:18.19702+00', '2026-08-26 14:44:18.19702+00'),
	('36c42e43-6a01-465e-ba55-bdc1cc38bb79', 'c052', 'suzuki-swift-2018-c052', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'car', 'Suzuki', 'Swift', '1.2 Essence GL', 2018, 87000, 121000, 2, 'essence', 'manuelle', 'citadine', 5, 5.1, NULL, 5, 'أبيض', 'tetouan', 'tres-bon', false, true, '2026-10-11', true, true, true, NULL, 'مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي. Suzuki Swift 1.2 Essence GL موديل 2018، قاطعة 87 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"حساسات ركن","نظام ABS","زجاج كهربائي","تكييف أوتوماتيكي","مقاعد جلدية","فتحة سقف","مكيف الهواء"}', true, false, 86, 113500, 0.0661, 8, false, NULL, NULL, 4053, 136, '2026-08-22 20:00:00+00', NULL, NULL, '2026-08-26 14:44:18.20068+00', '2026-08-26 14:44:18.20068+00'),
	('eb9a3d16-273e-4762-8818-691bdc6fe889', 'c053', 'chevrolet-spark-2014-c053', 'd4b28e5b-0c52-4fdd-a238-bf58af0b4ec2', '326aa189-4b6f-469e-b170-305be968d099', 'active', 'car', 'Chevrolet', 'Spark', '1.0 Essence LS', 2014, 158000, 63000, 3, 'essence', 'manuelle', 'citadine', 4, 5.4, NULL, 5, 'أحمر', 'oujda', 'moyen', false, true, '2026-12-18', false, true, true, NULL, 'صيانة منتظمة، الزيت والفلاتر مغيّرين من قريب. Chevrolet Spark 1.0 Essence LS موديل 2014، قاطعة 158 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"مكيف الهواء","قفل مركزي","كاميرا الرجوع للخلف","نظام ESP","جنطات ألومنيوم","مثبت السرعة"}', true, false, 70, 59000, 0.0678, 7, false, NULL, NULL, 2274, 117, '2026-07-31 02:00:00+00', NULL, NULL, '2026-08-26 14:44:18.203889+00', '2026-08-26 14:44:18.203889+00'),
	('1f91c0ec-eda3-42f3-a253-be54d99e94e9', 'c054', 'mitsubishi-l200-2017-c054', '0c5136df-b8f8-4b46-a4dc-3b0ca147f4a0', '0eed6c78-7442-4274-a049-1eff4cc0588d', 'active', 'car', 'Mitsubishi', 'L200', '2.4 DI-D 4x4 Intense', 2017, 168000, 256000, 3, 'diesel', 'manuelle', 'utilitaire', 9, 7.2, NULL, 4, 'رمادي', 'laayoune', 'bon', false, true, '2026-10-09', false, true, true, NULL, 'بيع بسبب شراء طوموبيل جديدة، الحالة ديالها ممتازة. Mitsubishi L200 2.4 DI-D 4x4 Intense موديل 2017، قاطعة 168 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"وسائد هوائية","راديو Bluetooth","حساسات ركن","مقود متعدد الوظائف","فتحة سقف","جنطات ألومنيوم","مثبت السرعة","تكييف أوتوماتيكي","زجاج كهربائي","كاميرا الرجوع للخلف","مكيف الهواء"}', true, false, 76, 217500, 0.1770, 12, false, 'urgent', '2026-09-16 14:44:18.207134+00', 532, 4, '2026-07-23 03:00:00+00', NULL, NULL, '2026-08-26 14:44:18.207134+00', '2026-08-26 14:44:18.207134+00'),
	('a4762a15-61c7-49fb-8bea-0c0e06fe6a7e', 'c055', 'tesla-model-3-2021-c055', 'af266ff1-a7ab-4e04-8d29-5b4f7dc48f92', '494a2b05-dd36-4ec5-9977-e664d03a55f8', 'active', 'car', 'Tesla', 'Model 3', 'Standard Range Plus', 2021, 54000, 468000, 1, 'electrique', 'automatique', 'berline', 8, 15.5, NULL, 4, 'أبيض', 'casablanca', 'excellent', true, true, '2026-11-14', false, true, true, NULL, 'المركبة مصانة بزاف، الصيانة كاملة كتدار فالوكالة. Tesla Model 3 Standard Range Plus موديل 2021، قاطعة 54 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"كاميرا الرجوع للخلف",GPS,"فتحة سقف","تكييف أوتوماتيكي","نظام ABS","جنطات ألومنيوم","أضواء LED","مكيف الهواء","زجاج كهربائي","حساسات ركن"}', true, false, 84, 459500, 0.0185, 13, false, NULL, NULL, 1153, 96, '2026-07-28 19:00:00+00', NULL, NULL, '2026-08-26 14:44:18.210662+00', '2026-08-26 14:44:18.210662+00'),
	('7db9d656-c7e9-4279-ad30-49eae513bcb7', 'c056', 'toyota-yaris-2020-c056', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'car', 'Toyota', 'Yaris', '1.5 Hybride Dynamic', 2020, 62000, 192000, 2, 'hybride', 'automatique', 'citadine', 5, 3.6, NULL, 5, 'فضي', 'rabat', 'excellent', false, true, '2026-10-16', false, true, false, NULL, 'صيانة منتظمة، الزيت والفلاتر مغيّرين من قريب. Toyota Yaris 1.5 Hybride Dynamic موديل 2020، قاطعة 62 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"مثبت السرعة","جنطات ألومنيوم","كاميرا الرجوع للخلف",GPS,"مكيف الهواء"}', true, false, 68, 212000, -0.0943, 10, false, 'urgent', '2026-09-16 14:44:18.214617+00', 2417, 153, '2026-08-19 05:00:00+00', NULL, NULL, '2026-08-26 14:44:18.214617+00', '2026-08-26 14:44:18.214617+00'),
	('fef87298-562e-4aa8-9ce0-d3b8675e51a8', 'c057', 'dacia-logan-2021-c057', 'f6c8d3f6-bf53-4ce4-a951-15ad5084206e', '71fa13ec-2186-4ca9-b251-637d2d889caf', 'active', 'car', 'Dacia', 'Logan', '1.0 SCe Essentiel', 2021, 46000, 128000, 1, 'essence', 'manuelle', 'berline', 5, 5.6, NULL, 4, 'بني', 'beni-mellal', 'excellent', true, true, '2026-10-18', false, false, false, NULL, 'صيانة منتظمة، الزيت والفلاتر مغيّرين من قريب. Dacia Logan 1.0 SCe Essentiel موديل 2021، قاطعة 46 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. التسليم فوري بعد إتمام الإجراءات.', '{"مثبت السرعة","راديو Bluetooth","نظام ESP","قفل مركزي","زجاج كهربائي","تكييف أوتوماتيكي"}', true, false, 68, 175500, -0.2707, 15, true, NULL, NULL, 1598, 60, '2026-08-04 00:00:00+00', NULL, NULL, '2026-08-26 14:44:18.218066+00', '2026-08-26 14:44:18.218066+00'),
	('d1a5b2b8-20c6-48e7-ba73-32942a6013f2', 'c058', 'peugeot-208-2021-c058', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Peugeot', '208', '1.2 PureTech Allure', 2021, 41000, 178000, 2, 'essence', 'automatique', 'citadine', 6, 5.3, NULL, 5, 'رمادي', 'casablanca', 'excellent', false, true, '2026-11-20', true, true, false, NULL, 'صيانة منتظمة، الزيت والفلاتر مغيّرين من قريب. Peugeot 208 1.2 PureTech Allure موديل 2021، قاطعة 41 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"تكييف أوتوماتيكي","كاميرا الرجوع للخلف","جنطات ألومنيوم","حساسات ركن","مثبت السرعة","فتحة سقف"}', true, false, 77, 225500, -0.2106, 6, false, NULL, NULL, 3761, 95, '2026-07-24 10:00:00+00', NULL, NULL, '2026-08-26 14:44:18.221116+00', '2026-08-26 14:44:18.221116+00'),
	('dce2796d-5995-4087-b40f-b9015c32052c', 'c059', 'volkswagen-golf-8-2021-c059', 'f6c8d3f6-bf53-4ce4-a951-15ad5084206e', '71fa13ec-2186-4ca9-b251-637d2d889caf', 'active', 'car', 'Volkswagen', 'Golf 8', '2.0 TDI Life', 2021, 58000, 285000, 2, 'diesel', 'automatique', 'citadine', 7, 4.2, NULL, 5, 'رمادي', 'tanger', 'excellent', false, true, '2026-12-19', false, true, true, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. Volkswagen Golf 8 2.0 TDI Life موديل 2021، قاطعة 58 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"حساسات ركن","راديو Bluetooth","أضواء LED","مكيف الهواء","مثبت السرعة","زجاج كهربائي","مقود متعدد الوظائف","كاميرا الرجوع للخلف"}', false, true, 77, 272500, 0.0459, 15, false, NULL, NULL, 4099, 157, '2026-08-12 09:00:00+00', NULL, NULL, '2026-08-26 14:44:18.22402+00', '2026-08-26 14:44:18.22402+00'),
	('a4523f41-20a6-4b00-ac7b-dafd3f9c0066', 'c060', 'hyundai-i20-2019-c060', 'cb5306a2-0159-4c0e-a113-f8f766cc3bf9', NULL, 'active', 'car', 'Hyundai', 'i20', '1.4 CRDi Intuitive', 2019, 78000, 129000, 3, 'diesel', 'manuelle', 'citadine', 5, 4.0, NULL, 5, 'أحمر', 'safi', 'tres-bon', false, false, '2026-12-14', false, false, false, NULL, 'للجادين فقط، الثمن قابل للنقاش الخفيف. Hyundai i20 1.4 CRDi Intuitive موديل 2019، قاطعة 78 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. نقبل الفحص عند أي كراج ديال اختيارك.', '{"مقاعد جلدية","وسائد هوائية","جنطات ألومنيوم","زجاج كهربائي","فتحة سقف","راديو Bluetooth","قفل مركزي"}', true, true, 60, 149000, -0.1342, 12, true, NULL, NULL, 1541, 5, '2026-08-01 21:00:00+00', NULL, NULL, '2026-08-26 14:44:18.227432+00', '2026-08-26 14:44:18.227432+00'),
	('6b4349d8-8f47-4cb2-9c53-a6a06e5e1981', 'm001', 'yamaha-mt-07-2019-m001', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'moto', 'Yamaha', 'MT-07', 'ABS', 2019, 24000, 79000, 3, 'essence', 'manuelle', 'roadster', 8, 4.3, 689, NULL, 'أبيض', 'casablanca', 'tres-bon', false, true, '2026-12-05', false, true, false, NULL, 'المحرك نظيف والصيانة كاملة موثقة بالفواتير. Yamaha MT-07 ABS موديل 2019، قاطعة 24 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. التسليم فوري بعد إتمام الإجراءات.', '{"زجاج أمامي عالٍ","إطارات جديدة","درع واقي للمحرك","عادم رياضي","حقائب جانبية"}', true, true, 68, 83000, -0.0482, 9, true, NULL, NULL, 222, 175, '2026-08-14 07:00:00+00', NULL, NULL, '2026-08-26 14:44:18.230501+00', '2026-08-26 14:44:18.230501+00'),
	('2cce2757-2f51-4f6f-b064-7e09102e5ba3', 'm002', 'yamaha-tracer-700-2020-m002', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'moto', 'Yamaha', 'Tracer 700', 'GT', 2020, 19000, 96000, 1, 'essence', 'manuelle', 'trail', 8, 4.5, 689, NULL, 'أزرق', 'rabat', 'excellent', true, true, '2026-12-05', false, true, true, NULL, 'الموطور فحالة زوينة، خدمة بلا مشاكل. Yamaha Tracer 700 GT موديل 2020، قاطعة 19 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"زجاج أمامي عالٍ","شاحن USB","لوحة عدادات رقمية","وضعيات قيادة متعددة","نظام تحكم في الجر"}', true, false, 82, 122000, -0.2131, 15, true, NULL, NULL, 2486, 126, '2026-08-10 04:00:00+00', NULL, NULL, '2026-08-26 14:44:18.233195+00', '2026-08-26 14:44:18.233195+00'),
	('2f0ee47b-c80a-4dab-b8f6-fa4e214ada11', 'm003', 'honda-cb500x-2019-m003', '89d64bb6-01a3-4c1a-b40e-3755e2be86a1', '1abf2c18-885b-4d44-aea4-6494a93412df', 'active', 'moto', 'Honda', 'CB500X', 'ABS', 2019, 28000, 73000, 2, 'essence', 'manuelle', 'trail', 6, 3.6, 471, NULL, 'رمادي', 'marrakech', 'tres-bon', false, true, '2026-11-09', false, true, true, NULL, 'بيع بسبب السفر، الموطور ماشي فيه حتى شي طبة. Honda CB500X ABS موديل 2019، قاطعة 28 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"حقائب جانبية","درع واقي للمحرك","نظام ABS"}', true, false, 75, 74000, -0.0135, 10, false, 'urgent', '2026-09-16 14:44:18.236589+00', 1737, 87, '2026-08-21 05:00:00+00', NULL, NULL, '2026-08-26 14:44:18.236589+00', '2026-08-26 14:44:18.236589+00'),
	('4df78941-de61-4c53-9966-b3b8db9c72fb', 'm004', 'honda-pcx-125-2021-m004', 'af266ff1-a7ab-4e04-8d29-5b4f7dc48f92', '494a2b05-dd36-4ec5-9977-e664d03a55f8', 'active', 'moto', 'Honda', 'PCX 125', 'ABS', 2021, 14000, 33000, 2, 'essence', 'automatique', 'scooter', 2, 2.3, 125, NULL, 'برتقالي', 'casablanca', 'excellent', false, true, '2026-10-09', false, true, false, NULL, 'صيانة مضبوطة عند الوكيل المعتمد، الوثائق كاملة. Honda PCX 125 ABS موديل 2021، قاطعة 14 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. التسليم فوري بعد إتمام الإجراءات.', '{"وضعيات قيادة متعددة","أضواء LED","إطارات جديدة"}', true, false, 73, 33000, 0.0000, 16, false, 'top', '2026-09-25 14:44:18.23932+00', 971, 95, '2026-08-16 20:00:00+00', NULL, NULL, '2026-08-26 14:44:18.23932+00', '2026-08-26 14:44:18.23932+00'),
	('e212e106-70a3-46d1-a518-b977fb3e7b4d', 'm005', 'ktm-duke-390-2020-m005', 'f6c8d3f6-bf53-4ce4-a951-15ad5084206e', '71fa13ec-2186-4ca9-b251-637d2d889caf', 'active', 'moto', 'KTM', 'Duke 390', 'ABS', 2020, 17000, 62000, 3, 'essence', 'manuelle', 'roadster', 5, 3.3, 373, NULL, 'أزرق', 'tanger', 'tres-bon', false, true, '2026-11-08', false, true, true, NULL, 'الموطور فحالة زوينة، خدمة بلا مشاكل. KTM Duke 390 ABS موديل 2020، قاطعة 17 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"زجاج أمامي عالٍ","أضواء LED","نظام ABS","مقبض مسخّن","إطارات جديدة","عادم رياضي"}', true, false, 72, 83500, -0.2575, 8, false, 'featured', '2026-09-09 14:44:18.242149+00', 3258, 124, '2026-08-24 01:00:00+00', NULL, NULL, '2026-08-26 14:44:18.242149+00', '2026-08-26 14:44:18.242149+00'),
	('03c3a97a-74d0-4095-b1ce-24a40db6589a', 'm006', 'royal-enfield-classic-500-2018-m006', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'moto', 'Royal Enfield', 'Classic 500', 'EFI', 2018, 21000, 47000, 3, 'essence', 'manuelle', 'custom', 5, 3.5, 499, NULL, 'برتقالي', 'rabat', 'bon', false, true, '2026-11-25', false, true, true, NULL, 'المحرك نظيف والصيانة كاملة موثقة بالفواتير. Royal Enfield Classic 500 EFI موديل 2018، قاطعة 21 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"نظام ABS","نظام تحكم في الجر","زجاج أمامي عالٍ","مقبض مسخّن"}', true, true, 72, 31000, 0.5161, 7, false, NULL, NULL, 1979, 77, '2026-08-19 05:00:00+00', NULL, NULL, '2026-08-26 14:44:18.245017+00', '2026-08-26 14:44:18.245017+00'),
	('cc2bf24c-72af-4f2f-98b3-96ab1ee9d496', 'm007', 'kawasaki-z650-2019-m007', 'd9e8ba57-f704-4b4f-8d15-87798fcaa33b', NULL, 'active', 'moto', 'Kawasaki', 'Z650', 'ABS', 2019, 22000, 71000, 3, 'essence', 'manuelle', 'roadster', 7, 4.1, 649, NULL, 'أبيض', 'agadir', 'tres-bon', false, true, '2026-09-16', false, true, false, NULL, 'صيانة مضبوطة عند الوكيل المعتمد، الوثائق كاملة. Kawasaki Z650 ABS موديل 2019، قاطعة 22 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"درع واقي للمحرك","لوحة عدادات رقمية","زجاج أمامي عالٍ"}', false, false, 58, 76000, -0.0658, 14, false, 'featured', '2026-09-09 14:44:18.247849+00', 4190, 15, '2026-08-05 10:00:00+00', NULL, NULL, '2026-08-26 14:44:18.247849+00', '2026-08-26 14:44:18.247849+00'),
	('75afa67f-14c6-4960-bf9c-75ef86c78ccc', 'm008', 'bmw-r-1200-gs-2015-m008', '80f06af8-1897-4a45-a7fd-0b42d16d3a05', '3535a2d7-ed03-452b-886f-e17d182246cd', 'active', 'moto', 'BMW', 'R 1200 GS', 'Adventure', 2015, 62000, 132000, 3, 'essence', 'manuelle', 'trail', 11, 5.2, 1170, NULL, 'برتقالي', 'casablanca', 'bon', false, true, '2026-09-24', true, false, false, NULL, 'صيانة مضبوطة عند الوكيل المعتمد، الوثائق كاملة. BMW R 1200 GS Adventure موديل 2015، قاطعة 62 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"عادم رياضي","درع واقي للمحرك","نظام تحكم في الجر","أضواء LED","لوحة عدادات رقمية","حقائب جانبية"}', true, false, 70, 103500, 0.2754, 10, false, NULL, NULL, 1739, 112, '2026-07-20 18:00:00+00', NULL, NULL, '2026-08-26 14:44:18.250562+00', '2026-08-26 14:44:18.250562+00'),
	('17379b0a-185a-4fd5-b56c-e021381b6ebb', 'm009', 'suzuki-gsx-r-600-2016-m009', '6573e2ba-2d03-492a-9495-345dc461d080', NULL, 'active', 'moto', 'Suzuki', 'GSX-R 600', 'L6', 2016, 34000, 74000, 3, 'essence', 'manuelle', 'sportive', 9, 5.8, 599, NULL, 'أسود مطفي', 'fes', 'bon', false, true, '2026-11-14', false, true, true, NULL, 'مستعملة فالويكاند فقط، البنو والإطارات فحالة ممتازة. Suzuki GSX-R 600 L6 موديل 2016، قاطعة 34 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"زجاج أمامي عالٍ","عادم رياضي","شاحن USB","إطارات جديدة"}', false, true, 63, 84500, -0.1243, 5, false, NULL, NULL, 3914, 20, '2026-08-23 01:00:00+00', NULL, NULL, '2026-08-26 14:44:18.253089+00', '2026-08-26 14:44:18.253089+00'),
	('e27c5eac-9c72-4b3b-a3a3-4f16baf80e78', 'm010', 'vespa-primavera-125-2020-m010', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'moto', 'Vespa', 'Primavera 125', 'iGet', 2020, 11000, 39000, 2, 'essence', 'automatique', 'scooter', 2, 2.4, 125, NULL, 'أزرق', 'rabat', 'excellent', false, true, '2026-10-10', false, true, false, NULL, 'بيع بسبب السفر، الموطور ماشي فيه حتى شي طبة. Vespa Primavera 125 iGet موديل 2020، قاطعة 11 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"نظام تحكم في الجر","أضواء LED","درع واقي للمحرك","لوحة عدادات رقمية","إطارات جديدة"}', false, false, 65, 28500, 0.3684, 10, true, NULL, NULL, 2065, 105, '2026-07-20 20:00:00+00', NULL, NULL, '2026-08-26 14:44:18.255775+00', '2026-08-26 14:44:18.255775+00'),
	('8559490e-ad12-4692-aea2-993f913b3406', 'm011', 'sym-symphony-125-2021-m011', '80f06af8-1897-4a45-a7fd-0b42d16d3a05', '3535a2d7-ed03-452b-886f-e17d182246cd', 'active', 'moto', 'SYM', 'Symphony 125', 'ST', 2021, 16000, 18500, 3, 'essence', 'automatique', 'scooter', 2, 2.6, 125, NULL, 'أحمر', 'casablanca', 'tres-bon', false, true, '2026-09-26', false, false, false, NULL, 'بيع بسبب السفر، الموطور ماشي فيه حتى شي طبة. SYM Symphony 125 ST موديل 2021، قاطعة 16 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. نقبل الفحص عند أي كراج ديال اختيارك.', '{"وضعيات قيادة متعددة","مقبض مسخّن","درع واقي للمحرك","إطارات جديدة","نظام ABS","نظام تحكم في الجر"}', true, false, 55, 15500, 0.1935, 11, false, NULL, NULL, 1287, 169, '2026-07-22 17:00:00+00', NULL, NULL, '2026-08-26 14:44:18.258276+00', '2026-08-26 14:44:18.258276+00'),
	('df6bf2e1-69b8-4e97-a7f1-7840d50bcaa8', 'm012', 'peugeot-kisbee-2020-m012', 'd9e8ba57-f704-4b4f-8d15-87798fcaa33b', NULL, 'active', 'moto', 'Peugeot', 'Kisbee', '50 4T', 2020, 12000, 9200, 2, 'essence', 'automatique', 'scooter', 1, 2.1, 50, NULL, 'برتقالي', 'meknes', 'bon', false, true, '2026-11-19', true, true, true, NULL, 'مستعملة فالويكاند فقط، البنو والإطارات فحالة ممتازة. Peugeot Kisbee 50 4T موديل 2020، قاطعة 12 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"عادم رياضي","زجاج أمامي عالٍ","أضواء LED"}', true, true, 70, 16500, -0.4424, 9, false, NULL, NULL, 3272, 67, '2026-08-05 17:00:00+00', NULL, NULL, '2026-08-26 14:44:18.26096+00', '2026-08-26 14:44:18.26096+00'),
	('5250e406-08c3-47e7-b18b-0bf9133b80bf', 'm013', 'mbk-booster-2018-m013', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'moto', 'MBK', 'Booster', 'Naked', 2018, 19000, 8600, 2, 'essence', 'automatique', 'scooter', 1, 2.8, 50, NULL, 'أزرق', 'sale', 'moyen', false, false, '2026-11-07', true, true, false, NULL, 'المحرك نظيف والصيانة كاملة موثقة بالفواتير. MBK Booster Naked موديل 2018، قاطعة 19 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"شاحن USB","عادم رياضي","مقبض مسخّن"}', false, true, 67, 7000, 0.2286, 10, false, NULL, NULL, 1692, 121, '2026-08-01 06:00:00+00', NULL, NULL, '2026-08-26 14:44:18.263563+00', '2026-08-26 14:44:18.263563+00'),
	('d04cf05b-1942-45cd-9e9d-ca0009378b35', 'm014', 'docker-star-2021-m014', '89d64bb6-01a3-4c1a-b40e-3755e2be86a1', '1abf2c18-885b-4d44-aea4-6494a93412df', 'active', 'moto', 'Docker', 'Star', '125', 2021, 23000, 12000, 3, 'essence', 'manuelle', 'roadster', 2, 2.5, 125, NULL, 'أبيض', 'khouribga', 'bon', false, true, '2026-10-05', false, false, true, NULL, 'صيانة مضبوطة عند الوكيل المعتمد، الوثائق كاملة. Docker Star 125 موديل 2021، قاطعة 23 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. نقبل الفحص عند أي كراج ديال اختيارك.', '{"لوحة عدادات رقمية","وضعيات قيادة متعددة","عادم رياضي","حقائب جانبية","درع واقي للمحرك"}', true, false, 68, 13500, -0.1111, 13, false, NULL, NULL, 2566, 56, '2026-08-14 07:00:00+00', NULL, NULL, '2026-08-26 14:44:18.266668+00', '2026-08-26 14:44:18.266668+00'),
	('970b880f-bd1f-4498-a795-ea5601b3b298', 'm015', 'bajaj-boxer-2020-m015', '836bbe3f-193e-435d-8aef-ca5de0fb10d0', NULL, 'active', 'moto', 'Bajaj', 'Boxer', '150 BM', 2020, 31000, 14000, 2, 'essence', 'manuelle', 'roadster', 2, 2.4, 150, NULL, 'أسود مطفي', 'el-jadida', 'bon', false, true, '2026-10-08', false, true, true, NULL, 'مستعملة فالويكاند فقط، البنو والإطارات فحالة ممتازة. Bajaj Boxer 150 BM موديل 2020، قاطعة 31 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"نظام تحكم في الجر","نظام ABS","زجاج أمامي عالٍ","درع واقي للمحرك","حقائب جانبية"}', false, false, 76, 14000, 0.0000, 9, false, NULL, NULL, 681, 125, '2026-08-15 02:00:00+00', NULL, NULL, '2026-08-26 14:44:18.270844+00', '2026-08-26 14:44:18.270844+00'),
	('f747262e-ff1f-408a-8926-f9f3e8d62684', 'm016', 'haojue-dk-150-2021-m016', 'bf252bb9-478a-49a3-a9e6-fb52fed144aa', NULL, 'active', 'moto', 'Haojue', 'DK 150', 'HJ150', 2021, 18000, 13500, 3, 'essence', 'manuelle', 'roadster', 2, 2.5, 150, NULL, 'أزرق', 'nador', 'tres-bon', false, false, '2026-09-17', false, true, true, NULL, 'بيع بسبب السفر، الموطور ماشي فيه حتى شي طبة. Haojue DK 150 HJ150 موديل 2021، قاطعة 18 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"حقائب جانبية","وضعيات قيادة متعددة","نظام تحكم في الجر","لوحة عدادات رقمية","درع واقي للمحرك","أضواء LED"}', true, true, 59, 17000, -0.2059, 12, false, 'urgent', '2026-09-16 14:44:18.274181+00', 3405, 4, '2026-07-31 17:00:00+00', NULL, NULL, '2026-08-26 14:44:18.274181+00', '2026-08-26 14:44:18.274181+00'),
	('4a00dbf3-a6d2-497d-a6a1-8e3898342c8c', 'm017', 'yamaha-aerox-2022-m017', '80f06af8-1897-4a45-a7fd-0b42d16d3a05', '3535a2d7-ed03-452b-886f-e17d182246cd', 'active', 'moto', 'Yamaha', 'Aerox', '155 VVA', 2022, 9000, 34000, 2, 'essence', 'automatique', 'scooter', 2, 2.5, 155, NULL, 'أزرق', 'casablanca', 'excellent', false, true, '2026-11-09', true, true, true, NULL, 'المحرك نظيف والصيانة كاملة موثقة بالفواتير. Yamaha Aerox 155 VVA موديل 2022، قاطعة 9 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"أضواء LED","شاحن USB","درع واقي للمحرك","إطارات جديدة","زجاج أمامي عالٍ"}', true, false, 75, 42500, -0.2000, 4, false, NULL, NULL, 1130, 164, '2026-07-20 18:00:00+00', NULL, NULL, '2026-08-26 14:44:18.277941+00', '2026-08-26 14:44:18.277941+00'),
	('fc3c9c14-3cf4-4417-8a37-2dbfb03929f3', 'm018', 'honda-africa-twin-2018-m018', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'moto', 'Honda', 'Africa Twin', 'CRF1000L DCT', 2018, 46000, 148000, 1, 'essence', 'automatique', 'trail', 11, 5.0, 998, NULL, 'برتقالي', 'marrakech', 'tres-bon', true, true, '2026-11-15', true, false, true, NULL, 'الموطور فحالة زوينة، خدمة بلا مشاكل. Honda Africa Twin CRF1000L DCT موديل 2018، قاطعة 46 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. التسليم فوري بعد إتمام الإجراءات.', '{"أضواء LED","إطارات جديدة","مقبض مسخّن","درع واقي للمحرك","نظام ABS","شاحن USB","نظام تحكم في الجر"}', true, true, 80, 94500, 0.5661, 16, false, NULL, NULL, 2042, 50, '2026-07-27 09:00:00+00', NULL, NULL, '2026-08-26 14:44:18.282395+00', '2026-08-26 14:44:18.282395+00'),
	('f2d7ae0e-5341-4532-bbfd-1ff573f27b14', 'm019', 'harley-davidson-iron-883-2017-m019', 'af266ff1-a7ab-4e04-8d29-5b4f7dc48f92', '494a2b05-dd36-4ec5-9977-e664d03a55f8', 'active', 'moto', 'Harley-Davidson', 'Iron 883', 'Sportster', 2017, 27000, 106000, 1, 'essence', 'manuelle', 'custom', 9, 4.9, 883, NULL, 'أزرق', 'casablanca', 'tres-bon', true, true, '2026-10-17', false, false, true, NULL, 'المحرك نظيف والصيانة كاملة موثقة بالفواتير. Harley-Davidson Iron 883 Sportster موديل 2017، قاطعة 27 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"لوحة عدادات رقمية","عادم رياضي","حقائب جانبية","زجاج أمامي عالٍ"}', true, true, 63, 85500, 0.2398, 4, false, NULL, NULL, 1739, 3, '2026-07-29 00:00:00+00', NULL, NULL, '2026-08-26 14:44:18.285856+00', '2026-08-26 14:44:18.285856+00'),
	('a24873b6-2b78-4192-aa5f-268748a1485b', 'm020', 'benelli-trk-502-2021-m020', 'd6a86d41-9d4b-485a-a7c5-da03025be811', '4ed26878-0cac-454f-906c-3e9987f8465f', 'active', 'moto', 'Benelli', 'TRK 502', 'X', 2021, 15000, 63000, 2, 'essence', 'manuelle', 'trail', 6, 4.4, 500, NULL, 'رمادي', 'tetouan', 'excellent', false, true, '2026-10-07', true, true, false, NULL, 'المحرك نظيف والصيانة كاملة موثقة بالفواتير. Benelli TRK 502 X موديل 2021، قاطعة 15 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"إطارات جديدة","نظام ABS","مقبض مسخّن"}', true, false, 77, 105000, -0.4000, 5, false, 'top', '2026-09-25 14:44:18.288601+00', 260, 71, '2026-08-02 16:00:00+00', NULL, NULL, '2026-08-26 14:44:18.288601+00', '2026-08-26 14:44:18.288601+00'),
	('cf10b172-6434-413d-a023-7274cbde364f', 'm021', 'yamaha-nmax-2021-m021', 'd3ad54b8-e01a-4140-98a4-b714c12ec3dc', '259445a0-69da-4bab-8642-b9f29bcdbd08', 'active', 'moto', 'Yamaha', 'NMAX', '155 ABS', 2021, 13000, 36000, 3, 'essence', 'automatique', 'scooter', 2, 2.4, 155, NULL, 'رمادي', 'agadir', 'tres-bon', false, false, '2026-11-22', true, false, false, NULL, 'الموطور فحالة زوينة، خدمة بلا مشاكل. Yamaha NMAX 155 ABS موديل 2021، قاطعة 13 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. التسليم فوري بعد إتمام الإجراءات.', '{"نظام ABS","مقبض مسخّن","نظام تحكم في الجر","لوحة عدادات رقمية","عادم رياضي"}', false, false, 54, 31500, 0.1429, 6, false, NULL, NULL, 1404, 32, '2026-08-18 01:00:00+00', NULL, NULL, '2026-08-26 14:44:18.291195+00', '2026-08-26 14:44:18.291195+00'),
	('0bb37c12-4cc8-41c5-a328-db3e11bca49a', 'm022', 'ktm-790-adventure-2020-m022', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'moto', 'KTM', '790 Adventure', 'R', 2020, 25000, 118000, 1, 'essence', 'manuelle', 'trail', 10, 4.8, 799, NULL, 'برتقالي', 'rabat', 'tres-bon', true, true, '2026-09-14', false, false, true, NULL, 'بيع بسبب السفر، الموطور ماشي فيه حتى شي طبة. KTM 790 Adventure R موديل 2020، قاطعة 25 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"نظام تحكم في الجر","درع واقي للمحرك","زجاج أمامي عالٍ"}', true, false, 74, 156500, -0.2460, 11, true, NULL, NULL, 3381, 173, '2026-08-24 10:00:00+00', NULL, NULL, '2026-08-26 14:44:18.294345+00', '2026-08-26 14:44:18.294345+00'),
	('29f395c6-a69a-4e25-8e07-3dca3c681d8e', 'c061', 'ford-ranger-2018-c061', 'bf252bb9-478a-49a3-a9e6-fb52fed144aa', NULL, 'active', 'car', 'Ford', 'Ranger', '2.2 TDCi 4x4 XLT', 2018, 148000, 312000, 1, 'diesel', 'manuelle', 'utilitaire', 9, 7.4, NULL, 4, 'أحمر', 'agadir', 'bon', true, true, '2026-12-08', false, true, true, NULL, 'مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي. Ford Ranger 2.2 TDCi 4x4 XLT موديل 2018، قاطعة 148 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"مقود متعدد الوظائف","مثبت السرعة","كاميرا الرجوع للخلف","تكييف أوتوماتيكي","قفل مركزي",GPS,"نظام ESP","وسائد هوائية"}', true, true, 70, 229000, 0.3624, 7, true, NULL, NULL, 3736, 31, '2026-07-27 09:00:00+00', NULL, NULL, '2026-08-26 14:44:18.298026+00', '2026-08-26 14:44:18.298026+00'),
	('e1d47f16-f460-47cd-95de-3735374e6f98', 'c062', 'isuzu-d-max-2019-c062', 'f6c8d3f6-bf53-4ce4-a951-15ad5084206e', '71fa13ec-2186-4ca9-b251-637d2d889caf', 'active', 'car', 'Isuzu', 'D-Max', '1.9 Ddi 4x4 LSX', 2019, 122000, 298000, 2, 'diesel', 'manuelle', 'utilitaire', 8, 7.0, NULL, 4, 'أحمر', 'dakhla', 'tres-bon', false, true, '2026-09-05', false, true, true, NULL, 'ملكية واحدة منذ الشراء، الوثائق كاملة وسليمة. Isuzu D-Max 1.9 Ddi 4x4 LSX موديل 2019، قاطعة 122 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"نظام ABS","مقود متعدد الوظائف","شاشة تعمل باللمس","مثبت السرعة","حساسات ركن","جنطات ألومنيوم","تكييف أوتوماتيكي",GPS,"وسائد هوائية","راديو Bluetooth","نظام ESP"}', true, false, 77, 271000, 0.0996, 4, true, NULL, NULL, 4077, 114, '2026-07-27 00:00:00+00', NULL, NULL, '2026-08-26 14:44:18.300912+00', '2026-08-26 14:44:18.300912+00'),
	('f1177871-3abd-44e7-af60-b41ca3816bce', 'c063', 'toyota-hilux-2016-c063', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'car', 'Toyota', 'Hilux', '2.4 D-4D 4x2 Simple Cab', 2016, 198000, 236000, 3, 'diesel', 'manuelle', 'utilitaire', 8, 7.1, NULL, 2, 'أزرق ليلي', 'laayoune', 'bon', false, true, '2026-11-12', true, false, false, NULL, 'مستعملة فقط في المدينة، محرك نظيف والاستهلاك اقتصادي. Toyota Hilux 2.4 D-4D 4x2 Simple Cab موديل 2016، قاطعة 198 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. نقبل الفحص عند أي كراج ديال اختيارك.', '{"نظام ABS","قفل مركزي","وسائد هوائية","راديو Bluetooth",GPS,"جنطات ألومنيوم","مكيف الهواء","مقاعد جلدية","مثبت السرعة","زجاج كهربائي","مقود متعدد الوظائف"}', true, true, 72, 161500, 0.4613, 11, true, NULL, NULL, 1774, 165, '2026-07-27 16:00:00+00', NULL, NULL, '2026-08-26 14:44:18.304067+00', '2026-08-26 14:44:18.304067+00'),
	('2cf28799-27d2-4b28-a108-2707b57833c0', 'c064', 'renault-zoe-2020-c064', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Renault', 'Zoe', 'R110 Intens', 2020, 61000, 218000, 2, 'electrique', 'automatique', 'citadine', 5, 17.2, NULL, 5, 'أسود', 'casablanca', 'tres-bon', false, true, '2026-10-14', false, false, true, NULL, 'بيع بسبب شراء طوموبيل جديدة، الحالة ديالها ممتازة. Renault Zoe R110 Intens موديل 2020، قاطعة 61 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"راديو Bluetooth","زجاج كهربائي","شاشة تعمل باللمس","فتحة سقف","نظام ABS","أضواء LED"}', false, true, 71, 188500, 0.1565, 14, true, NULL, NULL, 261, 3, '2026-08-22 23:00:00+00', NULL, NULL, '2026-08-26 14:44:18.307458+00', '2026-08-26 14:44:18.307458+00'),
	('54e457f8-465f-475e-8e4b-ce1fdb1048e3', 'c065', 'dacia-spring-2022-c065', 'd1230d91-61df-49b2-9ab2-b3974f417a3f', 'a32abf97-e87d-4a54-91b5-90a6dcf60cd4', 'active', 'car', 'Dacia', 'Spring', 'Electric 45 Comfort', 2022, 38000, 168000, 2, 'electrique', 'automatique', 'citadine', 4, 14.5, NULL, 5, 'أبيض', 'rabat', 'excellent', false, true, '2026-09-11', false, true, true, NULL, 'الطوموبيل مزيانة بزاف، ما فيها لا صدمة لا صباغة. Dacia Spring Electric 45 Comfort موديل 2022، قاطعة 38 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"حساسات ركن","مكيف الهواء",GPS,"مقاعد جلدية","راديو Bluetooth","مقود متعدد الوظائف"}', true, false, 72, 214500, -0.2168, 6, false, 'top', '2026-09-25 14:44:18.310596+00', 2092, 132, '2026-07-30 07:00:00+00', NULL, NULL, '2026-08-26 14:44:18.310596+00', '2026-08-26 14:44:18.310596+00'),
	('f819033d-ad58-49e1-99b5-8a44d8aa0018', 'c066', 'hyundai-kona-2021-c066', 'af266ff1-a7ab-4e04-8d29-5b4f7dc48f92', '494a2b05-dd36-4ec5-9977-e664d03a55f8', 'active', 'car', 'Hyundai', 'Kona', 'Electric 64 kWh Executive', 2021, 54000, 385000, 2, 'electrique', 'automatique', 'suv', 7, 16.8, NULL, 5, 'فضي', 'casablanca', 'excellent', false, true, '2026-12-26', true, true, false, NULL, 'الحمد لله السيارة فحالة زوينة، ماكاين فيها حتى مشكل ميكانيكي. Hyundai Kona Electric 64 kWh Executive موديل 2021، قاطعة 54 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"نظام ABS","وسائد هوائية","زجاج كهربائي","تكييف أوتوماتيكي","مقاعد جلدية","مقود متعدد الوظائف","مكيف الهواء","كاميرا الرجوع للخلف","مثبت السرعة","نظام ESP","فتحة سقف"}', true, false, 78, 368000, 0.0462, 7, false, NULL, NULL, 2444, 56, '2026-08-04 08:00:00+00', NULL, NULL, '2026-08-26 14:44:18.313647+00', '2026-08-26 14:44:18.313647+00'),
	('171935ab-0c91-4432-bd15-5c000e835ba1', 'c067', 'tesla-model-3-2022-c067', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'car', 'Tesla', 'Model 3', 'Long Range AWD', 2022, 41000, 545000, 2, 'electrique', 'automatique', 'berline', 9, 16.2, NULL, 4, 'فضي', 'rabat', 'excellent', false, true, '2026-12-05', true, true, true, NULL, 'الطوموبيل مزيانة بزاف، ما فيها لا صدمة لا صباغة. Tesla Model 3 Long Range AWD موديل 2022، قاطعة 41 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. التسليم فوري بعد إتمام الإجراءات.', '{"مقاعد جلدية","راديو Bluetooth","وسائد هوائية","أضواء LED","مقود متعدد الوظائف","كاميرا الرجوع للخلف","مكيف الهواء","تكييف أوتوماتيكي","زجاج كهربائي","نظام ESP","فتحة سقف"}', false, false, 97, 563000, -0.0320, 13, true, NULL, NULL, 1588, 71, '2026-08-12 21:00:00+00', NULL, NULL, '2026-08-26 14:44:18.316871+00', '2026-08-26 14:44:18.316871+00'),
	('5cc4b812-e14e-4a1e-8093-33ef3134c10a', 'c068', 'peugeot-partner-2020-c068', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'car', 'Peugeot', 'Partner', '1.5 BlueHDi Fourgon', 2020, 96000, 152000, 3, 'diesel', 'manuelle', 'utilitaire', 6, 4.8, NULL, 4, 'أزرق ليلي', 'casablanca', 'tres-bon', false, true, '2026-09-05', false, true, true, NULL, 'ملكية واحدة منذ الشراء، الوثائق كاملة وسليمة. Peugeot Partner 1.5 BlueHDi Fourgon موديل 2020، قاطعة 96 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"زجاج كهربائي","وسائد هوائية","أضواء LED","قفل مركزي","مثبت السرعة","تكييف أوتوماتيكي","راديو Bluetooth"}', true, false, 70, 189500, -0.1979, 16, false, NULL, NULL, 968, 138, '2026-08-24 04:00:00+00', NULL, NULL, '2026-08-26 14:44:18.320073+00', '2026-08-26 14:44:18.320073+00'),
	('a85dda26-4e34-4ffc-b06d-b1d6263cdfe7', 'c069', 'volkswagen-caddy-2018-c069', 'cb5306a2-0159-4c0e-a113-f8f766cc3bf9', NULL, 'active', 'car', 'Volkswagen', 'Caddy', '2.0 TDI Fourgon', 2018, 138000, 148000, 2, 'diesel', 'manuelle', 'utilitaire', 7, 5.2, NULL, 4, 'رمادي', 'tanger', 'bon', false, true, '2026-10-15', true, true, true, NULL, 'للجادين فقط، الثمن قابل للنقاش الخفيف. Volkswagen Caddy 2.0 TDI Fourgon موديل 2018، قاطعة 138 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{GPS,"وسائد هوائية","نظام ABS","أضواء LED","حساسات ركن","شاشة تعمل باللمس","زجاج كهربائي"}', true, false, 92, 203000, -0.2709, 12, true, NULL, NULL, 1476, 83, '2026-08-18 02:00:00+00', NULL, NULL, '2026-08-26 14:44:18.323483+00', '2026-08-26 14:44:18.323483+00'),
	('cf14f6bf-9c7f-4d68-babb-670ae442e6f4', 'm023', 'yamaha-tenere-700-2021-m023', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'moto', 'Yamaha', 'Ténéré 700', 'ABS', 2021, 21000, 128000, 2, 'essence', 'manuelle', 'trail', 8, 4.4, 689, NULL, 'رمادي', 'casablanca', 'tres-bon', false, true, '2026-10-23', false, true, true, NULL, 'الموطور فحالة زوينة، خدمة بلا مشاكل. Yamaha Ténéré 700 ABS موديل 2021، قاطعة 21 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"وضعيات قيادة متعددة","حقائب جانبية","شاحن USB","لوحة عدادات رقمية","درع واقي للمحرك","نظام تحكم في الجر","نظام ABS"}', true, false, 72, 98500, 0.2995, 4, false, NULL, NULL, 3811, 75, '2026-07-25 09:00:00+00', NULL, NULL, '2026-08-26 14:44:18.327088+00', '2026-08-26 14:44:18.327088+00'),
	('8b6103cd-7c50-4ec7-84c8-8970efb6d778', 'm024', 'honda-transalp-750-2023-m024', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'moto', 'Honda', 'Transalp 750', 'XL750', 2023, 12000, 142000, 1, 'essence', 'manuelle', 'trail', 9, 4.6, 755, NULL, 'رمادي', 'rabat', 'excellent', true, true, '2026-09-18', false, true, true, NULL, 'بيع بسبب السفر، الموطور ماشي فيه حتى شي طبة. Honda Transalp 750 XL750 موديل 2023، قاطعة 12 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"أضواء LED","نظام تحكم في الجر","عادم رياضي","شاحن USB","حقائب جانبية"}', false, false, 77, 162000, -0.1235, 7, false, NULL, NULL, 2842, 32, '2026-07-21 20:00:00+00', NULL, NULL, '2026-08-26 14:44:18.330322+00', '2026-08-26 14:44:18.330322+00'),
	('6d4a19c4-569f-41ef-a09a-b8ebdd2ae025', 'm025', 'kawasaki-ninja-650-2020-m025', 'e8b7e10b-cca7-42ef-94e1-f115cf811e4a', NULL, 'active', 'moto', 'Kawasaki', 'Ninja 650', 'ABS', 2020, 19000, 78000, 3, 'essence', 'manuelle', 'sportive', 7, 4.3, 649, NULL, 'أحمر', 'casablanca', 'tres-bon', false, true, '2026-10-13', false, false, false, NULL, 'المحرك نظيف والصيانة كاملة موثقة بالفواتير. Kawasaki Ninja 650 ABS موديل 2020، قاطعة 19 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"زجاج أمامي عالٍ","إطارات جديدة","وضعيات قيادة متعددة","مقبض مسخّن","نظام ABS","لوحة عدادات رقمية"}', true, true, 63, 116500, -0.3305, 16, false, NULL, NULL, 2699, 167, '2026-08-17 22:00:00+00', NULL, NULL, '2026-08-26 14:44:18.332833+00', '2026-08-26 14:44:18.332833+00'),
	('43aab1b7-46f4-428f-ab45-77711ed01341', 'm026', 'yamaha-r6-2017-m026', '89d64bb6-01a3-4c1a-b40e-3755e2be86a1', '1abf2c18-885b-4d44-aea4-6494a93412df', 'active', 'moto', 'Yamaha', 'R6', 'YZF-R6', 2017, 29000, 92000, 2, 'essence', 'manuelle', 'sportive', 9, 5.6, 599, NULL, 'أسود مطفي', 'marrakech', 'bon', false, true, '2026-10-13', false, false, false, NULL, 'صيانة مضبوطة عند الوكيل المعتمد، الوثائق كاملة. Yamaha R6 YZF-R6 موديل 2017، قاطعة 29 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"أضواء LED","مقبض مسخّن","نظام ABS","شاحن USB","درع واقي للمحرك","وضعيات قيادة متعددة"}', true, false, 63, 74500, 0.2349, 4, true, NULL, NULL, 3782, 147, '2026-08-01 16:00:00+00', NULL, NULL, '2026-08-26 14:44:18.335473+00', '2026-08-26 14:44:18.335473+00'),
	('b582d7f9-4ca5-4216-975e-4e7fb0b0ce9e', 'm027', 'honda-cbr-600rr-2015-m027', 'f6c8d3f6-bf53-4ce4-a951-15ad5084206e', '71fa13ec-2186-4ca9-b251-637d2d889caf', 'active', 'moto', 'Honda', 'CBR 600RR', 'ABS', 2015, 38000, 78000, 1, 'essence', 'manuelle', 'sportive', 9, 5.9, 599, NULL, 'أسود مطفي', 'tanger', 'bon', true, true, '2026-12-21', false, false, true, NULL, 'صيانة مضبوطة عند الوكيل المعتمد، الوثائق كاملة. Honda CBR 600RR ABS موديل 2015، قاطعة 38 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"لوحة عدادات رقمية","إطارات جديدة","أضواء LED"}', true, false, 65, 70500, 0.1064, 10, false, NULL, NULL, 3123, 5, '2026-08-15 14:00:00+00', NULL, NULL, '2026-08-26 14:44:18.338337+00', '2026-08-26 14:44:18.338337+00'),
	('93f4f0e9-b088-4033-8f09-99c35147628b', 'm028', 'honda-forza-125-2021-m028', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'moto', 'Honda', 'Forza 125', 'ABS', 2021, 15000, 42000, 2, 'essence', 'automatique', 'scooter', 2, 2.4, 125, NULL, 'أسود مطفي', 'rabat', 'excellent', false, true, '2026-10-27', false, true, true, NULL, 'الموطور فحالة زوينة، خدمة بلا مشاكل. Honda Forza 125 ABS موديل 2021، قاطعة 15 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. التسليم فوري بعد إتمام الإجراءات.', '{"عادم رياضي","نظام ABS","زجاج أمامي عالٍ","أضواء LED","إطارات جديدة","لوحة عدادات رقمية"}', true, false, 78, 31500, 0.3333, 13, false, NULL, NULL, 3578, 145, '2026-08-21 18:00:00+00', NULL, NULL, '2026-08-26 14:44:18.341101+00', '2026-08-26 14:44:18.341101+00'),
	('f5d4c4c0-b271-427b-a450-1952c1be6085', 'm029', 'kymco-agility-125-2021-m029', 'cb5306a2-0159-4c0e-a113-f8f766cc3bf9', NULL, 'active', 'moto', 'Kymco', 'Agility 125', 'City', 2021, 21000, 15500, 1, 'essence', 'automatique', 'scooter', 2, 2.5, 125, NULL, 'أزرق', 'marrakech', 'bon', true, true, '2026-10-14', true, true, true, NULL, 'المحرك نظيف والصيانة كاملة موثقة بالفواتير. Kymco Agility 125 City موديل 2021، قاطعة 21 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الثمن نهائي تقريباً، المرجو الجدية.', '{"إطارات جديدة","وضعيات قيادة متعددة","نظام تحكم في الجر","شاحن USB"}', false, true, 92, 16000, -0.0313, 10, true, NULL, NULL, 1159, 42, '2026-07-21 07:00:00+00', NULL, NULL, '2026-08-26 14:44:18.343613+00', '2026-08-26 14:44:18.343613+00'),
	('6847ba46-8bef-459e-921e-523e2653a85d', 'm030', 'peugeot-django-2020-m030', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'moto', 'Peugeot', 'Django', '125 Allure', 2020, 17000, 24000, 3, 'essence', 'automatique', 'scooter', 2, 2.5, 125, NULL, 'أبيض', 'marrakech', 'tres-bon', false, true, '2026-10-26', false, true, true, NULL, 'المحرك نظيف والصيانة كاملة موثقة بالفواتير. Peugeot Django 125 Allure موديل 2020، قاطعة 17 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. نقبل الفحص عند أي كراج ديال اختيارك.', '{"شاحن USB","عادم رياضي","نظام ABS","أضواء LED"}', true, false, 70, 29500, -0.1864, 4, false, NULL, NULL, 989, 108, '2026-08-01 03:00:00+00', NULL, NULL, '2026-08-26 14:44:18.346758+00', '2026-08-26 14:44:18.346758+00'),
	('1b70053e-40f9-4af5-967b-f42c9b9ceb87', 'm031', 'sym-jet-14-2022-m031', '6573e2ba-2d03-492a-9495-345dc461d080', NULL, 'active', 'moto', 'SYM', 'Jet 14', '125', 2022, 12000, 17000, 2, 'essence', 'automatique', 'scooter', 2, 2.4, 125, NULL, 'أسود مطفي', 'fes', 'excellent', false, true, '2026-09-22', true, false, true, NULL, 'بيع بسبب السفر، الموطور ماشي فيه حتى شي طبة. SYM Jet 14 125 موديل 2022، قاطعة 12 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"حقائب جانبية","مقبض مسخّن","شاحن USB","أضواء LED"}', true, true, 67, 21500, -0.2093, 6, false, NULL, NULL, 4240, 158, '2026-08-22 17:00:00+00', NULL, NULL, '2026-08-26 14:44:18.349327+00', '2026-08-26 14:44:18.349327+00');
INSERT INTO public.listings VALUES
	('ef69fcf2-5d6a-42f4-86e3-106ebd43745d', 'm032', 'bmw-f-850-gs-2019-m032', '8e69cdcc-029d-47dc-879d-e8eefe660ec9', NULL, 'active', 'moto', 'BMW', 'F 850 GS', 'Adventure', 2019, 34000, 145000, 3, 'essence', 'manuelle', 'trail', 9, 4.7, 853, NULL, 'أبيض', 'rabat', 'tres-bon', false, true, '2026-10-27', true, true, true, NULL, 'المحرك نظيف والصيانة كاملة موثقة بالفواتير. BMW F 850 GS Adventure موديل 2019، قاطعة 34 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"شاحن USB","عادم رياضي","درع واقي للمحرك","حقائب جانبية","وضعيات قيادة متعددة","نظام ABS","نظام تحكم في الجر","مقبض مسخّن"}', false, false, 88, 139500, 0.0394, 16, false, 'featured', '2026-09-09 14:44:18.351834+00', 214, 66, '2026-08-15 04:00:00+00', NULL, NULL, '2026-08-26 14:44:18.351834+00', '2026-08-26 14:44:18.351834+00'),
	('131567fc-707d-43bd-b5b5-8b0db40ebfae', 'm033', 'harley-davidson-forty-eight-2019-m033', 'd9e8ba57-f704-4b4f-8d15-87798fcaa33b', NULL, 'active', 'moto', 'Harley-Davidson', 'Forty-Eight', 'XL1200X', 2019, 18000, 128000, 2, 'essence', 'manuelle', 'custom', 10, 5.1, 1202, NULL, 'أزرق', 'marrakech', 'excellent', false, true, '2026-11-26', false, false, false, NULL, 'بيع بسبب السفر، الموطور ماشي فيه حتى شي طبة. Harley-Davidson Forty-Eight XL1200X موديل 2019، قاطعة 18 000 كيلومتر. الصيانة كتدار عند ميكانيسيان ثقة. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"زجاج أمامي عالٍ","شاحن USB","مقبض مسخّن","نظام ABS","حقائب جانبية","إطارات جديدة","لوحة عدادات رقمية","عادم رياضي"}', true, false, 49, 158000, -0.1899, 5, false, NULL, NULL, 1719, 169, '2026-08-01 21:00:00+00', NULL, NULL, '2026-08-26 14:44:18.355357+00', '2026-08-26 14:44:18.355357+00'),
	('b29d87d9-caa2-4060-a960-c9dd5ce558b2', 'm034', 'royal-enfield-meteor-350-2022-m034', 'af266ff1-a7ab-4e04-8d29-5b4f7dc48f92', '494a2b05-dd36-4ec5-9977-e664d03a55f8', 'active', 'moto', 'Royal Enfield', 'Meteor 350', 'Fireball', 2022, 11000, 42000, 1, 'essence', 'manuelle', 'custom', 4, 2.9, 349, NULL, 'أبيض', 'casablanca', 'excellent', true, true, '2026-09-16', false, true, true, NULL, 'مستعملة فالويكاند فقط، البنو والإطارات فحالة ممتازة. Royal Enfield Meteor 350 Fireball موديل 2022، قاطعة 11 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. ممكن تجي تشوفها فأي وقت، ونقدرو ندوزو من ميكانيسيان ديالك.', '{"إطارات جديدة","نظام تحكم في الجر","وضعيات قيادة متعددة","مقبض مسخّن","شاحن USB"}', true, false, 84, 63500, -0.3386, 16, true, NULL, NULL, 1291, 154, '2026-08-24 03:00:00+00', NULL, NULL, '2026-08-26 14:44:18.358881+00', '2026-08-26 14:44:18.358881+00'),
	('11c8ea17-89fd-4961-89d2-f01a91fd92d4', 'm035', 'bajaj-pulsar-2021-m035', 'bf252bb9-478a-49a3-a9e6-fb52fed144aa', NULL, 'active', 'moto', 'Bajaj', 'Pulsar', 'NS200', 2021, 24000, 22000, 3, 'essence', 'manuelle', 'roadster', 3, 2.9, 199, NULL, 'أسود مطفي', 'oujda', 'tres-bon', false, false, '2026-09-23', false, true, true, NULL, 'المحرك نظيف والصيانة كاملة موثقة بالفواتير. Bajaj Pulsar NS200 موديل 2021، قاطعة 24 000 كيلومتر. دفتر الصيانة متوفر بجميع الفواتير. الفحص التقني صالح والوثائق جاهزة للتحويل.', '{"عادم رياضي","أضواء LED","نظام ABS","شاحن USB","مقبض مسخّن","وضعيات قيادة متعددة"}', true, false, 62, 18000, 0.2222, 15, true, 'featured', '2026-09-09 14:44:18.362002+00', 3461, 168, '2026-08-08 05:00:00+00', NULL, NULL, '2026-08-26 14:44:18.362002+00', '2026-08-26 14:44:18.362002+00');


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: otp_codes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: price_history; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.price_history VALUES
	(1, 'c54d6da7-9d9f-4cc3-89d6-b8de57b9fcd8', 86000, '2026-08-12 17:00:00+00'),
	(2, '0b618a31-af03-4883-b52f-745df7c5b0c4', 139000, '2026-08-06 06:00:00+00'),
	(3, '95ad54d3-407c-40c4-955d-22e4961c2349', 178000, '2026-08-12 08:00:00+00'),
	(4, '7a6717b6-d34d-42ff-946c-c0a34bde30b9', 112000, '2026-08-12 03:00:00+00'),
	(5, '08e29a0f-3a11-42e9-bc17-72d6cb17f981', 118000, '2026-08-13 16:00:00+00'),
	(6, '6dc0d3db-4e09-4d68-bc74-ef01034a1e20', 124000, '2026-08-11 18:00:00+00'),
	(7, '078cd4a9-0388-45c2-91aa-d979e998b940', 94000, '2026-08-02 07:00:00+00'),
	(8, 'f45703fb-0547-43cb-bad0-654783251e26', 158000, '2026-08-09 02:00:00+00'),
	(9, 'cf8b1b7a-6aa2-44ec-9f58-6398b0c3e638', 108500, '2026-08-04 08:00:00+00'),
	(10, 'cf8b1b7a-6aa2-44ec-9f58-6398b0c3e638', 102000, '2026-08-26 14:44:18.063351+00'),
	(11, 'cf8b1b7a-6aa2-44ec-9f58-6398b0c3e638', 96000, '2026-08-26 14:44:18.063351+00'),
	(12, 'e6440068-6d58-4384-b322-8ee2caf6aa12', 181000, '2026-08-16 07:00:00+00'),
	(13, 'e6440068-6d58-4384-b322-8ee2caf6aa12', 172000, '2026-08-26 14:44:18.06728+00'),
	(14, '522305b6-043b-4a3a-ad2e-843e02db85c0', 136500, '2026-08-10 17:00:00+00'),
	(15, '522305b6-043b-4a3a-ad2e-843e02db85c0', 132000, '2026-08-26 14:44:18.071765+00'),
	(16, '14d4493c-5f13-4b7e-a91e-3d92a1b589f7', 116000, '2026-08-19 04:00:00+00'),
	(17, 'ea493a89-491c-464b-8769-6d316be9370e', 268000, '2026-07-29 07:00:00+00'),
	(18, '07a5b91e-e137-4eb4-9c8a-a4fa28734430', 135000, '2026-08-04 20:00:00+00'),
	(19, '07a5b91e-e137-4eb4-9c8a-a4fa28734430', 128500, '2026-08-26 14:44:18.082751+00'),
	(20, '07a5b91e-e137-4eb4-9c8a-a4fa28734430', 126000, '2026-08-26 14:44:18.082751+00'),
	(21, '2230879f-4d79-42a8-9c8b-15b90febfafc', 123000, '2026-07-31 21:00:00+00'),
	(22, '2230879f-4d79-42a8-9c8b-15b90febfafc', 116000, '2026-08-26 14:44:18.086979+00'),
	(23, '2230879f-4d79-42a8-9c8b-15b90febfafc', 112000, '2026-08-26 14:44:18.086979+00'),
	(24, '484f378d-fd41-4d3e-ab6d-0dd15a60dbd1', 138000, '2026-07-25 08:00:00+00'),
	(25, '294aeaf0-dd54-4aca-bbd0-c8848ac7947c', 176000, '2026-08-20 07:00:00+00'),
	(26, '28d5c31c-c766-465a-8159-f18d594e9416', 175000, '2026-07-27 06:00:00+00'),
	(27, '28d5c31c-c766-465a-8159-f18d594e9416', 168500, '2026-08-26 14:44:18.096084+00'),
	(28, '28d5c31c-c766-465a-8159-f18d594e9416', 162000, '2026-08-26 14:44:18.096084+00'),
	(29, 'edfae492-8b98-4e46-9b1e-e98d1827da50', 172000, '2026-07-23 21:00:00+00'),
	(30, '74dd8d06-0586-48f2-b92e-5178b782d27a', 298000, '2026-08-04 06:00:00+00'),
	(31, '28880baf-ae9e-4c32-89a4-85570160d37c', 108000, '2026-08-04 21:00:00+00'),
	(32, '0cf5bf71-cacc-4992-818c-68b6978ed08a', 96000, '2026-08-20 05:00:00+00'),
	(33, 'a2b52849-e9f0-424f-9fb8-f5250d1cfee3', 245000, '2026-08-12 19:00:00+00'),
	(34, 'd6cc02d9-dedb-4c47-862f-af6ba4e9bcb9', 97000, '2026-08-05 17:00:00+00'),
	(35, '32f9c753-86d0-491c-935e-3ca71ee91f25', 113000, '2026-07-23 02:00:00+00'),
	(36, 'fa17c904-82af-4d20-96bf-71529d997320', 267000, '2026-08-07 15:00:00+00'),
	(37, 'fa17c904-82af-4d20-96bf-71529d997320', 252500, '2026-08-26 14:44:18.117433+00'),
	(38, 'fa17c904-82af-4d20-96bf-71529d997320', 242000, '2026-08-26 14:44:18.117433+00'),
	(39, 'a97049ee-ca89-4f8d-a565-88c20f7db46a', 133000, '2026-08-05 02:00:00+00'),
	(40, 'c61b9dc2-a974-44aa-ba75-d2e2d611a5d1', 236000, '2026-08-11 02:00:00+00'),
	(41, '5f528cd8-091a-4982-83ea-6d3d13d1c81f', 354500, '2026-07-27 09:00:00+00'),
	(42, '5f528cd8-091a-4982-83ea-6d3d13d1c81f', 337500, '2026-08-26 14:44:18.125585+00'),
	(43, '5f528cd8-091a-4982-83ea-6d3d13d1c81f', 328000, '2026-08-26 14:44:18.125585+00'),
	(44, '9a5a936c-da2b-4306-a00e-8e7537b20fce', 104000, '2026-08-15 23:00:00+00'),
	(45, '3bd091a8-b5cc-4aea-b415-6b7ab4e59938', 138000, '2026-08-18 20:00:00+00'),
	(46, '3bd091a8-b5cc-4aea-b415-6b7ab4e59938', 134000, '2026-08-26 14:44:18.131016+00'),
	(47, 'c15a776e-44aa-4cac-9252-fa14bb8c1738', 70000, '2026-08-08 07:00:00+00'),
	(48, 'c15a776e-44aa-4cac-9252-fa14bb8c1738', 68000, '2026-08-26 14:44:18.134378+00'),
	(49, '839812f3-c38d-492b-8b99-42667682ed9f', 142000, '2026-08-13 05:00:00+00'),
	(50, 'e527e457-f89f-49cd-85a6-37b78ad9ecde', 148000, '2026-07-30 23:00:00+00');
INSERT INTO public.price_history VALUES
	(51, '62af184d-6656-4fda-a4ed-46b66ab54b2c', 168000, '2026-08-13 19:00:00+00'),
	(52, 'bf50e95c-37ff-429e-a07f-f475f3305d17', 189000, '2026-08-07 22:00:00+00'),
	(53, '91a91ab7-3660-4da1-8092-4e426967c1f7', 118000, '2026-07-22 06:00:00+00'),
	(54, '5a7d6ede-e726-469b-89cd-f4a3d6aa04dc', 322000, '2026-08-06 07:00:00+00'),
	(55, 'c4c35c25-3b11-4e3a-8c88-891410365a05', 335500, '2026-08-01 23:00:00+00'),
	(56, 'c4c35c25-3b11-4e3a-8c88-891410365a05', 325500, '2026-08-26 14:44:18.156499+00'),
	(57, 'c4c35c25-3b11-4e3a-8c88-891410365a05', 305000, '2026-08-26 14:44:18.156499+00'),
	(58, '9ffebc7b-800c-4b19-ae17-2c1e84643811', 285000, '2026-08-09 22:00:00+00'),
	(59, '8b6355f8-34bd-41a2-baf0-dc86892f1e0c', 288000, '2026-07-22 21:00:00+00'),
	(60, '69332398-0da3-45e6-8d36-cea7ff148815', 302000, '2026-07-28 20:00:00+00'),
	(61, '65203abc-a955-4d3c-b67c-85fdfe3e95a9', 198500, '2026-08-04 15:00:00+00'),
	(62, '65203abc-a955-4d3c-b67c-85fdfe3e95a9', 186000, '2026-08-26 14:44:18.169209+00'),
	(63, '27a839e1-1290-473e-a0dd-e5dd854be97a', 263500, '2026-08-04 10:00:00+00'),
	(64, '27a839e1-1290-473e-a0dd-e5dd854be97a', 252000, '2026-08-26 14:44:18.172623+00'),
	(65, '1f2c03b6-1f7e-4f4c-ab7b-0948fb8f1c73', 268000, '2026-08-24 02:00:00+00'),
	(66, '229772c0-f5b7-4c0d-9c52-9d923a2ac28f', 325000, '2026-08-08 21:00:00+00'),
	(67, '32c5ca5e-ef86-42f0-b071-2d76f7a5ab7f', 212000, '2026-07-23 07:00:00+00'),
	(68, 'b48349e7-d5ba-4770-a375-e5485ce8a6a2', 94000, '2026-08-01 23:00:00+00'),
	(69, 'f8124c57-0e7f-4150-8951-ef9a80508002', 114500, '2026-08-04 08:00:00+00'),
	(70, 'f8124c57-0e7f-4150-8951-ef9a80508002', 112000, '2026-08-26 14:44:18.191611+00'),
	(71, 'f8124c57-0e7f-4150-8951-ef9a80508002', 109000, '2026-08-26 14:44:18.191611+00'),
	(72, '4abe0921-b16c-46b4-b970-275261f6d0fb', 292000, '2026-08-12 15:00:00+00'),
	(73, 'e098952f-09b4-480a-8e7c-7f4eba6d847d', 378000, '2026-08-20 06:00:00+00'),
	(74, '36c42e43-6a01-465e-ba55-bdc1cc38bb79', 121000, '2026-08-22 20:00:00+00'),
	(75, 'eb9a3d16-273e-4762-8818-691bdc6fe889', 63000, '2026-07-31 02:00:00+00'),
	(76, '1f91c0ec-eda3-42f3-a253-be54d99e94e9', 256000, '2026-07-23 03:00:00+00'),
	(77, 'a4762a15-61c7-49fb-8bea-0c0e06fe6a7e', 468000, '2026-07-28 19:00:00+00'),
	(78, '7db9d656-c7e9-4279-ad30-49eae513bcb7', 192000, '2026-08-19 05:00:00+00'),
	(79, 'fef87298-562e-4aa8-9ce0-d3b8675e51a8', 128000, '2026-08-04 00:00:00+00'),
	(80, 'd1a5b2b8-20c6-48e7-ba73-32942a6013f2', 178000, '2026-07-24 10:00:00+00'),
	(81, 'dce2796d-5995-4087-b40f-b9015c32052c', 316000, '2026-08-12 09:00:00+00'),
	(82, 'dce2796d-5995-4087-b40f-b9015c32052c', 303500, '2026-08-26 14:44:18.226671+00'),
	(83, 'dce2796d-5995-4087-b40f-b9015c32052c', 285000, '2026-08-26 14:44:18.226671+00'),
	(84, 'a4523f41-20a6-4b00-ac7b-dafd3f9c0066', 129000, '2026-08-01 21:00:00+00'),
	(85, '6b4349d8-8f47-4cb2-9c53-a6a06e5e1981', 79000, '2026-08-14 07:00:00+00'),
	(86, '2cce2757-2f51-4f6f-b064-7e09102e5ba3', 96000, '2026-08-10 04:00:00+00'),
	(87, '2f0ee47b-c80a-4dab-b8f6-fa4e214ada11', 73000, '2026-08-21 05:00:00+00'),
	(88, '4df78941-de61-4c53-9966-b3b8db9c72fb', 33000, '2026-08-16 20:00:00+00'),
	(89, 'e212e106-70a3-46d1-a518-b977fb3e7b4d', 64000, '2026-08-24 01:00:00+00'),
	(90, 'e212e106-70a3-46d1-a518-b977fb3e7b4d', 62000, '2026-08-26 14:44:18.244295+00'),
	(91, '03c3a97a-74d0-4095-b1ce-24a40db6589a', 51000, '2026-08-19 05:00:00+00'),
	(92, '03c3a97a-74d0-4095-b1ce-24a40db6589a', 49500, '2026-08-26 14:44:18.247105+00'),
	(93, '03c3a97a-74d0-4095-b1ce-24a40db6589a', 47000, '2026-08-26 14:44:18.247105+00'),
	(94, 'cc2bf24c-72af-4f2f-98b3-96ab1ee9d496', 71000, '2026-08-05 10:00:00+00'),
	(95, '75afa67f-14c6-4960-bf9c-75ef86c78ccc', 132000, '2026-07-20 18:00:00+00'),
	(96, '17379b0a-185a-4fd5-b56c-e021381b6ebb', 74000, '2026-08-23 01:00:00+00'),
	(97, 'e27c5eac-9c72-4b3b-a3a3-4f16baf80e78', 39000, '2026-07-20 20:00:00+00'),
	(98, '8559490e-ad12-4692-aea2-993f913b3406', 20000, '2026-07-22 17:00:00+00'),
	(99, '8559490e-ad12-4692-aea2-993f913b3406', 19000, '2026-08-26 14:44:18.260289+00'),
	(100, '8559490e-ad12-4692-aea2-993f913b3406', 18500, '2026-08-26 14:44:18.260289+00');
INSERT INTO public.price_history VALUES
	(101, 'df6bf2e1-69b8-4e97-a7f1-7840d50bcaa8', 9200, '2026-08-05 17:00:00+00'),
	(102, '5250e406-08c3-47e7-b18b-0bf9133b80bf', 9100, '2026-08-01 06:00:00+00'),
	(103, '5250e406-08c3-47e7-b18b-0bf9133b80bf', 8600, '2026-08-26 14:44:18.265782+00'),
	(104, 'd04cf05b-1942-45cd-9e9d-ca0009378b35', 12000, '2026-08-14 07:00:00+00'),
	(105, '970b880f-bd1f-4498-a795-ea5601b3b298', 14000, '2026-08-15 02:00:00+00'),
	(106, 'f747262e-ff1f-408a-8926-f9f3e8d62684', 14000, '2026-07-31 17:00:00+00'),
	(107, 'f747262e-ff1f-408a-8926-f9f3e8d62684', 13500, '2026-08-26 14:44:18.276924+00'),
	(108, '4a00dbf3-a6d2-497d-a6a1-8e3898342c8c', 35000, '2026-07-20 18:00:00+00'),
	(109, '4a00dbf3-a6d2-497d-a6a1-8e3898342c8c', 34000, '2026-08-26 14:44:18.280742+00'),
	(110, 'fc3c9c14-3cf4-4417-8a37-2dbfb03929f3', 158500, '2026-07-27 09:00:00+00'),
	(111, 'fc3c9c14-3cf4-4417-8a37-2dbfb03929f3', 152000, '2026-08-26 14:44:18.285065+00'),
	(112, 'fc3c9c14-3cf4-4417-8a37-2dbfb03929f3', 148000, '2026-08-26 14:44:18.285065+00'),
	(113, 'f2d7ae0e-5341-4532-bbfd-1ff573f27b14', 115000, '2026-07-29 00:00:00+00'),
	(114, 'f2d7ae0e-5341-4532-bbfd-1ff573f27b14', 112000, '2026-08-26 14:44:18.288015+00'),
	(115, 'f2d7ae0e-5341-4532-bbfd-1ff573f27b14', 106000, '2026-08-26 14:44:18.288015+00'),
	(116, 'a24873b6-2b78-4192-aa5f-268748a1485b', 63000, '2026-08-02 16:00:00+00'),
	(117, 'cf10b172-6434-413d-a023-7274cbde364f', 36000, '2026-08-18 01:00:00+00'),
	(118, '0bb37c12-4cc8-41c5-a328-db3e11bca49a', 118000, '2026-08-24 10:00:00+00'),
	(119, '29f395c6-a69a-4e25-8e07-3dca3c681d8e', 312000, '2026-07-27 09:00:00+00'),
	(120, 'e1d47f16-f460-47cd-95de-3735374e6f98', 337000, '2026-07-27 00:00:00+00'),
	(121, 'e1d47f16-f460-47cd-95de-3735374e6f98', 319000, '2026-08-26 14:44:18.303131+00'),
	(122, 'e1d47f16-f460-47cd-95de-3735374e6f98', 298000, '2026-08-26 14:44:18.303131+00'),
	(123, 'f1177871-3abd-44e7-af60-b41ca3816bce', 261500, '2026-07-27 16:00:00+00'),
	(124, 'f1177871-3abd-44e7-af60-b41ca3816bce', 248000, '2026-08-26 14:44:18.306579+00'),
	(125, 'f1177871-3abd-44e7-af60-b41ca3816bce', 236000, '2026-08-26 14:44:18.306579+00'),
	(126, '2cf28799-27d2-4b28-a108-2707b57833c0', 218000, '2026-08-22 23:00:00+00'),
	(127, '54e457f8-465f-475e-8e4b-ce1fdb1048e3', 168000, '2026-07-30 07:00:00+00'),
	(128, 'f819033d-ad58-49e1-99b5-8a44d8aa0018', 385000, '2026-08-04 08:00:00+00'),
	(129, '171935ab-0c91-4432-bd15-5c000e835ba1', 545000, '2026-08-12 21:00:00+00'),
	(130, '5cc4b812-e14e-4a1e-8093-33ef3134c10a', 152000, '2026-08-24 04:00:00+00'),
	(131, 'a85dda26-4e34-4ffc-b06d-b1d6263cdfe7', 148000, '2026-08-18 02:00:00+00'),
	(132, 'cf14f6bf-9c7f-4d68-babb-670ae442e6f4', 128000, '2026-07-25 09:00:00+00'),
	(133, '8b6103cd-7c50-4ec7-84c8-8970efb6d778', 159500, '2026-07-21 20:00:00+00'),
	(134, '8b6103cd-7c50-4ec7-84c8-8970efb6d778', 150000, '2026-08-26 14:44:18.332153+00'),
	(135, '8b6103cd-7c50-4ec7-84c8-8970efb6d778', 142000, '2026-08-26 14:44:18.332153+00'),
	(136, '6d4a19c4-569f-41ef-a09a-b8ebdd2ae025', 78000, '2026-08-17 22:00:00+00'),
	(137, '43aab1b7-46f4-428f-ab45-77711ed01341', 97500, '2026-08-01 16:00:00+00'),
	(138, '43aab1b7-46f4-428f-ab45-77711ed01341', 94000, '2026-08-26 14:44:18.337636+00'),
	(139, '43aab1b7-46f4-428f-ab45-77711ed01341', 92000, '2026-08-26 14:44:18.337636+00'),
	(140, 'b582d7f9-4ca5-4216-975e-4e7fb0b0ce9e', 81000, '2026-08-15 14:00:00+00'),
	(141, 'b582d7f9-4ca5-4216-975e-4e7fb0b0ce9e', 78000, '2026-08-26 14:44:18.34046+00'),
	(142, '93f4f0e9-b088-4033-8f09-99c35147628b', 42000, '2026-08-21 18:00:00+00'),
	(143, 'f5d4c4c0-b271-427b-a450-1952c1be6085', 16000, '2026-07-21 07:00:00+00'),
	(144, 'f5d4c4c0-b271-427b-a450-1952c1be6085', 15500, '2026-08-26 14:44:18.34604+00'),
	(145, '6847ba46-8bef-459e-921e-523e2653a85d', 25000, '2026-08-01 03:00:00+00'),
	(146, '6847ba46-8bef-459e-921e-523e2653a85d', 24000, '2026-08-26 14:44:18.348654+00'),
	(147, '1b70053e-40f9-4af5-967b-f42c9b9ceb87', 17000, '2026-08-22 17:00:00+00'),
	(148, 'ef69fcf2-5d6a-42f4-86e3-106ebd43745d', 145000, '2026-08-15 04:00:00+00'),
	(149, '131567fc-707d-43bd-b5b5-8b0db40ebfae', 128000, '2026-08-01 21:00:00+00'),
	(150, 'b29d87d9-caa2-4060-a960-c9dd5ce558b2', 42000, '2026-08-24 03:00:00+00');
INSERT INTO public.price_history VALUES
	(151, '11c8ea17-89fd-4961-89d2-f01a91fd92d4', 22000, '2026-08-08 05:00:00+00');


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: saved_searches; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.schema_migrations VALUES
	('0001_init.sql', '2026-08-26 14:44:17.946513+00'),
	('0002_email_auth.sql', '2026-08-26 14:44:18.005317+00'),
	('0003_listing_refs.sql', '2026-08-26 14:44:18.00941+00');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: threads; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES
	('af266ff1-a7ab-4e04-8d29-5b4f7dc48f92', '+212659500805', true, 'seller-s01@triq.ma', 'أوطو بلاص كازا', NULL, 'professionnel', 'casablanca', true, NULL, 4.7, 412, 12, '2014-01-01', NULL, '2026-08-26 14:44:18.013152+00', '2026-08-26 14:44:18.013152+00', true),
	('89d64bb6-01a3-4c1a-b40e-3755e2be86a1', '+212609167948', true, 'seller-s02@triq.ma', 'كراج الأطلس', NULL, 'professionnel', 'marrakech', true, NULL, 4.5, 268, 25, '2016-01-01', NULL, '2026-08-26 14:44:18.0144+00', '2026-08-26 14:44:18.0144+00', true),
	('8e69cdcc-029d-47dc-879d-e8eefe660ec9', '+212625945567', true, 'seller-s03@triq.ma', 'منير ب.', NULL, 'particulier', 'rabat', true, NULL, 4.9, 3, 40, '2021-01-01', NULL, '2026-08-26 14:44:18.01516+00', '2026-08-26 14:44:18.01516+00', true),
	('f6c8d3f6-bf53-4ce4-a951-15ad5084206e', '+212675612710', true, 'seller-s04@triq.ma', 'سيارات الشمال', NULL, 'professionnel', 'tanger', true, NULL, 4.3, 590, 18, '2012-01-01', NULL, '2026-08-26 14:44:18.015854+00', '2026-08-26 14:44:18.015854+00', true),
	('6573e2ba-2d03-492a-9495-345dc461d080', '+212692390329', true, 'seller-s05@triq.ma', 'يوسف الإدريسي', NULL, 'particulier', 'fes', false, NULL, 4.6, 1, 90, '2022-01-01', NULL, '2026-08-26 14:44:18.0165+00', '2026-08-26 14:44:18.0165+00', true),
	('d3ad54b8-e01a-4140-98a4-b714c12ec3dc', '+212642057472', true, 'seller-s06@triq.ma', 'أوطو سوس', NULL, 'professionnel', 'agadir', true, NULL, 4.4, 187, 30, '2018-01-01', NULL, '2026-08-26 14:44:18.017215+00', '2026-08-26 14:44:18.017215+00', true),
	('e8b7e10b-cca7-42ef-94e1-f115cf811e4a', '+212658835091', true, 'seller-s07@triq.ma', 'سناء م.', NULL, 'particulier', 'casablanca', true, NULL, 5.0, 2, 22, '2020-01-01', NULL, '2026-08-26 14:44:18.018111+00', '2026-08-26 14:44:18.018111+00', true),
	('80f06af8-1897-4a45-a7fd-0b42d16d3a05', '+212676944138', true, 'seller-s08@triq.ma', 'موتور هاوس', NULL, 'professionnel', 'casablanca', true, NULL, 4.8, 96, 15, '2017-01-01', NULL, '2026-08-26 14:44:18.018872+00', '2026-08-26 14:44:18.018872+00', true),
	('d9e8ba57-f704-4b4f-8d15-87798fcaa33b', '+212693721757', true, 'seller-s09@triq.ma', 'عبد الرحيم ح.', NULL, 'particulier', 'meknes', false, NULL, 4.1, 1, 140, '2023-01-01', NULL, '2026-08-26 14:44:18.019471+00', '2026-08-26 14:44:18.019471+00', true),
	('d4b28e5b-0c52-4fdd-a238-bf58af0b4ec2', '+212696103931', true, 'seller-s10@triq.ma', 'الرحمة كار', NULL, 'professionnel', 'oujda', true, NULL, 4.2, 143, 45, '2019-01-01', NULL, '2026-08-26 14:44:18.020049+00', '2026-08-26 14:44:18.020049+00', true),
	('836bbe3f-193e-435d-8aef-ca5de0fb10d0', '+212679326312', true, 'seller-s11@triq.ma', 'خديجة ل.', NULL, 'particulier', 'kenitra', true, NULL, 4.8, 4, 35, '2019-01-01', NULL, '2026-08-26 14:44:18.020579+00', '2026-08-26 14:44:18.020579+00', true),
	('d1230d91-61df-49b2-9ab2-b3974f417a3f', '+212629659169', true, 'seller-s12@triq.ma', 'بريميوم موتورز', NULL, 'professionnel', 'rabat', true, NULL, 4.6, 331, 10, '2015-01-01', NULL, '2026-08-26 14:44:18.021084+00', '2026-08-26 14:44:18.021084+00', true),
	('bf252bb9-478a-49a3-a9e6-fb52fed144aa', '+212612881550', false, 'seller-s13@triq.ma', 'حمزة ر.', NULL, 'particulier', 'tetouan', true, NULL, 4.0, 0, 180, '2024-01-01', NULL, '2026-08-26 14:44:18.021599+00', '2026-08-26 14:44:18.021599+00', true),
	('d6a86d41-9d4b-485a-a7c5-da03025be811', '+212663214407', true, 'seller-s14@triq.ma', 'بايك ستور', NULL, 'professionnel', 'casablanca', true, NULL, 4.7, 121, 20, '2020-01-01', NULL, '2026-08-26 14:44:18.022167+00', '2026-08-26 14:44:18.022167+00', true),
	('cb5306a2-0159-4c0e-a113-f8f766cc3bf9', '+212646436788', true, 'seller-s15@triq.ma', 'إلياس ن.', NULL, 'particulier', 'safi', true, NULL, 4.5, 2, 60, '2022-01-01', NULL, '2026-08-26 14:44:18.022822+00', '2026-08-26 14:44:18.022822+00', true),
	('0c5136df-b8f8-4b46-a4dc-3b0ca147f4a0', '+212696769645', true, 'seller-s16@triq.ma', 'أوطو ديل الجنوب', NULL, 'professionnel', 'laayoune', true, NULL, 4.1, 88, 70, '2018-01-01', NULL, '2026-08-26 14:44:18.02333+00', '2026-08-26 14:44:18.02333+00', true);


--
-- Name: listing_ref_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.listing_ref_seq', 1000, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: otp_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.otp_codes_id_seq', 1, false);


--
-- Name: price_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.price_history_id_seq', 151, true);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: dealers dealers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_pkey PRIMARY KEY (id);


--
-- Name: dealers dealers_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_slug_key UNIQUE (slug);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (user_id, listing_id);


--
-- Name: listing_history listing_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listing_history
    ADD CONSTRAINT listing_history_pkey PRIMARY KEY (id);


--
-- Name: listing_media listing_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listing_media
    ADD CONSTRAINT listing_media_pkey PRIMARY KEY (id);


--
-- Name: listing_views listing_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listing_views
    ADD CONSTRAINT listing_views_pkey PRIMARY KEY (listing_id, day, visitor_key);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: listings listings_ref_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_ref_key UNIQUE (ref);


--
-- Name: listings listings_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_slug_key UNIQUE (slug);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: otp_codes otp_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT otp_codes_pkey PRIMARY KEY (id);


--
-- Name: price_history price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_pkey PRIMARY KEY (id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: saved_searches saved_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_searches
    ADD CONSTRAINT saved_searches_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (name);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_hash_key UNIQUE (token_hash);


--
-- Name: threads threads_listing_id_buyer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_listing_id_buyer_id_key UNIQUE (listing_id, buyer_id);


--
-- Name: threads threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: appointments_seller_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appointments_seller_idx ON public.appointments USING btree (seller_id, scheduled_at);


--
-- Name: dealers_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dealers_city_idx ON public.dealers USING btree (city);


--
-- Name: favorites_watch_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX favorites_watch_idx ON public.favorites USING btree (listing_id) WHERE price_watch;


--
-- Name: history_listing_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX history_listing_idx ON public.listing_history USING btree (listing_id, event_date);


--
-- Name: listings_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_city_idx ON public.listings USING btree (city);


--
-- Name: listings_deal_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_deal_idx ON public.listings USING btree (fair_price_delta);


--
-- Name: listings_dealer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_dealer_idx ON public.listings USING btree (dealer_id) WHERE (dealer_id IS NOT NULL);


--
-- Name: listings_kind_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_kind_idx ON public.listings USING btree (kind, status);


--
-- Name: listings_km_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_km_idx ON public.listings USING btree (km);


--
-- Name: listings_live_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_live_idx ON public.listings USING btree (status, published_at DESC) WHERE (status = 'active'::public.listing_status);


--
-- Name: listings_make_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_make_idx ON public.listings USING btree (make, model);


--
-- Name: listings_price_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_price_idx ON public.listings USING btree (price_mad);


--
-- Name: listings_promo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_promo_idx ON public.listings USING btree (promo, promo_expires_at) WHERE (promo IS NOT NULL);


--
-- Name: listings_search_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_search_trgm_idx ON public.listings USING gin (public.latin_fold(((((make || ' '::text) || model) || ' '::text) || version)) public.gin_trgm_ops);


--
-- Name: listings_seller_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_seller_idx ON public.listings USING btree (seller_id, status);


--
-- Name: listings_trust_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_trust_idx ON public.listings USING btree (trust_score DESC);


--
-- Name: listings_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX listings_year_idx ON public.listings USING btree (year);


--
-- Name: media_listing_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_listing_idx ON public.listing_media USING btree (listing_id, "position");


--
-- Name: messages_thread_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_thread_idx ON public.messages USING btree (thread_id, created_at);


--
-- Name: notifications_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_idx ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: otp_identifier_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX otp_identifier_idx ON public.otp_codes USING btree (identifier, created_at DESC);


--
-- Name: price_history_listing_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX price_history_listing_idx ON public.price_history USING btree (listing_id, changed_at DESC);


--
-- Name: promotions_listing_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_listing_idx ON public.promotions USING btree (listing_id, ends_at DESC);


--
-- Name: reports_open_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_open_idx ON public.reports USING btree (status, created_at) WHERE (status = 'open'::public.report_status);


--
-- Name: saved_searches_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX saved_searches_user_idx ON public.saved_searches USING btree (user_id);


--
-- Name: sessions_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_idx ON public.sessions USING btree (user_id);


--
-- Name: threads_buyer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX threads_buyer_idx ON public.threads USING btree (buyer_id, last_at DESC);


--
-- Name: threads_seller_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX threads_seller_idx ON public.threads USING btree (seller_id, last_at DESC);


--
-- Name: users_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_city_idx ON public.users USING btree (city);


--
-- Name: users_email_lower_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_lower_idx ON public.users USING btree (lower(email));


--
-- Name: dealers dealers_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER dealers_touch BEFORE UPDATE ON public.dealers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: listings listings_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER listings_touch BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: users users_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER users_touch BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: appointments appointments_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dealers dealers_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: listing_history listing_history_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listing_history
    ADD CONSTRAINT listing_history_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: listing_media listing_media_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listing_media
    ADD CONSTRAINT listing_media_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: listing_views listing_views_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listing_views
    ADD CONSTRAINT listing_views_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: listings listings_dealer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id) ON DELETE SET NULL;


--
-- Name: listings listings_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: price_history price_history_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: promotions promotions_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: promotions promotions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reports reports_handled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_handled_by_fkey FOREIGN KEY (handled_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reports reports_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: saved_searches saved_searches_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_searches
    ADD CONSTRAINT saved_searches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: threads threads_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: threads threads_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: threads threads_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


