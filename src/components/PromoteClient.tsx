"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PROMOS, PROMO_ORDER, type PromoTier } from "@/lib/promo";
import { vehicleById } from "@/lib/data/vehicles";
import { formatNumber } from "@/lib/format";
import { vehicleHref } from "@/lib/slug";
import { VehicleArt } from "@/components/VehicleArt";
import { artShape } from "@/lib/artshape";
import { Mixed } from "@/components/Mixed";
import {
  ArrowLeft, BadgeCheck, Check, Eye, Info, Phone, Sparkle, Timer, TrendingUp, Wallet,
} from "@/components/icons";

const TIER_ICON = { top: TrendingUp, urgent: Timer, featured: Sparkle } as const;

export function PromoteClient() {
  const sp = useSearchParams();
  const listing = vehicleById(sp.get("listing") ?? "");
  const [picked, setPicked] = useState<PromoTier>("urgent");
  const meta = PROMOS[picked];

  /** تقدير المشاهدات: أساس الإعلان × مضاعف الدرجة على مدة الترويج */
  const projection = useMemo(() => {
    const baseDaily = listing ? Math.max(6, Math.round(listing.views / 45)) : 14;
    const plain = baseDaily * meta.days;
    return { plain, boosted: Math.round(plain * meta.liftX), baseDaily };
  }, [listing, meta]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10">
      <header className="mb-9 max-w-2xl">
        <span className="eyebrow"><TrendingUp size={13} /> للبائعين</span>
        <h1 className="h-page mt-4">روّج إعلانك وبيع أسرع</h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          نشر الإعلان مجاني ديما. الترويج اختياري — كيخلّي إعلانك يبان لناس أكثر
          فوقت أقل. ماكاينش اشتراك شهري، كتخلّص غير على الإعلان اللي بغيتي تروّج.
        </p>
      </header>

      {listing && (
        <div className="card mb-7 flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="h-[92px] w-[150px] shrink-0 overflow-hidden rounded-xl">
            <VehicleArt
              id={listing.id} kind={listing.kind} body={artShape(listing)}
              color={listing.color} className="h-full w-full"
              label={`${listing.make} ${listing.model}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="eyebrow"><BadgeCheck size={12} /> الإعلان اللي غادي تروّج</span>
            <h2 className="mt-1.5 truncate text-base font-bold">
              {listing.make} {listing.model} <span className="num">{listing.year}</span>
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-3 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
              <span className="num font-bold" style={{ color: "var(--brand)" }}>
                {formatNumber(listing.price)} د.م
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} /> <span className="num">{formatNumber(listing.views)}</span> مشاهدة
              </span>
              <span className="num">~{projection.baseDaily} مشاهدة/نهار</span>
            </p>
          </div>
          <Link href={vehicleHref(listing)} className="btn btn-ghost btn-sm shrink-0">
            شوف الإعلان <ArrowLeft size={13} />
          </Link>
        </div>
      )}

      {/* الخيارات */}
      <div className="grid gap-4 lg:grid-cols-3">
        {PROMO_ORDER.map((tier) => {
          const p = PROMOS[tier];
          const Icon = TIER_ICON[tier];
          const on = picked === tier;
          return (
            <button
              key={tier}
              onClick={() => setPicked(tier)}
              aria-pressed={on}
              className="card card-hover relative p-6 text-right transition-all"
              style={{
                borderColor: on ? p.color : "var(--line)",
                boxShadow: on ? `0 0 0 2px color-mix(in oklab, ${p.color} 35%, transparent)` : undefined,
              }}
            >
              {tier === "urgent" && (
                <span
                  className="absolute -top-2.5 left-5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold"
                  style={{ background: p.color, color: "#fff" }}
                >
                  الأكثر طلباً
                </span>
              )}
              <span
                className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: `color-mix(in oklab, ${p.color} 14%, transparent)`, color: p.color }}
              >
                <Icon size={21} />
              </span>
              <h3 className="mt-4 text-lg font-bold" style={{ color: p.color }}>{p.label}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {p.blurb}
              </p>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="num text-3xl font-extrabold">{p.price}</span>
                <span className="text-xs font-bold" style={{ color: "var(--text-dim)" }}>
                  د.م / <span className="num">{p.days}</span> يوم
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    <Check size={13} className="mt-0.5 shrink-0" style={{ color: p.color }} />
                    <Mixed text={b} />
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* التقدير */}
      <section className="card mt-7 p-6">
        <h2 className="flex items-center gap-2 text-sm font-extrabold">
          <Eye size={16} style={{ color: meta.color }} />
          التقدير مع «{meta.label}»
        </h2>
        <p className="mt-1.5 text-[12px]" style={{ color: "var(--text-dim)" }}>
          محسوب من متوسط أداء الإعلانات المشابهة فنفس الفئة. النتيجة الفعلية كتبدّل حسب الثمن والحالة وجودة الصور.
        </p>

        <div className="mt-5 space-y-3">
          {[
            { label: "بلا ترويج", n: projection.plain, color: "var(--text-dim)" },
            { label: meta.label, n: projection.boosted, color: meta.color },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-[12px]">
                <span className="font-bold">{row.label}</span>
                <span className="num font-extrabold" style={{ color: row.color }}>
                  {formatNumber(row.n)} مشاهدة
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(row.n / projection.boosted) * 100}%`, background: row.color }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { l: "كلفة المشاهدة الواحدة", v: `${(meta.price / Math.max(1, projection.boosted - projection.plain)).toFixed(2)} د.م` },
            { l: "المدة", v: `${meta.days} يوم` },
            { l: "المجموع", v: `${meta.price} د.م` },
          ].map((s) => (
            <div key={s.l} className="stat text-center">
              <span className="stat-value num">{s.v}</span>
              <span className="stat-label">{s.l}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button className="btn btn-primary btn-lg flex-1" style={{ background: meta.color }}>
            <Wallet size={17} /> فعّل «{meta.label}» بـ<span className="num">{meta.price}</span> د.م
          </button>
          <Link href="/dashboard/listings" className="btn btn-ghost btn-lg">
            رجع للإعلانات
          </Link>
        </div>

        <p
          className="mt-4 flex items-start gap-2 rounded-xl p-3 text-[11.5px] leading-relaxed"
          style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
        >
          <Info size={14} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
          هادي نسخة تجريبية — الأداء ماشي مفعّل. فالنسخة النهائية غادي يتزاد الأداء
          بالبطاقة البنكية وعبر الوكالات، مع فاتورة إلكترونية لكل عملية.
        </p>
      </section>

      {/* أسئلة */}
      <section className="mt-9">
        <h2 className="h-section mb-5">أسئلة على الترويج</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { q: "واش الترويج كيضمن ليا البيع؟", a: "لا. الترويج كيزيد فالمشاهدات ماشي فالبيع. الثمن المعقول والصور الواضحة والوثائق السليمة هما اللي كيبيعو." },
            { q: "واش نقدر نبدّل الدرجة من بعد؟", a: "إيه. تقدر ترقّي من «مميّز» لـ«فأعلى اللائحة» وكيتحسب ليك الفرق فقط على الأيام الباقية." },
            { q: "شنو كيوقع من بعد ما تسالي المدة؟", a: "الإعلان كيرجع عادي وكيبقى منشور. ماكاينش تجديد تلقائي وماكنسحبوش من البطاقة بلا إذنك." },
            { q: "واش كتبيعو المراتب فالبحث؟", a: "الترويج كيرفع الترتيب، ولكن مؤشر الثقة والثمن العادل ماكيتباعوش أبداً. إعلان مروّج بنقطة ثقة ضعيفة كيبقى مبيّن بنقطتو الحقيقية." },
          ].map((f) => (
            <div key={f.q} className="card p-5">
              <h3 className="text-[13px] font-bold">{f.q}</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
