import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { brandsOf } from "@/lib/slug";
import { Logo } from "./Logo";
import {
  Coins, Message, Navigation, ShieldCheck,
} from "./icons";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "المركبات",
    links: [
      { href: "/cars", label: "سيارات" },
      { href: "/motorcycles", label: "دراجات نارية" },
      { href: "/cars?deals=1", label: "أحسن الصفقات" },
      { href: "/cars?inspected=1", label: "مركبات مفحوصة" },
      { href: "/cars?fuel=electrique", label: "مركبات كهربائية" },
      { href: "/cars?priceMin=250000", label: "مركبات راقية" },
    ],
  },
  {
    title: "للمشترين",
    links: [
      { href: "/search", label: "البحث المتقدم" },
      { href: "/assistant", label: "مساعد الاختيار" },
      { href: "/compare", label: "المقارنة" },
      { href: "/favorites", label: "المفضلة والتنبيهات" },
      { href: "/cost", label: "حاسبة التكلفة الحقيقية" },
      { href: "/guides/chira-tomobil-mostaamla", label: "دليل الشراء" },
    ],
  },
  {
    title: "للبائعين",
    links: [
      { href: "/sell", label: "بيع مركبتك" },
      { href: "/promote", label: "روّج إعلانك" },
      { href: "/valuation", label: "قيّم مركبتك" },
      { href: "/dealers", label: "الوكلاء والمعارض" },
      { href: "/dashboard", label: "لوحة البائع" },
      { href: "/inspection", label: "اطلب فحصاً مستقلاً" },
      { href: "/register", label: "إنشاء حساب" },
    ],
  },
  {
    title: "المنصة",
    links: [
      { href: "/about", label: "من نحن" },
      { href: "/contact", label: "اتصل بنا" },
      { href: "/guides", label: "النصائح والأدلة" },
      { href: "/help", label: "مركز المساعدة" },
      { href: "/safety", label: "البيع الآمن" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { href: "/terms", label: "شروط الاستعمال" },
      { href: "/privacy", label: "سياسة الخصوصية" },
      { href: "/privacy#cookies", label: "ملفات تعريف الارتباط" },
      { href: "/help#rules", label: "قواعد النشر" },
    ],
  },
];

export function Footer() {
  const carBrands = brandsOf("car").slice(0, 12);
  const motoBrands = brandsOf("moto").slice(0, 9);

  return (
    <footer
      className="mt-20 border-t"
      style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
    >
      <div className="mx-auto max-w-[1400px] px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo size={40} />
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              سوق مغربي للسيارات والدراجات النارية، مبني على الشفافية: مؤشر ثقة لكل إعلان،
              ثمن مرجعي محسوب، وتكلفة استعمال حقيقية قبل ما تشري.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip chip-plain"><ShieldCheck size={12} /> صُنع في المغرب</span>
              <span className="chip chip-plain"><Coins size={12} /> بدون عمولة على المشتري</span>
              <span className="chip chip-plain"><Message size={12} /> دعم بالدارجة</span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-[13px] font-bold">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-[12.5px] transition hover:text-[var(--brand)]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rule my-9" />

        <div className="grid gap-8 lg:grid-cols-3">
          <div>
            <h4 className="mb-3 text-[11px] font-bold" style={{ color: "var(--text-dim)" }}>
              ماركات السيارات
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {carBrands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/cars/${b.slug}`}
                  className="chip chip-plain transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  <bdi dir="ltr">{b.make}</bdi>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-bold" style={{ color: "var(--text-dim)" }}>
              ماركات الدراجات
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {motoBrands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/motorcycles/${b.slug}`}
                  className="chip chip-plain transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  <bdi dir="ltr">{b.make}</bdi>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-bold" style={{ color: "var(--text-dim)" }}>
              المدن
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/cars?city=${c.slug}`}
                  className="chip chip-plain transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  {c.ar}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col items-start justify-between gap-4 border-t pt-6 text-[11px] sm:flex-row sm:items-center"
          style={{ borderColor: "var(--line-soft)", color: "var(--text-dim)" }}
        >
          <p>
            © <span className="num">2026</span> طريق TRIQ — سوق المركبات المستعملة
            فالمغرب. الأثمنة المرجعية محسوبة من الإعلانات المنشورة، وكتبقى تقديرية.
          </p>
          <div className="flex items-center gap-4">
            <span>
              <span className="num">1</span> مليون = <span className="num">10 000</span> د.م
            </span>
            <span className="flex items-center gap-2">
              <Navigation size={13} /> المغرب
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
