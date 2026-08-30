import type { Metadata } from "next";
import { Suspense } from "react";
import { PromoteClient } from "@/components/PromoteClient";
import { dictionaryOf, getDictionary } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = await dictionaryOf(locale);
  return {
    title: t.promotePage.metaTitle,
    description: t.promotePage.metaDesc,
    alternates: { canonical: localePath("/promote", locale) },
  };
}

export default async function PromotePage() {
  const t = await getDictionary();
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1100px] px-4 py-20 text-center text-sm">{t.promotePage.loading}</div>}>
      <PromoteClient />
    </Suspense>
  );
}
