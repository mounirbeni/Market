import Link from "next/link";
import { vehicleHref } from "@/lib/slug";
import { SmartSearch } from "@/components/SmartSearch";
import { BrandTile } from "@/components/BrandMark";
import { SuggestedForYou } from "@/components/SuggestedForYou";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleArt, VehicleGlyph } from "@/components/VehicleArt";
import { TrustRing } from "@/components/TrustBadge";
import { artShape } from "@/lib/artshape";
import { trustOf, fairPriceOf } from "@/lib/market";
import { computeTco } from "@/lib/tco";
import { formatNumber } from "@/lib/format";
import { CITIES, cityName } from "@/lib/cities";
import { GUIDES } from "@/lib/data/guides";
import { brandSlug, brandsOf } from "@/lib/slug";
import { findAll, getBrands, getDealerCounts, getDealers, getStats } from "@/lib/source";
import {
  ArrowLeft, BadgeCheck, Calculator, Car, Clock, FileText, GUIDE_ICONS, MapPin, Moto,
  Scale, Search, ShieldCheck, Sparkle, Star, TrendingDown, Users, Wallet, Wrench,
} from "@/components/icons";

const PILLARS = [
  {
    Icon: ShieldCheck,
    title: "مؤشر الثقة",
    color: "var(--good)",
    text: "كل إعلان كيتنقّط على 100 حسب توثيق البائع، الوثائق، سجل المركبة، شفافية الإعلان واتساق المعطيات. كتشوف النقطة قبل ما تتصل.",
    href: "/cars?trustMin=75",
    cta: "شوف المركبات عالية الثقة",
  },
  {
    Icon: Scale,
    title: "الثمن العادل",
    color: "var(--brand)",
    text: "كنحسبو ثمناً مرجعياً من إعلانات مشابهة بعد تعديل السنة والكيلومتراج والحالة، وكنقولو ليك واش هاد الثمن فوق ولا تحت السوق.",
    href: "/valuation",
    cta: "قيّم مركبتك مجاناً",
  },
  {
    Icon: Calculator,
    title: "التكلفة الحقيقية",
    color: "var(--data)",
    text: "ماشي غير ثمن الشراء: الفينيات، التأمين، المازوط، الصيانة، الإطارات وخسارة القيمة — كلشي بالدرهم فالسنة وبالدرهم للكيلومتر.",
    href: "/cost",
    cta: "حسب التكلفة",
  },
];

const QUICK = [
  { href: "/cars", label: "سيارات", Icon: Car },
  { href: "/motorcycles", label: "دراجات نارية", Icon: Moto },
  { href: "/cars?deals=1", label: "أحسن الصفقات", Icon: TrendingDown },
  { href: "/cars?inspected=1", label: "مفحوصة", Icon: BadgeCheck },
  { href: "/search", label: "بحث متقدم", Icon: Search },
];

const CATEGORIES = [
  { key: "citadine", label: "مدينية", kind: "car" },
  { key: "berline", label: "صالون", kind: "car" },
  { key: "suv", label: "دفع رباعي", kind: "car" },
  { key: "break", label: "بريك", kind: "car" },
  { key: "utilitaire", label: "نفعية", kind: "car" },
  { key: "cabriolet", label: "مكشوفة", kind: "car" },
  { key: "scooter", label: "سكوتر", kind: "moto" },
  { key: "roadster", label: "رودستر", kind: "moto" },
  { key: "trail", label: "طرق وعرة", kind: "moto" },
  { key: "sportive", label: "رياضية", kind: "moto" },
  { key: "custom", label: "كوستوم", kind: "moto" },
] as const;

export default async function HomePage() {
  const [featuredCars, featuredMotos, carBrands, motoBrands, stats, dealerCounts] =
    await Promise.all([
      findAll({ kind: "car", sort: "deal" }, 4),
      findAll({ kind: "moto", sort: "deal" }, 4),
      getBrands("car"),
      getBrands("moto"),
      getStats(),
      getDealerCounts(),
    ]);
  const dealers = await getDealers();

  /* الكتالوج ديما هو الأساس: حتى الماركة اللي ماعندهاش إعلان خاصها
     تبقى باينة بصفحتها. كنزيدو عدد الإعلانات الحقيقية غير ملي كاين. */
  type Tile = { make: string; slug: string; count?: number };
  function catalogTiles(catalog: Tile[], live: Tile[]): Tile[] {
    const liveBySlug = new Map(live.map((b) => [b.slug, b]));
    const catalogSlugs = new Set(catalog.map((b) => b.slug));
    return [
      ...catalog.map((b) => ({ ...b, count: liveBySlug.get(b.slug)?.count })),
      // إلا دخلات ماركة جديدة من قاعدة البيانات قبل تحديث الكتالوج، مانوضّعوهاش تضيع.
      ...live.filter((b) => !catalogSlugs.has(b.slug)),
    ];
  }
  const carTiles = catalogTiles(brandsOf("car"), carBrands);
  const motoTiles = catalogTiles(brandsOf("moto"), motoBrands);
  const topGuides = GUIDES.slice(0, 4);
  const topDealers = dealers
    .map((d) => ({ d, count: dealerCounts[d.slug] ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  const { cars, motos, avgTrust } = stats;

  // البطل: أعلى ثقة من المفحوصة
  const heroPool = await findAll({ inspectedOnly: true, sort: "trust-desc" }, 8);
  /* «مثال حي» كيوري إعلاناً حقيقياً من المنصة. ملي مازال ماكاينش
     حتى إعلان، القسم كامل ماكيبانش — أحسن من مثال مخترع. */
  const hero = heroPool[0] ?? featuredCars[0] ?? null;
  const heroTrust = hero ? trustOf(hero) : null;
  const heroFp = hero ? fairPriceOf(hero) : null;
  const heroTco = hero
    ? computeTco(hero, { kmPerYear: 15000, years: 3, coverage: "tiers", includeDepreciation: false })
    : null;

  const makes = stats.makes;
  const topCities = CITIES
    .map((c) => ({ ...c, n: stats.byCity[c.slug] ?? 0 }))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n);

  return (
    <>
      {/* ================= البطل ================= */}
      <section className="relative">
        <div className="relative min-h-[560px] overflow-hidden sm:min-h-[680px]" style={{ background: "#040c1a" }}>
          <img
            src="/hero-vehicles.webp"
            srcSet="/hero-vehicles-sm.webp 900w, /hero-vehicles.webp 1774w"
            sizes="100vw"
            alt="سيارة ودراجة نارية في صالة عرض"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[42%_center] sm:object-[38%_center]"
          />
          {/* حجاب متدرّج من جهة النص */}
          {/* الشاشات الكبيرة: حجاب أفقي من جهة النص */}
          <div
            className="absolute inset-0 hidden sm:block"
            style={{
              background:
                "linear-gradient(to left, rgba(4,12,26,0.985) 0%, rgba(4,12,26,0.96) 30%, rgba(4,12,26,0.82) 44%, rgba(4,12,26,0.42) 62%, rgba(4,12,26,0.12) 82%, rgba(4,12,26,0) 100%)",
            }}
          />
          {/* الموبايل: حجاب عمودي يبقي المركبة ظاهرة في الأعلى */}
          <div
            className="absolute inset-0 sm:hidden"
            style={{
              background:
                "linear-gradient(to top, rgba(4,12,26,0.96) 22%, rgba(4,12,26,0.78) 42%, rgba(4,12,26,0.3) 70%, rgba(4,12,26,0.06) 100%)",
            }}
          />
          {/* اندماج مع خلفية الصفحة */}
          <div
            className="absolute inset-x-0 bottom-0 h-36"
            style={{ background: "linear-gradient(to top, var(--bg) 4%, rgba(4,12,26,0) 100%)" }}
          />
          {/* توهج أزرق خفيف أعلى اليمين */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2"
            style={{
              background:
                "radial-gradient(60% 55% at 78% 30%, rgba(31,95,224,0.22) 0%, transparent 70%)",
            }}
          />

          <div className="relative mx-auto flex min-h-[560px] max-w-[1400px] items-end px-4 pt-24 pb-40 sm:min-h-[680px] sm:items-center sm:pt-24 sm:pb-52">
            <div className="max-w-2xl">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold"
                style={{
                  background: "rgba(31,95,224,0.18)",
                  border: "1px solid rgba(90,142,247,0.35)",
                  color: "#9fc0ff",
                }}
              >
                <Sparkle size={13} /> منصة مغربية · بدون عمولة على المشتري
              </span>

              <h1 className="h-page mt-5 text-balance text-white">
                شري طوموبيلك ولا موطورك
                <br />
                <span style={{ color: "#5a8ef7" }}>وأنت عارف كلشي</span>
              </h1>

              <p
                className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed sm:text-base"
                style={{ color: "#b9c9e4" }}
              >
                أول سوق مغربي كيعطيك <b className="text-white">مؤشر ثقة</b> لكل إعلان،{" "}
                <b className="text-white">ثمناً مرجعياً</b> محسوباً من السوق، و
                <b className="text-white">التكلفة الحقيقية</b> ديال المركبة قبل ما تدفع درهم واحد.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/cars" className="btn btn-primary btn-lg">
                  <Car size={17} /> تصفح المركبات
                </Link>
                <Link
                  href="/safety"
                  className="btn btn-lg"
                  style={{ border: "1px solid rgba(255,255,255,0.28)", color: "#fff" }}
                >
                  كيفاش كنخدمو <ArrowLeft size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* بطاقة البحث المتراكبة */}
        <div className="relative z-10 mx-auto -mt-28 max-w-[1400px] px-4 sm:-mt-32">
          <div className="card-raised p-4 sm:p-5">
            <SmartSearch big />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {QUICK.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[12.5px] font-bold transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:text-[var(--brand)]"
                style={{
                  borderColor: "var(--line)",
                  background: "var(--surface-1)",
                  color: "var(--text-muted)",
                }}
              >
                <Icon size={16} style={{ color: "var(--brand)" }} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="mx-auto max-w-[1400px] px-4 pt-14">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { k: formatNumber(cars), l: "سيارة معروضة", Icon: Car },
              { k: formatNumber(motos), l: "دراجة نارية", Icon: Moto },
              // متوسط الثقة ماعندو معنى بلا إعلانات
              { k: avgTrust > 0 ? `${avgTrust}/100` : "—", l: "متوسط مؤشر الثقة", Icon: ShieldCheck },
              { k: formatNumber(topCities.length || CITIES.length), l: "مدينة مغربية", Icon: MapPin },
            ].map((s) => (
              <div key={s.l} className="card flex items-center gap-3 p-4">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                >
                  <s.Icon size={18} />
                </span>
                <div className="min-w-0">
                  <dt className="num text-xl font-extrabold">{s.k}</dt>
                  <dd className="truncate text-[11px]" style={{ color: "var(--text-dim)" }}>{s.l}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* شريط الضمانات */}
        <div className="mx-auto max-w-[1400px] px-4 pt-4 pb-12">
          <div
            className="grid gap-3 rounded-2xl p-5 sm:grid-cols-2 lg:grid-cols-4"
            style={{ background: "var(--brand-soft)", border: "1px solid var(--line-soft)" }}
          >
            {[
              { Icon: ShieldCheck, t: "مركبات موثّقة", d: "وثائق ورقم هيكل مُتحقّق منهما" },
              { Icon: BadgeCheck, t: "بائعون موثوقون", d: "هوية موثقة وتقييمات حقيقية" },
              { Icon: Scale, t: "ثمن شفّاف", d: "مرجع محسوب من السوق" },
              { Icon: Wrench, t: "فحص مستقل", d: "120 نقطة قبل الشراء" },
            ].map((f) => (
              <div key={f.t} className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{ background: "var(--surface-1)", color: "var(--brand)" }}
                >
                  <f.Icon size={20} />
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold">{f.t}</div>
                  <div className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden border-y py-4" style={{ borderColor: "var(--line-soft)" }}>
          <div className="marquee-track gap-9 px-4">
            {[...makes, ...makes].map((m, i) => (
              <span key={`${m}-${i}`} className="num whitespace-nowrap text-[13px] font-bold opacity-25">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= التصنيفات ================= */}
      <section className="mx-auto max-w-[1400px] px-4 py-16">
        <h2 className="h-section mb-7">تصفّح حسب النوع</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {CATEGORIES.map((c) => {
            const n = stats.byBody[c.key] ?? 0;
            if (!n) return null;
            return (
              <Link
                key={c.key}
                href={`${c.kind === "moto" ? "/motorcycles" : "/cars"}?body=${c.key}`}
                className="card card-hover group flex flex-col items-center gap-2 p-5 text-center"
              >
                <span
                  className="grid h-14 w-16 place-items-center rounded-xl transition-colors"
                  style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
                >
                  <VehicleGlyph
                    shape={c.key as never}
                    kind={c.kind}
                    size={30}
                    strokeWidth={10}
                    className="transition-colors group-hover:text-[var(--brand)]"
                  />
                </span>
                <span className="text-[12.5px] font-bold">{c.label}</span>
                <span className="num text-[10.5px]" style={{ color: "var(--text-dim)" }}>{n} إعلان</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= سيارات مميزة ================= */}
      {featuredCars.length > 0 && (
      <section className="border-y" style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-[1400px] px-4 py-16">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="eyebrow"><Car size={13} /> سيارات</span>
              <h2 className="h-section mt-3">سيارات مميزة</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                مركبات ثمنها تحت المرجع المحسوب، مرتّبة حسب الفارق.
              </p>
            </div>
            <Link href="/cars?deals=1" className="btn btn-ghost btn-sm">كل السيارات <ArrowLeft size={14} /></Link>
          </header>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredCars.map((v) => <VehicleCard key={v.id} v={v} compact />)}
          </div>
        </div>
      </section>
      )}

      {/* ================= دراجات مميزة ================= */}
      {featuredMotos.length > 0 && (
      <section>
        <div className="mx-auto max-w-[1400px] px-4 py-16">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="eyebrow"><Moto size={13} /> دراجات نارية</span>
              <h2 className="h-section mt-3">دراجات مميزة</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                من السكوتر ديال المدينة حتى دراجات الطرق الوعرة.
              </p>
            </div>
            <Link href="/motorcycles" className="btn btn-ghost btn-sm">كل الدراجات <ArrowLeft size={14} /></Link>
          </header>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredMotos.map((v) => <VehicleCard key={v.id} v={v} compact />)}
          </div>
        </div>
      </section>
      )}

      <SuggestedForYou />

      {/* ================= الماركات ================= */}
      <section className="border-y" style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-[1400px] px-4 py-16">
          <h2 className="h-section mb-2">أشهر الماركات</h2>
          <p className="mb-7 text-sm" style={{ color: "var(--text-muted)" }}>
            كل ماركة عندها صفحتها بكل الإعلانات المتوفرة.
          </p>

          <h3 className="mb-3 flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-dim)" }}>
            <Car size={14} /> سيارات
          </h3>
          <div className="mb-8 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
            {carTiles.map((b) => (
              <BrandTile
                key={b.slug}
                name={b.make}
                count={b.count}
                href={`/cars/${b.slug}`}
              />
            ))}
          </div>

          <h3 className="mb-3 flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-dim)" }}>
            <Moto size={14} /> دراجات نارية
          </h3>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
            {motoTiles.map((b) => (
              <BrandTile
                key={b.slug}
                name={b.make}
                count={b.count}
                href={`/motorcycles/${b.slug}`}
                kind="moto"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= المدن ================= */}
      {topCities.length > 0 && (
      <section className="mx-auto max-w-[1400px] px-4 py-16">
        <h2 className="h-section mb-2">المركبات حسب المدينة</h2>
        <p className="mb-7 text-sm" style={{ color: "var(--text-muted)" }}>
          الإعلانات موزّعة على <span className="num">{topCities.length}</span> مدينة مغربية.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {topCities.slice(0, 12).map((c) => (
            <Link
              key={c.slug}
              href={`/cars?city=${c.slug}`}
              className="card card-hover flex items-center gap-2.5 p-4"
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
              >
                <MapPin size={16} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-bold">{c.ar}</span>
                <span className="num text-[10px]" style={{ color: "var(--text-dim)" }}>{c.n} إعلان</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* ================= الوكلاء ================= */}
      {topDealers.length > 0 && (
      <section className="border-y" style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-[1400px] px-4 py-16">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="eyebrow"><Users size={13} /> بائعون محترفون</span>
              <h2 className="h-section mt-3">وكلاء ومعارض موثّقة</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                معارض بهوية تجارية موثقة ومخزون محيّن.
              </p>
            </div>
            <Link href="/dealers" className="btn btn-ghost btn-sm">كل الوكلاء <ArrowLeft size={14} /></Link>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topDealers.map(({ d, count }) => (
              <Link key={d.slug} href={`/dealer/${d.slug}`} className="card card-hover overflow-hidden">
                <div
                  className="relative h-16"
                  style={{ background: `linear-gradient(120deg, ${d.cover[0]}, ${d.cover[1]})` }}
                >
                  <span
                    className="absolute -bottom-5 right-4 grid h-11 w-11 place-items-center rounded-xl border-2 text-base font-extrabold"
                    style={{ background: "var(--surface-1)", borderColor: "var(--surface-1)", color: "var(--brand)" }}
                  >
                    {d.name.trim().slice(0, 1)}
                  </span>
                </div>
                <div className="p-4 pt-7">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-[13px] font-bold">{d.name}</h3>
                    <BadgeCheck size={13} className="shrink-0" style={{ color: "var(--good)" }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="chip chip-plain"><MapPin size={10} /> {cityName(d.city)}</span>
                    <span className="chip chip-plain">
                      <Star size={10} filled style={{ color: "var(--warn)" }} />
                      <span className="num">{d.rating.toFixed(1)}</span>
                    </span>
                    <span className="chip chip-plain"><Car size={10} /> <span className="num">{count}</span></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ================= علاش طريق ================= */}
      <section className="mx-auto max-w-[1400px] px-4 py-16">
        <header className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow"><Sparkle size={13} /> الفرق</span>
            <h2 className="h-section mt-3">علاش طريق ماشي بحال الآخرين</h2>
            <p className="mt-2 max-w-xl text-sm" style={{ color: "var(--text-muted)" }}>
              المواقع الأخرى كتعرض عليك إعلانات. حنا كنعطيوك المعلومات اللي كتخليك تقرر:
              الثقة، الثمن، والتكلفة.
            </p>
          </div>
          <Link href="/about" className="btn btn-ghost btn-sm">من نحن <ArrowLeft size={14} /></Link>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((p) => (
            <article key={p.title} className="card card-hover group relative overflow-hidden p-6">
              <div
                className="absolute -left-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-opacity group-hover:opacity-100"
                style={{ background: `color-mix(in oklab, ${p.color} 22%, transparent)`, opacity: 0.4 }}
              />
              <div className="relative">
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl"
                  style={{ background: `color-mix(in oklab, ${p.color} 14%, transparent)`, color: p.color }}
                >
                  <p.Icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-bold" style={{ color: p.color }}>{p.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {p.text}
                </p>
                <Link
                  href={p.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold transition-all hover:gap-2.5"
                  style={{ color: p.color }}
                >
                  {p.cta} <ArrowLeft size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ================= مثال حي ================= */}
      {hero && heroTrust && heroFp && heroTco && (
      <section className="border-y" style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}>
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-20 lg:grid-cols-2">
          <div>
            <span className="eyebrow"><Sparkle size={13} /> مثال حقيقي من المنصة</span>
            <h2 className="h-section mt-3">هكذا كتبان ليك المركبة قبل ما تتصل بالبائع</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              خُذ {hero.make} {hero.model} <span className="num">{hero.year}</span>: بدل ما تخمّن،
              كتشوف نقطة الثقة مفصّلة، موقع الثمن من السوق، وشحال غادي تصرف عليها فالسنة.
            </p>

            <div className="mt-7 space-y-3.5">
              {heroTrust.parts.slice(0, 4).map((part) => (
                <div key={part.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">{part.label}</span>
                    <span className="num" style={{ color: "var(--text-dim)" }}>
                      {part.score}/{part.max}
                    </span>
                  </div>
                  <div className="meter mt-1.5" style={{ height: 5 }}>
                    <i style={{ width: `${(part.score / part.max) * 100}%`, background: "var(--brand)" }} />
                  </div>
                </div>
              ))}
            </div>

            <Link href={vehicleHref(hero)} className="btn btn-primary mt-8">
              شوف الإعلان كاملاً <ArrowLeft size={15} />
            </Link>
          </div>

          <div className="card-raised overflow-hidden">
            <div className="relative aspect-[16/10]">
              <VehicleArt
                id={hero.id}
                kind={hero.kind}
                body={artShape(hero)}
                color={hero.color}
                className="h-full w-full"
                label={`${hero.make} ${hero.model}`}
              />
              <span className="tag absolute top-3 right-3" style={{ background: "var(--good)", color: "#fff" }}>
                <BadgeCheck size={12} /> مفحوصة من طريق
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold">{hero.make} {hero.model}</h3>
                  <p className="mt-0.5 truncate text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                    {hero.version} · <span className="num">{hero.year}</span>
                  </p>
                </div>
                <TrustRing score={heroTrust.score} grade={heroTrust.grade} size={54} stroke={5} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "مؤشر الثقة", value: `${heroTrust.score}/100`, color: "var(--good)", Icon: ShieldCheck },
                  {
                    label: "مقابل السوق",
                    value: `${heroFp.delta < 0 ? "−" : "+"}${Math.abs(Math.round(heroFp.delta * 100))}٪`,
                    color: heroFp.delta < 0 ? "var(--good)" : "var(--bad)",
                    Icon: Scale,
                  },
                  { label: "د.م / شهر", value: formatNumber(heroTco.perMonth), color: "var(--data)", Icon: Calculator },
                ].map((st) => (
                  <div key={st.label} className="rounded-xl p-3 text-center" style={{ background: "var(--surface-3)" }}>
                    <st.Icon size={15} className="mx-auto" style={{ color: st.color }} />
                    <div className="num mt-1.5 text-[15px] font-extrabold" style={{ color: st.color }}>
                      {st.value}
                    </div>
                    <div className="mt-0.5 text-[9.5px]" style={{ color: "var(--text-dim)" }}>{st.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ================= الأدلة ================= */}
      <section>
        <div className="mx-auto max-w-[1400px] px-4 py-16">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="eyebrow"><FileText size={13} /> معرفة قبل الشراء</span>
              <h2 className="h-section mt-3">أدلة ونصائح</h2>
            </div>
            <Link href="/guides" className="btn btn-ghost btn-sm">كل الأدلة <ArrowLeft size={14} /></Link>
          </header>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {topGuides.map((g) => {
              const GIcon = GUIDE_ICONS[g.icon];
              return (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="card card-hover group flex flex-col p-5">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl"
                  style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                >
                  <GIcon size={19} />
                </span>
                <h3 className="mt-4 text-[14px] font-bold leading-snug transition-colors group-hover:text-[var(--brand)]">
                  {g.title}
                </h3>
                <p className="mt-2 flex-1 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {g.excerpt}
                </p>
                <span
                  className="mt-3 flex items-center gap-1 text-[10.5px]"
                  style={{ color: "var(--text-dim)" }}
                >
                  <Clock size={11} /> <span className="num">{g.readMinutes}</span> دقائق
                </span>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= نداء البيع ================= */}
      <section className="mx-auto max-w-[1400px] px-4 pb-24">
        <div className="zellige card-raised relative overflow-hidden p-10 text-center sm:p-16">
          <div className="glow pointer-events-none absolute inset-0" />
          <div className="relative">
            <span
              className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
              style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
            >
              <Wallet size={26} />
            </span>
            <h2 className="h-section mt-6">بغيتي تبيع؟ خلّي الأرقام تتكلّم</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              نشر الإعلان مجاني. كنعطيوك ثمناً مقترحاً مبنياً على السوق، وكنبيّنو ليك مباشرة
              كيفاش تزيد نقطة الثقة ديالك باش تبيع بسرعة وبثمن مزيان.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/sell" className="btn btn-primary btn-lg">انشر إعلانك مجاناً</Link>
              <Link href="/valuation" className="btn btn-ghost btn-lg">قيّم مركبتك أولاً</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
