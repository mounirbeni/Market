import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, BadgeCheck, Car, Coins, FileText, Help, Message, ShieldAlert,
  ShieldCheck, Wallet, Wrench,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "مركز المساعدة",
  description: "أجوبة على الأسئلة الأكثر تكراراً حول النشر، البحث، الثقة، التمويل والفحص في منصة طريق.",
  alternates: { canonical: "/help" },
};

const TOPICS = [
  { Icon: Car, title: "الشراء والبحث", href: "#buying" },
  { Icon: Wallet, title: "البيع والإعلانات", href: "#selling" },
  { Icon: ShieldCheck, title: "الثقة والأمان", href: "#trust" },
  { Icon: Coins, title: "الأثمنة والتمويل", href: "#pricing" },
];

const FAQ: { id: string; heading: string; items: { q: string; a: string }[] }[] = [
  {
    id: "buying",
    heading: "الشراء والبحث",
    items: [
      {
        q: "كيفاش كنلقى المركبة المناسبة بسرعة؟",
        a: "استعمل البحث المتقدم وحدّد الماركة والثمن والمدينة — عدد النتائج كيتحدّث مباشرة. ولا اكتب طلبك بالدارجة فخانة البحث («كليو ديزل تحت 13 مليون فكازا») والموقع غادي يفهمها ويحوّلها لفلاتر.",
      },
      {
        q: "شنو كيعني «مؤشر الثقة»؟",
        a: "نقطة على 100 محسوبة من ست ركائز: توثيق البائع، الوثائق القانونية، سجل المركبة، شفافية الإعلان، اتساق المعطيات، والفحص المستقل. ماشي تقييم لجودة المركبة، بل لمستوى الشفافية والتحقق.",
      },
      {
        q: "علاش شي إعلانات مكتوب فيهم «مراجع محدودة»؟",
        a: "ملي ماكاينش عدد كافٍ من الإعلانات المشابهة، الثمن المرجعي كيولّي تقريبياً. فهاد الحالة كنقولوها بوضوح بدل ما نعطيوك رقماً غير دقيق.",
      },
      {
        q: "واش نقدر نحفظ بحث ويوصلني تنبيه؟",
        a: "إيه. من صفحة النتائج، كليكي على «احفظ البحث». البحوث المحفوظة كتلقاهم فصفحة المفضلة، وفالنسخة الكاملة كيوصلك إشعار ملي تدخل مركبة مطابقة.",
      },
    ],
  },
  {
    id: "selling",
    heading: "البيع والإعلانات",
    items: [
      {
        q: "شحال كيكلّف نشر إعلان؟",
        a: "النشر مجاني للأفراد بلا حدود، وبدون عمولة على البيع. الخدمات الاختيارية (ترويج الإعلان، الفحص المستقل، اشتراك المعارض) هي المدفوعة.",
        },
      {
        q: "كيفاش نرفع نقطة الثقة ديال إعلاني؟",
        a: "وثّق هويتك، زيد رقم الهيكل، ارفع أكثر من 12 صورة وفيديو، أرفق دفتر الصيانة، واطلب الفحص المستقل. معالج النشر كيبيّن ليك النقطة كتزيد مع كل معلومة.",
      },
      {
        q: "شحال كيبقى الإعلان منشوراً؟",
        a: "60 يوماً، وكيتجدّد تلقائياً إلا كنتي مازال نشيطاً. تقدر توقفو مؤقتاً ولا تعلّمو كمباع فأي وقت من لوحة البائع.",
      },
      {
        q: "علاش خاصني نحط ثمناً قريباً من السوق؟",
        a: "الإعلانات المسعّرة فمجال السوق كتوصلها اتصالات أكثر بزاف. ملي كتحط ثمناً أعلى بـ15٪ فما فوق، الإعلان كيبقى مدة طويلة بلا نتيجة.",
      },
    ],
  },
  {
    id: "trust",
    heading: "الثقة والأمان",
    items: [
      {
        q: "كيفاش نتفادى النصب؟",
        a: "ماتدفعش أي عربون قبل ما تشوف المركبة والوثائق. تلاقاو نهاراً وفبلاصة عامة. تحقق من البطاقة الرمادية ورقم الهيكل. وخلّي التواصل داخل المنصة باش يبقى عندك دليل مكتوب.",
      },
      {
        q: "لقيت إعلاناً مشبوهاً، شنو ندير؟",
        a: "بلّغ عليه من صفحة الإعلان أو عبر صفحة الاتصال. كنراجعو كل تبليغ داخل 24 ساعة وكنحيّدو الإعلانات المخالفة.",
      },
      {
        q: "واش المنصة كتضمن المركبات؟",
        a: "لا. طريق منصة إعلانات وماشي طرفاً فالبيع. الأدوات (مؤشر الثقة، الثمن المرجعي، الفحص) كتساعدك تقرر، ولكن المسؤولية النهائية ديال المعاينة والتحقق كتبقى عليك.",
      },
    ],
  },
  {
    id: "pricing",
    heading: "الأثمنة والتمويل",
    items: [
      {
        q: "منين كيجي الثمن المرجعي؟",
        a: "كيتحسب من إعلانات مشابهة فالمنصة، بعد تعديلها حسب العمر والكيلومتراج والحالة ونوع الوقود والقوة. كل تقدير معاه نسبة دقة كتبيّن قوة المراجع.",
      },
      {
        q: "شنو كتحسب «التكلفة الحقيقية»؟",
        a: "الفينيات حسب القوة الجبائية ونوع الوقود، التأمين، المحروقات، الصيانة، الإطارات، الفحص التقني، وخسارة القيمة — بالدرهم فالسنة وفالشهر ولكل كيلومتر.",
      },
      {
        q: "واش محاكي التمويل عرض ملزم؟",
        a: "لا. الحساب تقديري فقط. النسب الحقيقية كتحدد من طرف البنك حسب ملفك، ومعها مصاريف الملف والتأمين على القرض.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-12">
      <header className="mb-9 max-w-2xl">
        <span className="eyebrow"><Help size={13} /> مساعدة</span>
        <h1 className="h-page mt-3">مركز المساعدة</h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          أجوبة على الأسئلة الأكثر تكراراً. إلا ما لقيتيش جوابك، تواصل معنا مباشرة.
        </p>
      </header>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TOPICS.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className="card card-hover flex flex-col items-center gap-2 p-5 text-center"
          >
            <span
              className="grid h-11 w-11 place-items-center rounded-xl"
              style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
            >
              <t.Icon size={20} />
            </span>
            <span className="text-[12.5px] font-bold">{t.title}</span>
          </a>
        ))}
      </div>

      <div className="space-y-10">
        {FAQ.map((sec) => (
          <section key={sec.id} id={sec.id} className="scroll-mt-24">
            <h2 className="h-section mb-5">{sec.heading}</h2>
            <div className="space-y-3">
              {sec.items.map((it) => (
                <details key={it.q} className="card group p-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-[14px] font-bold">
                    {it.q}
                    <span
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px] transition group-open:rotate-45"
                      style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[13px] leading-loose" style={{ color: "var(--text-muted)" }}>
                    {it.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section id="rules" className="card mt-12 p-6 scroll-mt-24">
        <h2 className="flex items-center gap-2 text-[16px] font-bold">
          <FileText size={17} style={{ color: "var(--brand)" }} /> قواعد النشر باختصار
        </h2>
        <ul className="mt-3 space-y-2">
          {[
            "المركبة خاصها تكون فملكيتك أو عندك تفويض لبيعها",
            "الصور خاصها تكون حقيقية وللمركبة نفسها",
            "ممنوع الكذب على الكيلومتراج أو الحوادث أو الوثائق",
            "إعلان واحد لكل مركبة",
            "التصريح بأي رهن أو حجز إجباري",
          ].map((r) => (
            <li key={r} className="flex gap-2.5 text-[13px]" style={{ color: "var(--text-muted)" }}>
              <BadgeCheck size={15} className="mt-0.5 shrink-0" style={{ color: "var(--good)" }} /> {r}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="card-raised mt-8 flex flex-col items-center p-8 text-center"
        style={{ background: "var(--brand-soft)" }}
      >
        <Message size={26} style={{ color: "var(--brand)" }} />
        <h2 className="mt-4 text-lg font-bold">ما لقيتيش جوابك؟</h2>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          فريق الدعم كيجاوب بالدارجة من الإثنين للجمعة.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/contact" className="btn btn-primary btn-sm">اتصل بنا <ArrowLeft size={14} /></Link>
          <Link href="/safety" className="btn btn-ghost btn-sm"><ShieldAlert size={14} /> البيع الآمن</Link>
          <Link href="/inspection" className="btn btn-ghost btn-sm"><Wrench size={14} /> الفحص المستقل</Link>
        </div>
      </section>
    </div>
  );
}
