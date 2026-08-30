import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { dictionaryOf, getDictionary } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { Reset, WifiOff } from "@/components/icons";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = await dictionaryOf(locale);
  return { title: t.offlinePage.metaTitle, robots: { index: false, follow: false } };
}

/**
 * الصفحة اللي كيوريها Service Worker ملي التطبيق مزاد للشاشة
 * الرئيسية والتيليفون بلا شبكة. مخزّنة فcache وقت التنصيب —
 * خاصها تبقى صفحة بسيطة بلا اعتماد على طلب شبكة جديد.
 */
export default async function OfflinePage() {
  const t = await getDictionary();
  const o = t.offlinePage;
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span
        className="grid h-16 w-16 place-items-center rounded-2xl"
        style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
      >
        <WifiOff size={30} />
      </span>
      <h1 className="mt-5 text-2xl font-black">{o.title}</h1>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {o.text}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <a href="/" className="btn btn-primary"><Reset size={16} /> {o.retry}</a>
        <Link href="/" className="btn btn-ghost">{o.home}</Link>
      </div>
    </div>
  );
}
