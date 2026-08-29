import type { Metadata } from "next";
import Link from "next/link";
import { getDealers, getStats } from "@/lib/source";
import { CITIES } from "@/lib/cities";
import { formatNumber } from "@/lib/format";
import {
  ArrowLeft, BadgeCheck, Calculator, Car, MapPin, Scale, ShieldCheck, Sparkle,
  Users, Wrench,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "طريق منصة مغربية لبيع وشراء السيارات والدراجات النارية، مبنية على الشفافية: مؤشر ثقة، ثمن مرجعي، وتكلفة استعمال حقيقية.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  /* العدّ كيجي من قاعدة البيانات ملي تكون موصولة */
  const [site, dealers] = await Promise.all([getStats(), getDealers()]);

  const stats = [
    { Icon: Car, v: formatNumber(site.cars + site.motos), l: "مركبة معروضة" },
    { Icon: Users, v: formatNumber(dealers.length), l: "معرض معتمد" },
    { Icon: MapPin, v: formatNumber(CITIES.length), l: "مدينة مغربية" },
    { Icon: BadgeCheck, v: "120", l: "نقطة فحص" },
  ];

  const values = [
    {
      Icon: ShieldCheck,
      color: "var(--good)",
      title: "الشفافية قبل كلشي",
      text: "ماكنخبيوش المعلومة الصعيبة. إلا كان الكيلومتراج مشبوه، ولا الوثائق ناقصة، ولا الثمن بعيد على السوق — كنقولوها بوضوح فالإعلان.",
    },
    {
      Icon: Scale,
      color: "var(--brand)",
      title: "أرقام ماشي انطباعات",
      text: "الثمن المرجعي محسوب من إعلانات حقيقية، ومؤشر الثقة مبني على معايير معلنة. وملي ماتكفيش المعطيات، كنقولو «مراجع محدودة» بدل ما نخترعو رقماً.",
    },
    {
      Icon: Calculator,
      color: "var(--data)",
      title: "التكلفة الحقيقية",
      text: "ثمن الشراء ماشي هو التكلفة. كنحسبو الفينيات والتأمين والمحروقات والصيانة وخسارة القيمة باش تعرف شنو غادي تصرف فعلاً.",
    },
    {
      Icon: Wrench,
      color: "var(--warn)",
      title: "فحص مستقل",
      text: "الفحص كيديرو ميكانيكي ماعندو حتى علاقة بالبائع، والتقرير كيوصل المشتري مباشرة.",
    },
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12">
      <header className="mb-12 max-w-2xl">
        <span className="eyebrow"><Sparkle size={13} /> من نحن</span>
        <h1 className="h-page mt-4">سوق مركبات مبني على الثقة</h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          سوق المركبات المستعملة فالمغرب كبير، ولكن المشتري غالباً كيقرر بلا معلومة كافية:
          واش هاد الثمن معقول؟ واش البائع ثقة؟ وشحال غادي تكلّفني هاد السيارة فالسنة؟
          طريق تبنات باش تجاوب على هاد الأسئلة الثلاثة قبل أي اتصال.
        </p>
      </header>

      <section className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="card p-5 text-center">
            <span
              className="mx-auto grid h-11 w-11 place-items-center rounded-xl"
              style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
            >
              <s.Icon size={20} />
            </span>
            <div className="num mt-3 text-2xl font-extrabold">{s.v}</div>
            <div className="mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>{s.l}</div>
          </div>
        ))}
      </section>

      <section className="mb-14">
        <h2 className="h-section mb-7">قيمنا</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {values.map((v) => (
            <article key={v.title} className="card p-6">
              <span
                className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: `color-mix(in oklab, ${v.color} 13%, transparent)`, color: v.color }}
              >
                <v.Icon size={21} />
              </span>
              <h3 className="mt-4 text-[16px] font-bold">{v.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {v.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="h-section mb-5">نموذج العمل</h2>
        <div className="card p-6">
          <p className="text-[13.5px] leading-loose" style={{ color: "var(--text-muted)" }}>
            نشر الإعلان مجاني للأفراد، وبدون أي عمولة على المشتري. المداخيل كتجي من خدمات
            اختيارية: ترويج الإعلانات، اشتراكات المعارض، وخدمة الفحص المستقل.
          </p>
          <p className="mt-3 text-[13.5px] leading-loose" style={{ color: "var(--text-muted)" }}>
            هاد النموذج مقصود: ماعندناش مصلحة فرفع الأثمنة ولا فإخفاء المعلومات، لأن الأداء
            ماكيجيش من نسبة على البيع.
          </p>
        </div>
      </section>

      <section
        className="card-raised zellige relative overflow-hidden p-10 text-center"
        style={{ background: "var(--brand-soft)" }}
      >
        <h2 className="h-section">بغيتي تبدا؟</h2>
        <p className="mx-auto mt-3 max-w-lg text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          تصفّح المركبات المتوفرة، ولا انشر إعلانك مجاناً وشوف نقطة الثقة ديالك كتبنى مباشرة.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/cars" className="btn btn-primary">تصفح المركبات</Link>
          <Link href="/contact" className="btn btn-ghost">اتصل بنا <ArrowLeft size={15} className="dir-flip" /></Link>
        </div>
      </section>
    </div>
  );
}
