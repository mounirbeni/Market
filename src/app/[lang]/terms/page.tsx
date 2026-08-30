import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { dictionaryOf, getDictionary } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = await dictionaryOf(locale);
  return {
    title: t.termsPage.metaTitle,
    description: t.termsPage.metaDescription,
    alternates: { canonical: localePath("/terms", locale) },
  };
}

export default async function TermsPage() {
  const t = await getDictionary();
  const p = t.termsPage;
  return (
    <LegalPage title={p.title} updated={p.updated} intro={p.intro} sections={p.sections} />
  );
}
