import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDealerOfSeller, getSellerById, getSellerListings, getSellerStats } from "@/lib/source";
import { cityName } from "@/lib/cities";
import { formatNumber } from "@/lib/format";
import { userBadges } from "@/lib/userBadges";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { sellerDisplayName } from "@/lib/i18n/labels";
import { VehicleCard } from "@/components/VehicleCard";
import {
  BadgeCheck, Car, Clock, MapPin, ShieldCheck, Star, Users,
} from "@/components/icons";

/* الصفحة كتّرندر عند كل طلب — نفس سبب /dealer/[slug]: التخطيط
   الجذري كيقرا الكوكي، فالصفحة ماتقدرش تتّبنى ساكنة بصح. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const seller = await getSellerById(id);
  if (!seller) return { title: "بائع غير موجود" };
  return {
    title: `${seller.name} — ${cityName(seller.city)}`,
    description: `إعلانات ${seller.name} على طريق — ${cityName(seller.city)}.`,
    robots: { index: false, follow: true },
    alternates: { canonical: `/seller/${id}` },
  };
}

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const { id } = await params;
  const seller = await getSellerById(id);
  if (!seller) notFound();
  const displayName = sellerDisplayName(seller.name, locale);

  /* البائع المحترف اللي عندو معرض موثّق: الصفحة المرجعية ديالو هي
     صفحة المعرض (فيها تاغلاين، عنوان، ساعات العمل...) — بلا
     ماندوبلو نفس المعلومات فصفحتين. */
  const dealer = await getDealerOfSeller(id);
  if (dealer) redirect(`/dealer/${dealer.slug}`);

  const [listings, stats] = await Promise.all([
    getSellerListings(id),
    getSellerStats(id),
  ]);

  const trustLevel = seller.idVerified && seller.rating >= 4.5 && seller.salesCount >= 5
    ? "high" as const
    : seller.idVerified ? "medium" as const : "low" as const;
  const badges = userBadges({
    idVerified: seller.idVerified,
    phoneVerified: seller.phoneVerified,
    type: seller.type,
    dealerVerified: false,
    trustLevel,
  });

  const cars = listings.filter((v) => v.kind === "car").length;
  const motos = listings.length - cars;

  return (
    <div>
      <div
        className="relative h-32 sm:h-40"
        style={{ background: "linear-gradient(120deg, var(--brand), var(--data))" }}
      >
        <div className="zellige absolute inset-0 opacity-40" />
      </div>

      <div className="mx-auto max-w-[1200px] px-4">
        <div className="-mt-12 flex flex-wrap items-end gap-4">
          <span
            className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-4 text-3xl font-extrabold"
            style={{ background: "var(--surface-1)", borderColor: "var(--bg)", color: "var(--brand)" }}
          >
            {displayName.trim().slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="h-section">{displayName}</h1>
              {seller.idVerified && (
                <span className="tag" style={{ background: "var(--good)", color: "#fff" }}>
                  <BadgeCheck size={11} /> حساب موثّق
                </span>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-[13px]" style={{ color: "var(--text-muted)" }}>
              <MapPin size={13} /> {cityName(seller.city)} · عضو منذ <span className="num">{seller.since}</span>
            </p>
            {badges.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {badges.map((b) => (
                  <span
                    key={b.key}
                    className="chip"
                    style={{ background: `color-mix(in oklab, ${b.color} 14%, transparent)`, color: b.color, borderColor: "transparent" }}
                  >
                    <b.Icon size={11} /> {t.badge[b.key as keyof typeof t.badge]}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* الأرقام */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { Icon: Car, v: formatNumber(listings.length), l: "إعلان نشيط" },
            { Icon: BadgeCheck, v: formatNumber(stats.soldListings), l: "مركبة مباعة" },
            { Icon: Star, v: seller.rating.toFixed(1), l: "التقييم" },
            { Icon: Clock, v: `~${seller.responseMinutes}`, l: "دقيقة للجواب" },
          ].map((s) => (
            <div key={s.l} className="card flex items-center gap-3 p-4">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
              >
                <s.Icon size={18} />
              </span>
              <div className="min-w-0">
                <div className="num text-lg font-extrabold">{s.v}</div>
                <div className="truncate text-[10.5px]" style={{ color: "var(--text-dim)" }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* الإعلانات */}
        <section className="mt-10 pb-16">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2 className="h-section">إعلانات {displayName}</h2>
            {listings.length > 0 && (
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                <span className="num">{cars}</span> سيارة · <span className="num">{motos}</span> دراجة
              </p>
            )}
          </div>
          {listings.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((v) => <VehicleCard key={v.id} v={v} compact />)}
            </div>
          ) : (
            <div className="card flex flex-col items-center gap-2 p-10 text-center">
              <Users size={22} style={{ color: "var(--text-dim)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                ماكاين حتى إعلان نشيط لهاد البائع دابا.
              </p>
            </div>
          )}
        </section>

        <div
          className="mb-16 flex items-start gap-3 rounded-2xl p-4 text-[11.5px] leading-relaxed"
          style={{ background: "var(--bad-soft)", color: "var(--text-muted)" }}
        >
          <ShieldCheck size={16} className="mt-px shrink-0" style={{ color: "var(--bad)" }} />
          <span>
            <b style={{ color: "var(--bad)" }}>ماتخلّصش قبل ما تشوف:</b> تلاقاو فبلاصة عامة ونهاراً،
            وتأكد من البطاقة الرمادية ورقم الهيكل قبل أي دفع.
          </span>
        </div>
      </div>
    </div>
  );
}
