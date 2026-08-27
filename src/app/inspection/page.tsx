import type { Metadata } from "next";
import Link from "next/link";
import { VehicleCard } from "@/components/VehicleCard";
import { findAll } from "@/lib/source";
import {
  AirCon, ArrowLeft, BadgeCheck, Battery, Belt, BrakePad, BrakeRotor, Car,
  ClipboardCheck, Clock, Diagnostic, EngineBlock, FileText, Gauge, Headlight,
  IdCard, Lock2, MapPin, Moto, Odometer, OilCan, Palette, Scale, Scan,
  Screen, Shield, ShieldCheck, Shock, Sparkle, Steering, Tire, Transmission,
  Turbo, Window, Wrench,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "الفحص المستقل — 120 نقطة قبل الشراء",
  description:
    "اطلب فحصاً ميكانيكياً مستقلاً من 120 نقطة قبل شراء سيارة أو دراجة مستعملة في المغرب: تقرير مفصل بالصور، وقراءة لأخطاء الحاسوب.",
};

const SECTIONS = [
  {
    title: "المحرك وناقل الحركة",
    points: 32,
    Icon: EngineBlock,
    color: "var(--brand)",
    items: [
      { Icon: Diagnostic, t: "قراءة أخطاء الحاسوب (OBD) وحذف الأكواد المخفية" },
      { Icon: OilCan, t: "تسربات الزيت والماء والكشف عن الحشوة (joint de culasse)" },
      { Icon: Belt, t: "حالة سير التوزيع والبكرات" },
      { Icon: Turbo, t: "أداء التيربو وضغط النفخ" },
      { Icon: Transmission, t: "سلاسة تبديل السرعات وحالة الدبرياج" },
    ],
  },
  {
    title: "الهيكل والصباغة",
    points: 26,
    Icon: Palette,
    color: "var(--data)",
    items: [
      { Icon: Palette, t: "قياس سماكة الصباغة على كل قطعة (كشف الصباغة الجديدة)" },
      { Icon: Scan, t: "تفحص نقاط اللحام الأصلية والشاسي" },
      { Icon: Shield, t: "فحص أرضية الصندوق وأماكن الصدأ" },
      { Icon: Scale, t: "تطابق فراغات القطع (jeux de carrosserie)" },
      { Icon: IdCard, t: "مطابقة رقم الهيكل (VIN) في كل المواضع" },
    ],
  },
  {
    title: "التعليق والفرامل",
    points: 24,
    Icon: BrakeRotor,
    color: "var(--good)",
    items: [
      { Icon: BrakePad, t: "حالة الأقراص والفحمات وقياس السماكة" },
      { Icon: Shock, t: "المساعدات (amortisseurs) والتسريبات" },
      { Icon: Steering, t: "المفاصل الكروية وقضبان التوجيه" },
      { Icon: Tire, t: "تآكل الإطارات وتاريخ الصنع (DOT)" },
      { Icon: Gauge, t: "اختبار الفرامل على الطريق" },
    ],
  },
  {
    title: "الكهرباء والتجهيزات",
    points: 22,
    Icon: Battery,
    color: "var(--warn)",
    items: [
      { Icon: Battery, t: "البطارية والمولّد وشدة الشحن" },
      { Icon: Headlight, t: "كل الأضواء والإشارات والأبواق" },
      { Icon: AirCon, t: "المكيف: درجة البرودة وضغط الغاز" },
      { Icon: Screen, t: "الشاشة والكاميرات والحساسات" },
      { Icon: Window, t: "الزجاج الكهربائي والقفل المركزي" },
    ],
  },
  {
    title: "التاريخ والوثائق",
    points: 16,
    Icon: FileText,
    color: "var(--bad)",
    items: [
      { Icon: FileText, t: "مطابقة البطاقة الرمادية لاسم البائع" },
      { Icon: Lock2, t: "التحقق من عدم وجود رهن أو حجز" },
      { Icon: Odometer, t: "قراءة العدّاد من الحاسوب ومقارنتها بالمعروض" },
      { Icon: ShieldCheck, t: "صلاحية الفحص التقني والتأمين" },
      { Icon: Clock, t: "تاريخ الصيانة من فواتير الوكيل إن وُجدت" },
    ],
  },
];

const STEPS = [
  { n: 1, Icon: ClipboardCheck, t: "اطلب الفحص", d: "من صفحة الإعلان أو من هنا. كتختار التاريخ واللي غادي يخلّص: نتا ولا البائع." },
  { n: 2, Icon: MapPin, t: "الخبير كيمشي للمركبة", d: "ميكانيكي معتمد كيتنقل لبلاصة المركبة فأي مدينة، ومكيبقاش أكثر من 90 دقيقة." },
  { n: 3, Icon: Scan, t: "تقرير مفصّل", d: "كتوصلك نتيجة كل نقطة مع صور، أكواد الأعطاب، وتقدير كلفة الإصلاحات." },
  { n: 4, Icon: BadgeCheck, t: "تفاوض بالحقائق", d: "استعمل التقرير باش تفاوض على الثمن، ولا تمشي إذا لقيتي شي حاجة خطيرة." },
];

const PRICING = [
  { name: "دراجة نارية", price: "250", points: "78 نقطة", note: "كل الأحجام", Icon: Moto },
  { name: "سيارة عادية", price: "450", points: "120 نقطة", note: "الأكثر طلباً", Icon: Car, featured: true },
  { name: "سيارة فاخرة / 4×4", price: "650", points: "140 نقطة", note: "مع تشخيص متقدم", Icon: Gauge },
];

export default async function InspectionPage() {
  const inspected = await findAll({ inspectedOnly: true, sort: "trust-desc" }, 4);
  const total = SECTIONS.reduce((s, x) => s + x.points, 0);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12">
      <header className="mb-14 max-w-2xl">
        <span className="eyebrow"><Wrench size={13} /> خدمة مستقلة · ماشي من البائع</span>
        <h1 className="h-page mt-4">ماتشريش بعينيك — شري بتقرير</h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          <span className="num">{total}</span> نقطة فحص كيديرها ميكانيكي مستقل ماعندو حتى
          علاقة بالبائع. النتيجة كتوصلك نتا، وكتبقى مرفقة بالإعلان باش تزيد الثقة عند
          المشترين الآخرين.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/vehicles?inspected=1" className="btn btn-primary">
            <BadgeCheck size={16} /> شوف المركبات المفحوصة
          </Link>
          <Link href="/vehicles" className="btn btn-ghost">
            اطلب فحصاً لإعلان <ArrowLeft size={15} />
          </Link>
        </div>
      </header>

      <section className="mb-16">
        <h2 className="h-section mb-7">كيفاش كيتم</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card card-hover p-5">
              <div className="flex items-center gap-2.5">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl"
                  style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                >
                  <s.Icon size={19} />
                </span>
                <span className="num text-xs font-bold" style={{ color: "var(--text-dim)" }}>
                  0{s.n}
                </span>
              </div>
              <h3 className="mt-4 text-[14px] font-bold">{s.t}</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="h-section mb-7">شنو كيتفحص بالضبط</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SECTIONS.map((sec) => (
            <div key={sec.title} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2.5 text-[14px] font-bold">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-lg"
                    style={{ background: `color-mix(in oklab, ${sec.color} 14%, transparent)`, color: sec.color }}
                  >
                    <sec.Icon size={17} />
                  </span>
                  {sec.title}
                </h3>
                <span className="chip"><span className="num">{sec.points}</span> نقطة</span>
              </div>
              <ul className="mt-4 space-y-2">
                {sec.items.map((it) => (
                  <li key={it.t} className="flex items-start gap-2.5 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    <span
                      className="mt-px grid h-6 w-6 shrink-0 place-items-center rounded-md"
                      style={{ background: `color-mix(in oklab, ${sec.color} 11%, transparent)`, color: sec.color }}
                    >
                      <it.Icon size={14} />
                    </span>
                    <span className="min-w-0">{it.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="h-section mb-7">الأثمنة</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PRICING.map((p) => (
            <div
              key={p.name}
              className={p.featured ? "card-raised relative p-6 text-center" : "card relative p-6 text-center"}
              style={p.featured ? { borderColor: "var(--brand)" } : undefined}
            >
              {p.featured && (
                <span
                  className="tag absolute -top-2.5 right-1/2 translate-x-1/2"
                  style={{ background: "var(--brand)", color: "var(--brand-ink)" }}
                >
                  <Sparkle size={11} /> {p.note}
                </span>
              )}
              <span
                className="mx-auto grid h-12 w-12 place-items-center rounded-xl"
                style={{ background: "var(--surface-3)", color: "var(--brand)" }}
              >
                <p.Icon size={22} />
              </span>
              <h3 className="mt-4 text-[14px] font-bold">{p.name}</h3>
              <p className="mt-3">
                <span className="num text-3xl font-extrabold" style={{ color: "var(--brand)" }}>{p.price}</span>
                <span className="ms-1.5 text-xs font-bold opacity-60">د.م</span>
              </p>
              <p className="num mt-2 text-xs" style={{ color: "var(--text-dim)" }}>{p.points}</p>
              {!p.featured && (
                <p className="mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>{p.note}</p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
          <MapPin size={13} /> التنقل داخل المدينة مجاني. خارج المدينة كتزاد{" "}
          <span className="num">3</span> دراهم/كم.
        </p>
      </section>

      {inspected.length > 0 && (
        <section>
          <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <h2 className="h-section">مركبات مفحوصة متوفرة دابا</h2>
            <Link href="/vehicles?inspected=1" className="btn btn-ghost btn-sm">الكل <ArrowLeft size={14} /></Link>
          </header>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {inspected.map((v) => <VehicleCard key={v.id} v={v} compact />)}
          </div>
        </section>
      )}
    </div>
  );
}
