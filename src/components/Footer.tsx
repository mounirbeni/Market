import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { Logo } from "./Logo";
import {
  BadgeCheck, Bell, Calculator, Car, ClipboardCheck, Coins, Message, Moto,
  Scale, ShieldCheck, TrendingDown, Wallet, Wrench,
} from "./icons";

const COLUMNS = [
  {
    title: "الشراء",
    links: [
      { href: "/vehicles?kind=car", label: "سيارات مستعملة", Icon: Car },
      { href: "/vehicles?kind=moto", label: "دراجات نارية", Icon: Moto },
      { href: "/vehicles?deals=1", label: "أحسن الصفقات", Icon: TrendingDown },
      { href: "/vehicles?inspected=1", label: "مركبات مفحوصة", Icon: BadgeCheck },
      { href: "/compare", label: "قارن بين المركبات", Icon: Scale },
    ],
  },
  {
    title: "البيع",
    links: [
      { href: "/sell", label: "انشر إعلانك", Icon: Wallet },
      { href: "/estimate", label: "قيّم مركبتك مجاناً", Icon: Coins },
      { href: "/inspection", label: "اطلب فحصاً مستقلاً", Icon: Wrench },
      { href: "/safety", label: "دليل البيع الآمن", Icon: ShieldCheck },
    ],
  },
  {
    title: "أدوات",
    links: [
      { href: "/cost", label: "حاسبة التكلفة الحقيقية", Icon: Calculator },
      { href: "/cost#credit", label: "محاكي التمويل", Icon: Coins },
      { href: "/favorites", label: "مفضلتي وتنبيهاتي", Icon: Bell },
      { href: "/safety#checklist", label: "لائحة التحقق قبل الشراء", Icon: ClipboardCheck },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t" style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}>
      <div className="mx-auto max-w-[1400px] px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo size={40} />
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              سوق مغربي للسيارات والدراجات النارية المستعملة، مبني على الشفافية: مؤشر ثقة
              لكل إعلان، ثمن مرجعي محسوب، وتكلفة استعمال حقيقية قبل ما تشري.
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
                      className="group flex items-center gap-2 text-[12.5px] transition hover:text-[var(--brand)]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <l.Icon size={14} className="shrink-0 opacity-50 transition group-hover:opacity-100" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rule my-9" />

        <div>
          <h4 className="mb-3 text-[11px] font-bold" style={{ color: "var(--text-dim)" }}>
            تصفح حسب المدينة
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {CITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/vehicles?city=${c.slug}`}
                className="chip chip-plain transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                {c.ar}
              </Link>
            ))}
          </div>
        </div>

        <div
          className="mt-10 flex flex-col items-start justify-between gap-3 border-t pt-6 text-[11px] sm:flex-row sm:items-center"
          style={{ borderColor: "var(--line-soft)", color: "var(--text-dim)" }}
        >
          <p>
            © <span className="num">2026</span> طريق TRIQ — منصة تجريبية. الأثمنة والمعطيات
            المعروضة لأغراض العرض التقني.
          </p>
          <p>
            الأثمنة بالدرهم المغربي · <span className="num">1</span> مليون ={" "}
            <span className="num">10 000</span> د.م
          </p>
        </div>
      </div>
    </footer>
  );
}
