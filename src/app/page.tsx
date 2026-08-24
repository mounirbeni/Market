import Link from "next/link";
import { SmartSearch } from "@/components/SmartSearch";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleArt } from "@/components/VehicleArt";
import { artShape } from "@/lib/artshape";
import { TrustRing } from "@/components/TrustBadge";
import { applyFilters } from "@/lib/search";
import { VEHICLES } from "@/lib/data/vehicles";
import { trustOf, fairPriceOf } from "@/lib/market";
import { computeTco } from "@/lib/tco";
import { formatDh, formatNumber } from "@/lib/format";
import { CITIES } from "@/lib/cities";

const PILLARS = [
  {
    icon: "🛡️",
    title: "مؤشر الثقة",
    color: "var(--color-atlas-400)",
    text: "كل إعلان كيتنقّط على 100 حسب توثيق البائع، الوثائق، سجل المركبة، شفافية الإعلان واتساق المعطيات. كتشوف النقطة قبل ما تتصل.",
    href: "/vehicles?trustMin=75",
    cta: "شوف المركبات عالية الثقة",
  },
  {
    icon: "⚖️",
    title: "الثمن العادل",
    color: "var(--color-saffron-400)",
    text: "كنحسبو ثمناً مرجعياً من إعلانات مشابهة بعد تعديل السنة والكيلومتراج والحالة، وكنقولو ليك واش هاد الثمن فوق ولا تحت السوق.",
    href: "/estimate",
    cta: "قيّم مركبتك مجاناً",
  },
  {
    icon: "🧮",
    title: "التكلفة الحقيقية",
    color: "var(--color-majorelle-400)",
    text: "ماشي غير ثمن الشراء: الفينيات، التأمين، المازوط، الصيانة، الإطارات وخسارة القيمة — كلشي محسوب بالدرهم فالسنة وبالدرهم للكيلومتر.",
    href: "/cost",
    cta: "حسب التكلفة",
  },
];

export default function HomePage() {
  const deals = applyFilters({ sort: "deal" }).slice(0, 6);
  const fresh = applyFilters({ sort: "recent" }).slice(0, 4);
  const inspected = applyFilters({ inspectedOnly: true, sort: "trust-desc" }).slice(0, 4);

  const cars = VEHICLES.filter((v) => v.kind === "car");
  const motos = VEHICLES.filter((v) => v.kind === "moto");
  const avgTrust = Math.round(
    VEHICLES.reduce((s, v) => s + trustOf(v).score, 0) / VEHICLES.length,
  );

  // مثال حي لمؤشر الثقة
  const showcase = [...VEHICLES].sort((a, b) => trustOf(b).score - trustOf(a).score)[0];
  const showcaseTrust = trustOf(showcase);
  const showcaseFp = fairPriceOf(showcase);
  const showcaseTco = computeTco(showcase, {
    kmPerYear: 15000,
    years: 3,
    coverage: "tiers",
    includeDepreciation: false,
  });

  const makes = Array.from(new Set(VEHICLES.map((v) => v.make)));

  const bodies = [
    { key: "citadine", label: "مدينية", kind: "car" },
    { key: "berline", label: "صالون", kind: "car" },
    { key: "suv", label: "دفع رباعي", kind: "car" },
    { key: "pickup", label: "بيك أب", kind: "car" },
    { key: "utilitaire", label: "نفعية", kind: "car" },
    { key: "scooter", label: "سكوتر", kind: "moto" },
    { key: "trail", label: "طرق وعرة", kind: "moto" },
    { key: "roadster", label: "رودستر", kind: "moto" },
    { key: "custom", label: "كوستوم", kind: "moto" },
  ] as const;

  return (
    <>
      {/* ================= البطل ================= */}
      <section className="zellige relative overflow-hidden">
        <div className="glow-saffron pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-14 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip mx-auto !border-[color-mix(in_oklab,var(--accent)_40%,transparent)] !text-[var(--accent)]">
              منصة مغربية · بدون عمولة على المشتري
            </span>
            <h1 className="mt-5 text-balance text-4xl font-black leading-[1.15] sm:text-6xl">
              شري طوموبيلك ولا موطورك
              <br />
              <span style={{ color: "var(--accent)" }}>وأنت عارف كلشي</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg"
              style={{ color: "var(--text-muted)" }}>
              أول سوق مغربي كيعطيك <b>مؤشر ثقة</b> لكل إعلان، <b>ثمناً مرجعياً</b> محسوباً من
              السوق، و<b>التكلفة الحقيقية</b> ديال المركبة قبل ما تدفع درهم واحد.
            </p>
          </div>

          <div className="mx-auto mt-9 max-w-3xl">
            <SmartSearch big />
          </div>

          <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { k: formatNumber(cars.length), l: "سيارة معروضة" },
              { k: formatNumber(motos.length), l: "دراجة نارية" },
              { k: `${avgTrust}/100`, l: "متوسط مؤشر الثقة" },
              { k: formatNumber(CITIES.length), l: "مدينة مغربية" },
            ].map((s) => (
              <div key={s.l} className="card p-4 text-center">
                <dt className="num text-2xl font-black" style={{ color: "var(--accent)" }}>{s.k}</dt>
                <dd className="mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* شريط الماركات */}
        <div className="relative overflow-hidden border-y py-4" style={{ borderColor: "var(--line-soft)" }}>
          <div className="marquee-track gap-8 px-4">
            {[...makes, ...makes].map((m, i) => (
              <span key={`${m}-${i}`} className="num whitespace-nowrap text-sm font-bold opacity-35">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= الركائز ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="section-title">علاش طريق ماشي بحال الآخرين</h2>
            <p className="mt-2 max-w-xl text-sm" style={{ color: "var(--text-muted)" }}>
              المواقع الأخرى كتعرض عليك إعلانات. حنا كنعطيوك المعلومات اللي كتخليك تقرر:
              الثقة، الثمن، والتكلفة.
            </p>
          </div>
          <Link href="/safety" className="btn btn-ghost btn-sm">كيفاش كنخدمو</Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="card card-hover p-6">
              <div
                className="grid h-11 w-11 place-items-center rounded-xl text-xl"
                style={{ background: `color-mix(in oklab, ${p.color} 15%, transparent)` }}
              >
                {p.icon}
              </div>
              <h3 className="mt-4 text-lg font-extrabold" style={{ color: p.color }}>{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {p.text}
              </p>
              <Link
                href={p.href}
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold transition hover:gap-2"
                style={{ color: p.color }}
              >
                {p.cta} ←
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= مثال حي ================= */}
      <section className="border-y" style={{ borderColor: "var(--line-soft)", background: "var(--bg-raised)" }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="chip">مثال حقيقي من المنصة</span>
            <h2 className="section-title mt-4">
              هكذا كتبان ليك المركبة قبل ما تتصل بالبائع
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              خُذ {showcase.make} {showcase.model} {showcase.year}: بدل ما تخمّن، كتشوف
              نقطة الثقة مفصّلة، موقع الثمن من السوق، وشحال غادي تصرف عليها فالسنة.
            </p>

            <div className="mt-6 space-y-3">
              {showcaseTrust.parts.slice(0, 4).map((part) => (
                <div key={part.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">{part.label}</span>
                    <span className="num" style={{ color: "var(--text-dim)" }}>
                      {part.score}/{part.max}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full" style={{ background: "var(--bg-inset)" }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${(part.score / part.max) * 100}%`,
                        background: "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link href={`/vehicles/${showcase.id}`} className="btn btn-primary mt-7">
              شوف الإعلان كاملاً
            </Link>
          </div>

          <div className="card overflow-hidden">
            <div className="relative aspect-[16/9]">
              <VehicleArt
                id={showcase.id}
                kind={showcase.kind}
                body={showcase.body}
                className="h-full w-full"
                label={`${showcase.make} ${showcase.model}`}
              />
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <TrustRing score={showcaseTrust.score} grade={showcaseTrust.grade} size={72} />
                <span className="mt-2 text-[11px]" style={{ color: "var(--text-dim)" }}>مؤشر الثقة</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <span className="num text-xl font-black" style={{ color: "var(--color-saffron-400)" }}>
                  {showcaseFp.delta < 0 ? "−" : "+"}
                  {Math.abs(Math.round(showcaseFp.delta * 100))}٪
                </span>
                <span className="mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
                  مقارنة بثمن السوق
                </span>
                <span className="num mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  المرجع {formatDh(showcaseFp.estimate.mid)}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <span className="num text-xl font-black" style={{ color: "var(--color-majorelle-400)" }}>
                  {formatNumber(showcaseTco.perMonth)}
                </span>
                <span className="mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
                  درهم/شهر تكلفة استعمال
                </span>
                <span className="num mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {showcaseTco.perKm.toFixed(2)} د.م/كم
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= أحسن الصفقات ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title">أحسن الصفقات ديال هاد الأسبوع</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              مركبات ثمنها تحت المرجع ديال السوق، مرتّبة حسب الفارق.
            </p>
          </div>
          <Link href="/vehicles?deals=1" className="btn btn-ghost btn-sm">الكل ←</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((v) => (
            <VehicleCard key={v.id} v={v} />
          ))}
        </div>
      </section>

      {/* ================= التصنيفات ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <h2 className="section-title mb-6">تصفّح حسب النوع</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {bodies.map((b) => {
            const n = VEHICLES.filter((v) =>
              b.key === "pickup"
                ? artShape(v) === "pickup"
                : b.key === "utilitaire"
                  ? v.body === "utilitaire" && artShape(v) !== "pickup"
                  : v.body === b.key,
            ).length;
            return (
              <Link
                key={b.key}
                href={`/vehicles?body=${b.key === "pickup" ? "utilitaire" : b.key}&kind=${b.kind}`}
                className="card card-hover overflow-hidden"
              >
                <div className="aspect-[16/9]">
                  <VehicleArt
                    id={`cat-${b.key}`}
                    kind={b.kind === "moto" ? "moto" : "car"}
                    body={b.key as never}
                    className="h-full w-full"
                    label={b.label}
                  />
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm font-extrabold">{b.label}</span>
                  <span className="num text-xs" style={{ color: "var(--text-dim)" }}>{n}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= مفحوصة + جديدة ================= */}
      <section className="border-y" style={{ borderColor: "var(--line-soft)", background: "var(--bg-raised)" }}>
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="mb-8 flex items-end justify-between gap-3">
            <div>
              <h2 className="section-title">مفحوصة من طرف طريق</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                ١٢٠ نقطة فحص ميكانيكي وهيكلي، بتقرير مفصّل مرفق بالإعلان.
              </p>
            </div>
            <Link href="/inspection" className="btn btn-ghost btn-sm">كيفاش؟</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {inspected.map((v) => (
              <VehicleCard key={v.id} v={v} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-8 flex items-end justify-between gap-3">
          <h2 className="section-title">وصلات جديدة</h2>
          <Link href="/vehicles?sort=recent" className="btn btn-ghost btn-sm">الكل ←</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {fresh.map((v) => (
            <VehicleCard key={v.id} v={v} compact />
          ))}
        </div>
      </section>

      {/* ================= نداء البيع ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="zellige card relative overflow-hidden p-10 text-center sm:p-16">
          <div className="glow-saffron pointer-events-none absolute inset-0" />
          <div className="relative">
            <h2 className="text-3xl font-black sm:text-4xl">بغيتي تبيع؟ خلّي الأرقام تتكلّم</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              نشر الإعلان مجاني. كنعطيوك ثمناً مقترحاً مبنياً على السوق، وكنبيّنو ليك
              مباشرة كيفاش تزيد نقطة الثقة ديالك باش تبيع بسرعة وبثمن مزيان.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/sell" className="btn btn-primary">انشر إعلانك مجاناً</Link>
              <Link href="/estimate" className="btn btn-ghost">قيّم مركبتك أولاً</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
