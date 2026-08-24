import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    title: "الشراء",
    links: [
      { href: "/vehicles?kind=car", label: "سيارات مستعملة" },
      { href: "/vehicles?kind=moto", label: "دراجات نارية" },
      { href: "/vehicles?deals=1", label: "أحسن الصفقات" },
      { href: "/vehicles?inspected=1", label: "مركبات مفحوصة" },
      { href: "/compare", label: "قارن بين المركبات" },
    ],
  },
  {
    title: "البيع",
    links: [
      { href: "/sell", label: "انشر إعلانك" },
      { href: "/estimate", label: "قيّم مركبتك مجاناً" },
      { href: "/inspection", label: "اطلب فحصاً مستقلاً" },
      { href: "/safety", label: "دليل البيع الآمن" },
    ],
  },
  {
    title: "أدوات",
    links: [
      { href: "/cost", label: "حاسبة التكلفة الحقيقية" },
      { href: "/cost#credit", label: "محاكي التمويل" },
      { href: "/favorites", label: "مفضلتي" },
      { href: "/safety#checklist", label: "لائحة التحقق قبل الشراء" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t" style={{ borderColor: "var(--line-soft)", background: "var(--bg-raised)" }}>
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo size={38} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              سوق مغربي للسيارات والدراجات النارية المستعملة، مبني على الشفافية:
              مؤشر ثقة لكل إعلان، ثمن مرجعي محسوب، وتكلفة استعمال حقيقية قبل ما تشري.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
              <span className="chip">🇲🇦 صُنع في المغرب</span>
              <span className="chip">بدون عمولة على المشتري</span>
              <span className="chip">دعم بالدارجة</span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-extrabold">{col.title}</h4>
              <ul className="space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="transition hover:text-[var(--accent)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider-zellige my-8" />

        <div>
          <h4 className="mb-3 text-xs font-extrabold" style={{ color: "var(--text-muted)" }}>
            تصفح حسب المدينة
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {CITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/vehicles?city=${c.slug}`}
                className="chip transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {c.ar}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center"
          style={{ borderColor: "var(--line-soft)", color: "var(--text-dim)" }}>
          <p>
            © <span className="num">2026</span> طريق TRIQ — منصة تجريبية. الأثمنة والمعطيات
            المعروضة لأغراض العرض التقني.
          </p>
          <p>الأثمنة بالدرهم المغربي · <span className="num">1</span> مليون = <span className="num">10 000</span> د.م</p>
        </div>
      </div>
    </footer>
  );
}
