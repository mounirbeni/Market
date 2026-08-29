import type { Metadata } from "next";
import Link from "next/link";
import { SafetyChecklist } from "@/components/SafetyChecklist";
import { AlertTriangle, ArrowLeft, BadgeCheck, ClipboardCheck, FileText, ShieldCheck, Wrench } from "@/components/icons";

export const metadata: Metadata = {
  title: "دليل البيع والشراء الآمن",
  description:
    "كيفاش تشري سيارة مستعملة فالمغرب بلا ما تتغلّط: لائحة تحقق كاملة، النصب المعروف، الوثائق المطلوبة وخطوات تحويل الملكية.",
};

const SCAMS = [
  {
    title: "عربون قبل المعاينة",
    sign: "«حيّد الإعلان وأنا نسيفط ليك المركبة، غير صيفط 2000 درهم»",
    truth:
      "حتى بائع جدي ماكيطلبش فلوس قبل ما تشوف المركبة. أي طلب أداء عن بُعد = نصب.",
  },
  {
    title: "الثمن اللي ماكيتصدقش",
    sign: "مرسيدس 2018 بـ 90 000 درهم «بسبب السفر المستعجل»",
    truth:
      "الأثمنة اللي أقل من السوق بـ40٪ فما فوق: إما المركبة عندها مشكل خطير، إما محجوزة، إما ماكايناش أصلاً.",
  },
  {
    title: "العدّاد المرجوع",
    sign: "سيارة 2014 بـ 60 000 كم فقط وبلا دفتر صيانة",
    truth:
      "قارن الكيلومتراج مع السنة: المعدل فالمغرب بين 12 و20 ألف كم فالسنة. اطلب قراءة العدّاد من الحاسوب.",
  },
  {
    title: "الوثائق «فطريقها»",
    sign: "«البطاقة الرمادية عند خويا، غادي توصل من بعد»",
    truth:
      "ماتشريش مركبة الوثائق ديالها ماشي فسمية البائع الحاضر معاك. الخطر: مركبة مرهونة أو مسروقة.",
  },
  {
    title: "الوسيط الوهمي",
    sign: "شخص كيقول ليك راه كيبيع نيابة عن صاحبها وكيطلب عمولة مقدماً",
    truth:
      "بلا وكالة موثقة عند العدول أو الموثق، ماكاين حتى حق للوسيط يبيع أو يقبض.",
  },
];

const DOCS = [
  ["البطاقة الرمادية", "أصلية، فسمية البائع، بلا شطب"],
  ["البطاقة الوطنية", "للبائع وللمشتري، مع نسخ"],
  ["عقد البيع", "نسختان موقعتان، مع الثمن والتاريخ ورقم الهيكل"],
  ["شهادة عدم الرهن", "من مركز التسجيل — كتأكد ماكاين لا قرض لا حجز"],
  ["الفحص التقني", "ساري المفعول يوم البيع"],
  ["وصولات الفينيات", "دفوعة على الأقل للسنة الجارية"],
];

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-12 max-w-2xl">
        <span className="eyebrow"><ShieldCheck size={13} /> حماية · نصائح ميدانية</span>
        <h1 className="h-page mt-4">شري بلا ما تتغلّط</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          أغلب المشاكل فسوق المستعمل ماشي فالمركبة — فالطريقة. هاد الدليل فيه اللائحة
          اللي كيتبعوها المحترفين، والنصب اللي كيتكرر بزاف فالمغرب.
        </p>
      </header>

      <section className="mb-14">
        <h2 className="h-section mb-2 flex items-center gap-2.5"><ClipboardCheck size={22} style={{ color: "var(--brand)" }} /> لائحة التحقق</h2>
        <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
          صالحة لأي مركبة. كتسجل تلقائياً فالمتصفح ديالك — نقدر تكمل من بعد.
        </p>
        <SafetyChecklist />
      </section>

      <section className="mb-14">
        <h2 className="h-section mb-6 flex items-center gap-2.5"><AlertTriangle size={22} style={{ color: "var(--bad)" }} /> النصب اللي خاصك تعرفو</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SCAMS.map((s) => (
            <div key={s.title} className="card p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--bad)" }}>
                <AlertTriangle size={15} /> {s.title}
              </h3>
              <p
                className="mt-3 rounded-lg p-3 text-xs italic leading-relaxed"
                style={{ background: "var(--surface-3)", color: "var(--text-dim)" }}
              >
                {s.sign}
              </p>
              <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {s.truth}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="h-section mb-6 flex items-center gap-2.5"><FileText size={22} style={{ color: "var(--brand)" }} /> الوثائق المطلوبة للبيع</h2>
        <div className="card overflow-x-auto p-5">
          <table className="w-full min-w-[420px] text-start text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--line)" }}>
                <th className="pb-2 font-extrabold">الوثيقة</th>
                <th className="pb-2 font-extrabold">شنو خاصك تتحقق منو</th>
              </tr>
            </thead>
            <tbody>
              {DOCS.map(([a, b]) => (
                <tr key={a} className="border-b" style={{ borderColor: "var(--line-soft)" }}>
                  <td className="py-3 font-bold">{a}</td>
                  <td className="py-3" style={{ color: "var(--text-muted)" }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          بعد البيع، تحويل الملكية (المطالبة بتغيير الملكية) كيدار فمركز التسجيل التابع
          للوكالة الوطنية للسلامة الطرقية. المشتري عندو أجل قانوني قصير باش يديرها —
          إذا ماتديرش، البائع كيبقى مسؤولاً عن المخالفات.
        </p>
      </section>

      <section className="card-raised zellige relative overflow-hidden p-10 text-center sm:p-14">
        <div className="glow pointer-events-none absolute inset-0" />
        <div className="relative">
          <span
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
            style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
          >
            <Wrench size={26} />
          </span>
          <h2 className="h-section mt-5">ماتبقاش تخمّن بوحدك</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            الفحص المستقل ديال طريق كيدوّز المركبة من <span className="num">120</span> نقطة
            قبل ما تدفع. بثمن أقل من إصلاح واحد صغير.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/inspection" className="btn btn-primary btn-lg"><Wrench size={16} /> شوف الفحص المستقل</Link>
            <Link href="/vehicles?verified=1" className="btn btn-ghost btn-lg"><BadgeCheck size={16} /> مركبات بوثائق موثقة</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
