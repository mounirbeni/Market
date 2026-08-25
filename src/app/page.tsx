import Link from "next/link";
import { SmartSearch } from "@/components/SmartSearch";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleArt, VehicleGlyph } from "@/components/VehicleArt";
import { TrustRing } from "@/components/TrustBadge";
import { artShape } from "@/lib/artshape";
import { applyFilters } from "@/lib/search";
import { VEHICLES } from "@/lib/data/vehicles";
import { trustOf, fairPriceOf } from "@/lib/market";
import { computeTco } from "@/lib/tco";
import { formatNumber } from "@/lib/format";
import { CITIES } from "@/lib/cities";
import {
  ArrowLeft, BadgeCheck, Calculator, Car, MapPin, Moto, Scale, ShieldCheck,
  Sparkle, TrendingDown, Wallet, Wrench,
} from "@/components/icons";

const PILLARS = [
  {
    Icon: ShieldCheck,
    title: "مؤشر الثقة",
    color: "var(--good)",
    text: "كل إعلان كيتنقّط على 100 حسب توثيق البائع، الوثائق، سجل المركبة، شفافية الإعلان واتساق المعطيات. كتشوف النقطة قبل ما تتصل.",
    href: "/vehicles?trustMin=75",
    cta: "شوف المركبات عالية الثقة",
  },
  {
    Icon: Scale,
    title: "الثمن العادل",
    color: "var(--brand)",
    text: "كنحسبو ثمناً مرجعياً من إعلانات مشابهة بعد تعديل السنة والكيلومتراج والحالة، وكنقولو ليك واش هاد الثمن فوق ولا تحت السوق.",
    href: "/estimate",
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
  { href: "/vehicles?kind=car", label: "سيارات", Icon: Car },
  { href: "/vehicles?kind=moto", label: "دراجات نارية", Icon: Moto },
  { href: "/vehicles?deals=1", label: "أحسن الصفقات", Icon: TrendingDown },
  { href: "/vehicles?inspected=1", label: "مفحوصة", Icon: BadgeCheck },
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

export default function HomePage() {
  const deals = applyFilters({ sort: "deal" }).slice(0, 6);
  const inspected = applyFilters({ inspectedOnly: true, sort: "trust-desc" }).slice(0, 4);
  const cars = VEHICLES.filter((v) => v.kind === "car").length;
  const motos = VEHICLES.filter((v) => v.kind === "moto").length;
  const avgTrust = Math.round(VEHICLES.reduce((s, v) => s + trustOf(v).score, 0) / VEHICLES.length);

  const hero = [...VEHICLES]
    .filter((v) => v.inspected && v.photos > 8)
    .sort((a, b) => trustOf(b).score - trustOf(a).score)[0] ?? VEHICLES[0];
  const heroTrust = trustOf(hero);
  const heroFp = fairPriceOf(hero);
  const heroTco = computeTco(hero, { kmPerYear: 15000, years: 3, coverage: "tiers", includeDepreciation: false });

  const makes = Array.from(new Set(VEHICLES.map((v) => v.make)));
  const topCities = CITIES
    .map((c) => ({ ...c, n: VEHICLES.filter((v) => v.city === c.slug).length }))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n);

  return (
    <>
      {/* ================= البطل ================= */}
      <section className="zellige relative overflow-hidden">
        <div className="glow pointer-events-none absolute inset-x-0 top-0 h-[560px]" />
        <div className="glow-data pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-[1400px] px-4 pt-14 pb-16 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            {/* النص */}
            <div>
              <span className="eyebrow">
                <Sparkle size={14} /> منصة مغربية · بدون عمولة على المشتري
              </span>
              <h1 className="h-page mt-5 text-balance">
                شري طوموبيلك ولا موطورك
                <br />
                <span style={{ color: "var(--brand)" }}>وأنت عارف كلشي</span>
              </h1>
              <p
                className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed sm:text-base"
                style={{ color: "var(--text-muted)" }}
              >
                أول سوق مغربي كيعطيك <b style={{ color: "var(--text)" }}>مؤشر ثقة</b> لكل إعلان،{" "}
                <b style={{ color: "var(--text)" }}>ثمناً مرجعياً</b> محسوباً من السوق، و
                <b style={{ color: "var(--text)" }}>التكلفة الحقيقية</b> ديال المركبة قبل ما
                تدفع درهم واحد.
              </p>

              <div className="mt-8 max-w-2xl"><SmartSearch big /></div>

              <div className="mt-8 flex flex-wrap gap-2">
                {QUICK.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[12.5px] font-bold transition hover:-translate-y-0.5"
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

            {/* بطاقة العرض */}
            <div className="relative mx-auto w-full max-w-lg lg:mx-0">
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
                  <span
                    className="tag absolute top-3 right-3"
                    style={{ background: "var(--good)", color: "#fff" }}
                  >
                    <BadgeCheck size={12} /> مفحوصة من طريق
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold">{hero.make} {hero.model}</h2>
                      <p className="mt-0.5 truncate text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                        {hero.version} · <span className="num">{hero.year}</span>
                      </p>
                    </div>
                    <TrustRing score={heroTrust.score} grade={heroTrust.grade} size={54} stroke={5} />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      {
                        label: "مؤشر الثقة",
                        value: `${heroTrust.score}/100`,
                        color: "var(--good)",
                        Icon: ShieldCheck,
                      },
                      {
                        label: "مقابل السوق",
                        value: `${heroFp.delta < 0 ? "−" : "+"}${Math.abs(Math.round(heroFp.delta * 100))}٪`,
                        color: heroFp.delta < 0 ? "var(--good)" : "var(--bad)",
                        Icon: Scale,
                      },
                      {
                        label: "د.م / شهر",
                        value: formatNumber(heroTco.perMonth),
                        color: "var(--data)",
                        Icon: Calculator,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl p-3 text-center"
                        style={{ background: "var(--surface-3)" }}
                      >
                        <s.Icon size={15} className="mx-auto" style={{ color: s.color }} />
                        <div className="num mt-1.5 text-[15px] font-extrabold" style={{ color: s.color }}>
                          {s.value}
                        </div>
                        <div className="mt-0.5 text-[9.5px]" style={{ color: "var(--text-dim)" }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/vehicles/${hero.id}`}
                    className="mt-4 flex items-center justify-center gap-1.5 text-[12px] font-bold transition hover:gap-2.5"
                    style={{ color: "var(--brand)" }}
                  >
                    شوف الإعلان كاملاً <ArrowLeft size={14} />
                  </Link>
                </div>
              </div>

              <div
                className="pointer-events-none absolute -bottom-4 -left-4 -z-10 h-40 w-40 rounded-full blur-3xl"
                style={{ background: "color-mix(in oklab, var(--brand) 26%, transparent)" }}
              />
            </div>
          </div>

          {/* الإحصائيات */}
          <dl className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { k: formatNumber(cars), l: "سيارة معروضة", Icon: Car },
              { k: formatNumber(motos), l: "دراجة نارية", Icon: Moto },
              { k: `${avgTrust}/100`, l: "متوسط مؤشر الثقة", Icon: ShieldCheck },
              { k: formatNumber(topCities.length), l: "مدينة مغربية", Icon: MapPin },
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
        <div className="mx-auto max-w-[1400px] px-4 pb-14">
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

      {/* ================= الركائز ================= */}
      <section className="mx-auto max-w-[1400px] px-4 py-20">
        <header className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow"><Sparkle size={13} /> الفرق</span>
            <h2 className="h-section mt-3">علاش طريق ماشي بحال الآخرين</h2>
            <p className="mt-2 max-w-xl text-sm" style={{ color: "var(--text-muted)" }}>
              المواقع الأخرى كتعرض عليك إعلانات. حنا كنعطيوك المعلومات اللي كتخليك تقرر:
              الثقة، الثمن، والتكلفة.
            </p>
          </div>
          <Link href="/safety" className="btn btn-ghost btn-sm">كيفاش كنخدمو <ArrowLeft size={14} /></Link>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((p) => (
            <article key={p.title} className="card card-hover group relative overflow-hidden p-6">
              <div
                className="absolute -left-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-opacity group-hover:opacity-100"
                style={{ background: `color-mix(in oklab, ${p.color} 22%, transparent)`, opacity: 0.5 }}
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

      {/* ================= الصفقات ================= */}
      <section className="border-y" style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-[1400px] px-4 py-20">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="eyebrow"><TrendingDown size={13} /> تحت ثمن السوق</span>
              <h2 className="h-section mt-3">أحسن الصفقات ديال هاد الأسبوع</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                مركبات ثمنها أقل من المرجع المحسوب، مرتّبة حسب الفارق.
              </p>
            </div>
            <Link href="/vehicles?deals=1" className="btn btn-ghost btn-sm">الكل <ArrowLeft size={14} /></Link>
          </header>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((v) => <VehicleCard key={v.id} v={v} />)}
          </div>
        </div>
      </section>

      {/* ================= التصنيفات ================= */}
      <section className="mx-auto max-w-[1400px] px-4 py-20">
        <h2 className="h-section mb-7">تصفّح حسب النوع</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {CATEGORIES.map((c) => {
            const n = VEHICLES.filter((v) =>
              c.key === "utilitaire"
                ? v.body === "utilitaire"
                : v.body === c.key,
            ).length;
            if (!n) return null;
            return (
              <Link
                key={c.key}
                href={`/vehicles?body=${c.key}&kind=${c.kind}`}
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

      {/* ================= مفحوصة ================= */}
      <section className="border-y" style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-[1400px] px-4 py-20">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="eyebrow"><Wrench size={13} /> فحص مستقل</span>
              <h2 className="h-section mt-3">مفحوصة من طرف طريق</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <span className="num">120</span> نقطة فحص ميكانيكي وهيكلي، بتقرير مفصّل مرفق بالإعلان.
              </p>
            </div>
            <Link href="/inspection" className="btn btn-ghost btn-sm">كيفاش؟ <ArrowLeft size={14} /></Link>
          </header>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {inspected.map((v) => <VehicleCard key={v.id} v={v} compact />)}
          </div>
        </div>
      </section>

      {/* ================= المدن ================= */}
      <section className="mx-auto max-w-[1400px] px-4 py-20">
        <h2 className="h-section mb-3">حسب المدينة</h2>
        <p className="mb-7 text-sm" style={{ color: "var(--text-muted)" }}>
          كل الإعلانات موزّعة على <span className="num">{topCities.length}</span> مدينة مغربية.
        </p>
        <div className="flex flex-wrap gap-2">
          {topCities.map((c) => (
            <Link
              key={c.slug}
              href={`/vehicles?city=${c.slug}`}
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[12.5px] font-semibold transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:text-[var(--brand)]"
              style={{ borderColor: "var(--line-soft)", background: "var(--surface-1)", color: "var(--text-muted)" }}
            >
              <MapPin size={14} style={{ color: "var(--text-dim)" }} />
              {c.ar}
              <span className="num text-[10.5px] opacity-55">{c.n}</span>
            </Link>
          ))}
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
              <Link href="/estimate" className="btn btn-ghost btn-lg">قيّم مركبتك أولاً</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
