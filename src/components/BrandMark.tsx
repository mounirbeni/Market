import { brandByName, brandInitials, hasOfficialLogo } from "@/lib/brands";

/* ============================================================
   شارة الماركة

   ماكنستعملوش الشعارات الرسمية للصانعين — هي علامات تجارية مسجّلة.
   كنعرضو شارة نصية مصمّمة (اسم الماركة بحروف لاتينية + لون مرجعي).

   إلا توفّر عندك حق استعمال الشعار الرسمي:
     1. حطّ الملف فـ public/brands/<slug>.svg
     2. زيد الـslug فـ OFFICIAL_LOGOS داخل src/lib/brands.ts
   وغادي يتبدّل تلقائياً فكل الموقع.
   ============================================================ */

interface Props {
  /** اسم الماركة بالحروف اللاتينية */
  name: string;
  size?: number;
  /** الشكل: wordmark = الاسم كامل، monogram = حرفين */
  variant?: "wordmark" | "monogram";
  className?: string;
}

export function BrandMark({ name, size = 44, variant = "wordmark", className = "" }: Props) {
  const meta = brandByName(name);
  const accent = meta?.accent ?? "var(--brand)";
  const slug = meta?.slug;

  // شعار الماركة — كيتعرض داخل مربع فاتح باش يبان فالوضعين فاتح وداكن
  if (slug && hasOfficialLogo(slug)) {
    return (
      <span
        className={`logo-plate grid shrink-0 place-items-center ${className}`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/brands/${slug}.svg`}
          alt={name}
          width={Math.round(size * 0.62)}
          height={Math.round(size * 0.62)}
          loading="lazy"
          decoding="async"
          className="object-contain"
          style={{ width: size * 0.62, height: size * 0.62 }}
        />
      </span>
    );
  }

  const isMono = variant === "monogram";
  const text = isMono ? brandInitials(name) : name;

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-xl ${className}`}
      style={{
        width: isMono ? size : undefined,
        minWidth: isMono ? size : size * 1.6,
        height: size,
        padding: isMono ? 0 : `0 ${size * 0.22}px`,
        background: "var(--surface-3)",
        border: "1px solid var(--line-soft)",
      }}
    >
      <bdi
        dir="ltr"
        className="truncate font-extrabold leading-none tracking-tight"
        style={{
          color: `color-mix(in oklab, ${accent} 62%, var(--text))`,
          fontSize: isMono ? size * 0.38 : Math.min(size * 0.4, 15),
          letterSpacing: isMono ? "0.02em" : "-0.01em",
        }}
      >
        {text}
      </bdi>
    </span>
  );
}

/** بطاقة ماركة كاملة — الشارة + العدد، كتستعمل فالشبكات */
export function BrandTile({
  name, count, href, kind,
}: { name: string; count?: number; href: string; kind?: "car" | "moto" }) {
  const meta = brandByName(name);
  const accent = meta?.accent ?? "var(--brand)";

  return (
    <a
      href={href}
      className="card card-hover group relative flex min-w-0 flex-col items-center justify-center gap-2 overflow-hidden px-2 py-4 text-center"
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: accent }}
      />
      <BrandMark name={name} size={38} variant="monogram" />
      <bdi dir="ltr" className="w-full truncate text-[12.5px] font-extrabold leading-none">
        {name}
      </bdi>
      {/* بلا عدد ملي مازال ماكاينش إعلان فهاد الماركة — الصفحة
          كتبقى موجودة وكتبيّن حالة فارغة */}
      {count !== undefined && count > 0 && (
        <span className="text-[10px] leading-none" style={{ color: "var(--text-dim)" }}>
          <span className="num">{count}</span> {kind === "moto" ? "دراجة" : "إعلان"}
        </span>
      )}
    </a>
  );
}
