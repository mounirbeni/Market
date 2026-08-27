import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brandSlug, vehicleHref } from "@/lib/slug";
import {
  estimateFor, findAll, getDealerOfSeller, getDuplicateCount, getVehicle,
} from "@/lib/source";
import { fairPriceFrom, trustOf, trustScore } from "@/lib/market";
import { cityName } from "@/lib/cities";
import { AR, formatDate, formatDh, formatKm, formatNumber, timeAgo } from "@/lib/format";
import { Gallery } from "@/components/vehicle/Gallery";
import { TrustPanel } from "@/components/vehicle/TrustPanel";
import { RiskPanel } from "@/components/vehicle/RiskPanel";
import { TcoCalculator } from "@/components/vehicle/TcoCalculator";
import { HistoryTimeline } from "@/components/vehicle/HistoryTimeline";
import { SellerCard } from "@/components/vehicle/SellerCard";
import { StickyActionBar } from "@/components/vehicle/StickyActionBar";
import { FairPriceMeter } from "@/components/FairPriceMeter";
import { VehicleCard } from "@/components/VehicleCard";
import { RecentlyViewed } from "@/components/vehicle/RecentlyViewed";
import { ViewTracker } from "@/components/vehicle/ViewTracker";
import { Price } from "@/components/Price";
import { Mixed } from "@/components/Mixed";
import { TrustRing } from "@/components/TrustBadge";
import {
  AutoGear, BadgeCheck, Calendar, Check, ChevronLeft, ClipboardCheck, Door,
  Driveshaft, EQUIPMENT_ICONS, Eye, FUEL_ICONS, Heart, Horsepower, MapPin,
  Odometer, OilCan, Palette, Piston, Road, Scale, Seat, Sparkle,
  Transmission, TrendingDown, Users,
} from "@/components/icons";
import { VehicleGlyph } from "@/components/VehicleArt";
import { artShape } from "@/lib/artshape";

/* الصفحة كتّرندر عند كل طلب.

   قبل كانت `generateStaticParams` وNext كيصنّفها SSG. المشكل: التخطيط
   الجذري كيقرا الكوكي (الجلسة فالهيدر)، يعني حتى صفحة ماتقدرش تتّبنى
   ساكنة بصح. ملي البناء كيلقى القائمة خاوية (قاعدة الإنتاج كانت خاوية
   ملي تبنا الموقع)، كل رابط جديد كيتحاول يتّبنى ساكن عند أول طلب —
   وتما كتطيح cookies() بـDYNAMIC_SERVER_USAGE و500 بدل الصفحة.

   يعني: كل إعلان جديد كان كيعطي 500. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await getVehicle(slug);
  if (!found) return { title: "إعلان غير موجود" };
  const v = found.vehicle;
  const title = `${v.make} ${v.model} ${v.version} ${v.year} — ${formatDh(v.price)} في ${cityName(v.city)}`;
  return {
    title,
    description: `${AR.kind[v.kind]} ${v.make} ${v.model} موديل ${v.year}، ${formatKm(v.km)}، ${AR.fuel[v.fuel]}، ${AR.gearbox[v.gearbox]}. مؤشر ثقة ${trustOf(v).score}/100 وثمن مرجعي محسوب.`,
    openGraph: { title, type: "article" },
    alternates: { canonical: `/vehicle/${slug}` },
  };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getVehicle(slug);
  if (!found) notFound();
  const { vehicle: v, seller } = found;

  const dealer = await getDealerOfSeller(v.sellerId);
  const section = v.kind === "car" ? "/cars" : "/motorcycles";

  /* الثمن المرجعي كيتحسب هنا فالخادم من إعلانات حقيقية مشابهة —
     بهاد الطريقة كنقدرو نوريو حتى الإعلانات اللي دخلات فالحساب. */
  const estimate = await estimateFor(
    {
      kind: v.kind, make: v.make, model: v.model, year: v.year, km: v.km,
      fuel: v.fuel, gearbox: v.gearbox, body: v.body, condition: v.condition,
      power: v.kind === "moto" ? v.displacement : v.fiscalPower,
    },
    { excludeId: v.id },
  );
  const fp = fairPriceFrom(v, estimate);
  // إشارة التكرار كتحتاج الإعلانات الأخرى ديال نفس البائع
  const duplicates = await getDuplicateCount(v);
  const trust = trustScore(v, seller, fp);
  // المشابهة كتّحسب من نفس المصدر
  const similar = (await findAll(
    { kind: v.kind, make: v.make, sort: "pertinence" }, 8,
  )).filter((s) => s.id !== v.id).slice(0, 4);
  const FuelIcon = FUEL_ICONS[v.fuel];
  const GearIcon = v.gearbox === "automatique" ? AutoGear : Transmission;

  const specs = [
    { Icon: Calendar, label: "سنة الصنع", value: String(v.year) },
    { Icon: Odometer, label: "الكيلومتراج", value: `${formatNumber(v.km)} كم` },
    { Icon: FuelIcon, label: "نوع الوقود", value: AR.fuel[v.fuel] },
    { Icon: GearIcon, label: "ناقل السرعة", value: AR.gearbox[v.gearbox] },
    { Icon: Horsepower, label: "القوة الجبائية", value: `${v.fiscalPower} حصان` },
    ...(v.kind === "car"
      ? [
          { Icon: Door, label: "عدد الأبواب", value: String(v.doors ?? "-") },
          { Icon: Seat, label: "عدد المقاعد", value: (v.doors ?? 5) >= 5 ? "5" : "4" },
          { Icon: Driveshaft, label: "نوع الدفع", value: v.body === "suv" || v.body === "utilitaire" ? "دفع رباعي" : "دفع أمامي" },
        ]
      : [{ Icon: Piston, label: "سعة المحرك", value: `${v.displacement} سم³` }]),
    { Icon: OilCan, label: "الاستهلاك", value: `${v.consumption} ل/100كم` },
    { Icon: Palette, label: "اللون", value: v.color },
    { Icon: BadgeCheck, label: "الحالة العامة", value: AR.condition[v.condition] },
    { Icon: Users, label: "عدد الملاّك", value: String(v.owners) },
    { Icon: ClipboardCheck, label: "الفحص التقني", value: formatDate(v.technicalControl) },
    { Icon: MapPin, label: "المدينة", value: cityName(v.city) },
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
    <div className="mx-auto max-w-[1400px] px-4 py-6 pb-24 lg:pb-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-5 flex flex-wrap items-center gap-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
        <Link href="/" className="transition hover:text-[var(--brand)]">الرئيسية</Link>
        <ChevronLeft size={12} />
        <Link href={section} className="transition hover:text-[var(--brand)]">
          {v.kind === "car" ? "سيارات" : "دراجات نارية"}
        </Link>
        <ChevronLeft size={12} />
        <Link href={`${section}/${brandSlug(v.make)}`} className="transition hover:text-[var(--brand)]">
          {v.make}
        </Link>
        <ChevronLeft size={12} />
        <span style={{ color: "var(--text-muted)" }}>{v.model} <span className="num">{v.year}</span></span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
        {/* ---------- العمود الرئيسي ---------- */}
        <div className="min-w-0 space-y-6">
          <Gallery v={v} />

          <header className="card overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <VehicleGlyph shape={artShape(v)} kind={v.kind} size={26} strokeWidth={11} className="shrink-0" style={{ color: "var(--text-dim)" }} />
                  <h1 className="text-2xl font-extrabold tracking-tight">{v.make} {v.model}</h1>
                </div>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{v.version}</p>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  <span className="chip"><Calendar size={12} /><span className="num">{v.year}</span></span>
                  <span className="chip"><Odometer size={12} /><span className="num">{formatNumber(v.km)}</span> كم</span>
                  <span className="chip"><FuelIcon size={12} />{AR.fuel[v.fuel]}</span>
                  <span className="chip"><GearIcon size={12} />{AR.gearbox[v.gearbox]}</span>
                  <span className="chip"><MapPin size={12} />{cityName(v.city)}</span>
                </div>
              </div>
              <TrustRing score={trust.score} grade={trust.grade} size={62} />
            </div>

            <div
              className="flex flex-wrap items-end justify-between gap-3 border-t p-5"
              style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
            >
              <div>
                <Price value={v.price} className="text-3xl font-extrabold tracking-tight" />
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  {v.negotiable && <span className="tag tag-mute"><Check size={10} /> قابل للنقاش</span>}
                  {v.exchangeAccepted && <span className="tag tag-mute"><Scale size={10} /> يقبل التبادل</span>}
                  {v.priceDrops.length > 0 && (
                    <span className="tag tag-good">
                      <TrendingDown size={10} /> انخفض <span className="num">{formatNumber(v.priceDrops.reduce((a, b) => a + b, 0))}</span> د.م
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-4 text-[11px]" style={{ color: "var(--text-dim)" }}>
                <span className="flex items-center gap-1"><Eye size={12} /><span className="num">{formatNumber(v.views)}</span></span>
                <span className="flex items-center gap-1"><Heart size={12} /><span className="num">{v.saves}</span></span>
                <span>نُشر {timeAgo(v.publishedAt)}</span>
              </div>
            </div>
          </header>

          <FairPriceMeter fp={fp} />

          {/* المواصفات */}
          <section className="card p-5">
            <header className="mb-5 flex items-start gap-2.5">
              <Road size={18} style={{ color: "var(--brand)" }} className="mt-0.5 shrink-0" />
              <div>
                <h2 className="text-[15px] font-bold">المواصفات</h2>
                <p className="mt-1 text-xs" style={{ color: "var(--text-dim)" }}>
                  كل المعطيات التقنية كما صرّح بها البائع.
                </p>
              </div>
            </header>

            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2.5 rounded-xl p-2.5"
                  style={{ background: "var(--surface-3)" }}
                >
                  <s.Icon size={16} className="shrink-0" style={{ color: "var(--text-dim)" }} />
                  <div className="min-w-0">
                    <dt className="text-[10px]" style={{ color: "var(--text-dim)" }}>{s.label}</dt>
                    <dd className="truncate text-[12.5px] font-bold">
                      <Mixed text={s.value} />
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            {v.equipment.length > 0 && (
              <>
                <h3 className="mt-6 mb-3 flex items-center gap-1.5 text-[13px] font-bold">
                  <Sparkle size={14} style={{ color: "var(--brand)" }} /> التجهيزات
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {v.equipment.map((e) => {
                    const EqIcon = EQUIPMENT_ICONS[e] ?? Check;
                    return (
                      <span
                        key={e}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11.5px] font-medium"
                        style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
                      >
                        <EqIcon size={15} className="shrink-0" style={{ color: "var(--brand)" }} />
                        <span className="truncate">{e}</span>
                      </span>
                    );
                  })}
                </div>
              </>
            )}

            <h3 className="mt-6 mb-2 text-[13px] font-bold">وصف البائع</h3>
            <p className="text-[13px] leading-loose" style={{ color: "var(--text-muted)" }}>
              {v.description}
            </p>
          </section>

          <HistoryTimeline events={v.history} />
          <TcoCalculator v={v} />
        </div>

        {/* ---------- العمود الجانبي ---------- */}
        <aside className="min-w-0 space-y-6 lg:sticky lg:top-[84px] lg:h-fit">
          <SellerCard seller={seller} v={v} />
          <RiskPanel v={v} duplicates={duplicates} />
          <TrustPanel trust={trust} />

          {fp.estimate.comparables.length > 0 && (
            <section className="card p-5">
              <h2 className="flex items-center gap-2 text-[13px] font-bold">
                <Scale size={15} style={{ color: "var(--brand)" }} /> إعلانات استُعملت في الحساب
              </h2>
              <p className="mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
                الثمن المرجعي محسوب من هاد المركبات المشابهة بعد التعديل.
              </p>
              <ul className="mt-3 space-y-1">
                {fp.estimate.comparables.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={vehicleHref(c)}
                      className="flex items-center justify-between gap-2 rounded-lg p-2 text-[11.5px] transition hover:bg-[var(--surface-3)]"
                    >
                      <span className="truncate">
                        {c.make} {c.model} <span className="num opacity-55">{c.year}</span>
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

      <StickyActionBar v={v} />

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="h-section mb-6">مركبات مشابهة</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => <VehicleCard key={s.id} v={s} compact />)}
          </div>
        </section>
      )}

      <ViewTracker listingRef={v.id} />
      <RecentlyViewed currentId={v.id} />
    </div>
  );
}
