import type { Metadata } from "next";
import { FavoritesClient } from "@/components/FavoritesClient";
import { dictionaryOf } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = await dictionaryOf(locale);
  return {
    title: t.favoritesPage.metaTitle,
    description: t.favoritesPage.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <FavoritesClient />
    </div>
  );
}
