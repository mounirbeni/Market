import type { Metadata } from "next";
import Link from "next/link";
import { VehicleCard } from "@/components/VehicleCard";
import { applyFilters } from "@/lib/search";

export const metadata: Metadata = {
  title: "الفحص المستقل — 120 نقطة قبل الشراء",
  description:
    "اطلب فحصاً ميكانيكياً مستقلاً من 120 نقطة قبل شراء سيارة أو دراجة مستعملة في المغرب: تقرير مفصل بالصور، وقراءة لأخطاء الحاسوب.",
};

const SECTIONS = [
  {
    title: "المحرك وناقل الحركة",
    points: 32,
    icon: "⚙️",
    items: [
      "قراءة أخطاء الحاسوب (OBD) وحذف الأكواد المخفية",
      "تسربات الزيت والماء والكشف عن الحشوة (joint de culasse)",
      "حالة سير التوزيع والبكرات",
      "أداء التيربو وضغط النفخ",
      "سلاسة تبديل السرعات وحالة الدبرياج",
    ],
  },
  {
    title: "الهيكل والصباغة",
    points: 26,
    icon: "🎨",
    items: [
      "قياس سماكة الصباغة على كل قطعة (كشف الصباغة الجديدة)",
      "تفحص نقاط اللحام الأصلية والشاسي",
      "فحص أرضية الصندوق وأماكن الصدأ",
      "تطابق فراغات القطع (jeux de carrosserie)",
      "مطابقة رقم الهيكل (VIN) في كل المواضع",
    ],
  },
  {
    title: "التعليق والفرامل",
    points: 24,
    icon: "🛞",
    items: [
      "حالة الأقراص والفحمات وقياس السماكة",
      "المساعدات (amortisseurs) والتسريبات",
      "المفاصل الكروية وقضبان التوجيه",
      "تآكل الإطارات وتاريخ الصنع (DOT)",
      "اختبار الفرامل على الطريق",
    ],
  },
  {
    title: "الكهرباء والتجهيزات",
    points: 22,
    icon: "🔌",
    items: [
      "البطارية والمولّد وشدة الشحن",
      "كل الأضواء والإشارات والأبواق",
      "المكيف: درجة البرودة وضغط الغاز",
      "الشاشة والكاميرات والحساسات",
      "الزجاج الكهربائي والقفل المركزي",
    ],
  },
  {
    title: "التاريخ والوثائق",
    points: 16,
    icon: "📄",
    items: [
      "مطابقة البطاقة الرمادية لاسم البائع",
      "التحقق من عدم وجود رهن أو حجز",
      "قراءة العدّاد من الحاسوب ومقارنتها بالمعروض",
      "صلاحية الفحص التقني والتأمين",
      "تاريخ الصيانة من فواتير الوكيل إن وُجدت",
    ],
  },
];

const STEPS = [
  { n: 1, t: "اطلب الفحص", d: "من صفحة الإعلان أو من هنا. كتختار التاريخ واللي غادي يخلّص: نتا ولا البائع." },
  { n: 2, t: "الخبير كيمشي للمركبة", d: "ميكانيكي معتمد كيتنقل لبلاصة المركبة فأي مدينة، ومكيبقاش أكثر من 90 دقيقة." },
  { n: 3, t: "تقرير مفصّل", d: "كتوصلك نتيجة كل نقطة مع صور، أكواد الأعطاب، وتقدير كلفة الإصلاحات." },
  { n: 4, t: "تفاوض بالحقائق", d: "استعمل التقرير باش تفاوض على الثمن، ولا تمشي إذا لقيتي شي حاجة خطيرة." },
];

const PRICING = [
  { name: "دراجة نارية", price: "250 د.م", points: "78 نقطة", note: "كل الأحجام" },
  { name: "سيارة عادية", price: "450 د.م", points: "120 نقطة", note: "الأكثر طلباً", featured: true },
  { name: "سيارة فاخرة / 4×4", price: "650 د.م", points: "140 نقطة", note: "مع تشخيص متقدم" },
];

export default function InspectionPage() {
  const inspected = applyFilters({ inspectedOnly: true, sort: "trust-desc" }).slice(0, 4);
  const total = SECTIONS.reduce((s, x) => s + x.points, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-12 max-w-2xl">
        <span className="chip">خدمة مستقلة · ماشي من البائع</span>
        <h1 className="section-title mt-4">ماتشريش بعينيك — شري بتقرير</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          <span className="num">{total}</span> نقطة فحص كيديرها ميكانيكي مستقل ماعندو
          حتى علاقة بالبائع. النتيجة كتوصلك نتا، وكتبقى مرفقة بالإعلان باش تزيد
          الثقة عند المشترين الآخرين.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/vehicles?inspected=1" className="btn btn-primary">شوف المركبات المفحوصة</Link>
          <Link href="/vehicles" className="btn btn-ghost">اطلب فحصاً لإعلان</Link>
        </div>
      </header>

      {/* الخطوات */}
      <section className="mb-16">
        <h2 className="section-title mb-6">كيفاش كيتم</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-5">
              <span
                className="num grid h-8 w-8 place-items-center rounded-full text-sm font-black"
                style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
              >
                {s.n}
              </span>
              <h3 className="mt-3 text-sm font-extrabold">{s.t}</h3>
              <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* اللائحة */}
      <section className="mb-16">
        <h2 className="section-title mb-6">شنو كيتفحص بالضبط</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SECTIONS.map((sec) => (
            <div key={sec.title} className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-extrabold">
                  <span aria-hidden="true">{sec.icon}</span> {sec.title}
                </h3>
                <span className="chip">
                  <span className="num">{sec.points}</span> نقطة
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {sec.items.map((it) => (
                  <li key={it} className="flex gap-2 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    <span style={{ color: "var(--color-atlas-400)" }}>✓</span> {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* الأثمنة */}
      <section className="mb-16">
        <h2 className="section-title mb-6">الأثمنة</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PRICING.map((p) => (
            <div
              key={p.name}
              className="card relative p-6 text-center"
              style={p.featured ? { borderColor: "var(--accent)" } : undefined}
            >
              {p.featured && (
                <span
                  className="absolute -top-2.5 right-1/2 translate-x-1/2 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold"
                  style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
                >
                  {p.note}
                </span>
              )}
              <h3 className="text-sm font-extrabold">{p.name}</h3>
              <p className="num mt-3 text-3xl font-black" style={{ color: "var(--accent)" }}>
                {p.price}
              </p>
              <p className="num mt-2 text-xs" style={{ color: "var(--text-dim)" }}>{p.points}</p>
              {!p.featured && (
                <p className="mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>{p.note}</p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px]" style={{ color: "var(--text-dim)" }}>
          التنقل داخل المدينة مجاني. خارج المدينة كتزاد <span className="num">3</span> دراهم/كم.
        </p>
      </section>

      {inspected.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-3">
            <h2 className="section-title">مركبات مفحوصة متوفرة دابا</h2>
            <Link href="/vehicles?inspected=1" className="btn btn-ghost btn-sm">الكل ←</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {inspected.map((v) => (
              <VehicleCard key={v.id} v={v} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
