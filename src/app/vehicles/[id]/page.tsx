import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VEHICLES, vehicleById } from "@/lib/data/vehicles";
import { sellerById } from "@/lib/data/sellers";
import { fairPriceOf, trustOf } from "@/lib/market";
import { similarVehicles } from "@/lib/search";
import { cityName } from "@/lib/cities";
import { AR, formatDate, formatDh, formatKm, formatNumber, timeAgo } from "@/lib/format";
import { NOW } from "@/lib/data/seed";
import { Gallery } from "@/components/vehicle/Gallery";
import { TrustPanel } from "@/components/vehicle/TrustPanel";
import { TcoCalculator } from "@/components/vehicle/TcoCalculator";
import { CreditSimulator } from "@/components/vehicle/CreditSimulator";
import { HistoryTimeline } from "@/components/vehicle/HistoryTimeline";
import { SellerCard } from "@/components/vehicle/SellerCard";
import { FairPriceMeter } from "@/components/FairPriceMeter";
import { VehicleCard } from "@/components/VehicleCard";
import { Price } from "@/components/Price";
import { TrustRing } from "@/components/TrustBadge";

export function generateStaticParams() {
  return VEHICLES.map((v) => ({ id: v.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const v = vehicleById(id);
  if (!v) return { title: "إعلان غير موجود" };
  const title = `${v.make} ${v.model} ${v.version} ${v.year} — ${formatDh(v.price)} في ${cityName(v.city)}`;
  return {
    title,
    description: `${AR.kind[v.kind]} ${v.make} ${v.model} موديل ${v.year}، ${formatKm(v.km)}، ${AR.fuel[v.fuel]}، ${AR.gearbox[v.gearbox]}. مؤشر ثقة ${trustOf(v).score}/100 وثمن مرجعي محسوب.`,
    openGraph: { title, type: "article" },
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const v = vehicleById(id);
  if (!v) notFound();

  const seller = sellerById(v.sellerId);
  const trust = trustOf(v);
  const fp = fairPriceOf(v);
  const similar = similarVehicles(v);

  const specs: [string, string][] = [
    ["السنة", String(v.year)],
    ["الكيلومتراج", formatKm(v.km)],
    ["الوقود", AR.fuel[v.fuel]],
    ["ناقل السرعة", AR.gearbox[v.gearbox]],
    ["الهيكل", AR.body[v.body]],
    ["الحالة", AR.condition[v.condition]],
    ["اللون", v.color],
    ...(v.kind === "car"
      ? ([
          ["القوة الجبائية", `${v.fiscalPower} حصان`],
          ["الأبواب", String(v.doors ?? "-")],
          ["الاستهلاك", `${v.consumption} ل/100كم`],
        ] as [string, string][])
      : ([
          ["سعة المحرك", `${v.displacement} سم³`],
          ["القوة الجبائية", `${v.fiscalPower} حصان`],
          ["الاستهلاك", `${v.consumption} ل/100كم`],
        ] as [string, string][])),
    ["عدد الملاّك", String(v.owners)],
    ["الفحص التقني", `صالح إلى ${formatDate(v.technicalControl)}`],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": v.kind === "car" ? "Car" : "Motorcycle",
    name: `${v.make} ${v.model} ${v.version}`,
    brand: { "@type": "Brand", name: v.make },
    model: v.model,
    vehicleModelDate: String(v.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.km, unitCode: "KMT" },
    fuelType: AR.fuel[v.fuel],
    vehicleTransmission: AR.gearbox[v.gearbox],
    color: v.color,
    offers: {
      "@type": "Offer",
      price: v.price,
      priceCurrency: "MAD",
      availability: "https://schema.org/InStock",
      areaServed: cityName(v.city),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
        <Link href="/" className="hover:text-[var(--accent)]">الرئيسية</Link>
        <span>›</span>
        <Link href={`/vehicles?kind=${v.kind}`} className="hover:text-[var(--accent)]">
          {v.kind === "car" ? "سيارات" : "دراجات نارية"}
        </Link>
        <span>›</span>
        <Link href={`/vehicles?kind=${v.kind}&make=${v.make}`} className="hover:text-[var(--accent)]">
          {v.make}
        </Link>
        <span>›</span>
        <span style={{ color: "var(--text-muted)" }}>{v.model} {v.year}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ---------- العمود الرئيسي ---------- */}
        <div className="space-y-6">
          <Gallery v={v} />

          <header className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-black leading-tight">
                  {v.make} {v.model}
                </h1>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{v.version}</p>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="chip"><span className="num">{v.year}</span></span>
                  <span className="chip"><span className="num">{formatNumber(v.km)}</span> كم</span>
                  <span className="chip">{AR.fuel[v.fuel]}</span>
                  <span className="chip">{AR.gearbox[v.gearbox]}</span>
                  <span className="chip">📍 {cityName(v.city)}</span>
                </div>
              </div>
              <TrustRing score={trust.score} grade={trust.grade} size={64} />
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t pt-4"
              style={{ borderColor: "var(--line-soft)" }}>
              <div>
                <Price value={v.price} className="text-3xl font-black" />
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
                  {v.negotiable && <span className="chip">قابل للنقاش</span>}
                  {v.exchangeAccepted && <span className="chip">يقبل التبادل</span>}
                  {v.priceDrops.length > 0 && (
                    <span className="chip !text-[var(--color-atlas-400)]">
                      انخفض <span className="num">{formatNumber(v.priceDrops.reduce((a, b) => a + b, 0))}</span> د.م
                    </span>
                  )}
                </div>
              </div>
              <div className="text-left text-[11px]" style={{ color: "var(--text-dim)" }}>
                <div>نُشر {timeAgo(v.publishedAt, NOW)}</div>
                <div className="num">{formatNumber(v.views)} مشاهدة · {v.saves} حفظ</div>
              </div>
            </div>
          </header>

          <FairPriceMeter fp={fp} price={v.price} />

          <section className="card p-5">
            <h2 className="text-base font-extrabold">المواصفات</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {specs.map(([k, val]) => (
                <div key={k} className="border-b pb-2" style={{ borderColor: "var(--line-soft)" }}>
                  <dt className="text-[11px]" style={{ color: "var(--text-dim)" }}>{k}</dt>
                  <dd className="mt-0.5 text-sm font-bold">
                    {/\d/.test(val) ? <span className="num">{val}</span> : val}
                  </dd>
                </div>
              ))}
            </dl>

            {v.equipment.length > 0 && (
              <>
                <h3 className="mt-6 mb-3 text-sm font-extrabold">التجهيزات</h3>
                <div className="flex flex-wrap gap-1.5">
                  {v.equipment.map((e) => (
                    <span key={e} className="chip">✓ {e}</span>
                  ))}
                </div>
              </>
            )}

            <h3 className="mt-6 mb-2 text-sm font-extrabold">وصف البائع</h3>
            <p className="text-sm leading-loose" style={{ color: "var(--text-muted)" }}>
              {v.description}
            </p>
          </section>

          <HistoryTimeline events={v.history} />
          <TcoCalculator v={v} />
          <CreditSimulator price={v.price} />
        </div>

        {/* ---------- العمود الجانبي ---------- */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:h-fit">
          <SellerCard seller={seller} v={v} />
          <TrustPanel trust={trust} />

          {fp.estimate.comparables.length > 0 && (
            <section className="card p-5">
              <h2 className="text-sm font-extrabold">إعلانات استُعملت في الحساب</h2>
              <p className="mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
                الثمن المرجعي محسوب من هاد المركبات المشابهة بعد التعديل.
              </p>
              <ul className="mt-3 space-y-2">
                {fp.estimate.comparables.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/vehicles/${c.id}`}
                      className="flex items-center justify-between gap-2 rounded-lg p-2 text-xs transition hover:bg-[var(--bg-inset)]"
                    >
                      <span className="truncate">
                        {c.make} {c.model} <span className="num opacity-60">{c.year}</span>
                      </span>
                      <span className="num shrink-0 font-bold">{formatNumber(c.price)} د.م</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-6">مركبات مشابهة</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <VehicleCard key={s.id} v={s} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
