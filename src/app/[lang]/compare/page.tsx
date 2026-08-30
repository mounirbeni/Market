import type { Metadata } from "next";
import { CompareClient } from "@/components/CompareClient";
import { dictionaryOf, getDictionary } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = await dictionaryOf(isLocale(lang) ? lang : DEFAULT_LOCALE);
  return { title: t.comparePage.metaTitle, description: t.comparePage.metaDesc };
}

export default async function ComparePage() {
  const t = await getDictionary();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="h-page">{t.comparePage.title}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          {t.comparePage.lead}
        </p>
      </header>
      <CompareClient />
    </div>
  );
}
