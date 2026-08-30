import type { Metadata } from "next";
import { NotificationsClient } from "@/components/NotificationsClient";
import { getDictionary, dictionaryOf } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { Bell } from "@/components/icons";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = await dictionaryOf(locale);
  return { title: t.notificationsPage.metaTitle, robots: { index: false, follow: false } };
}

export default async function NotificationsPage() {
  const t = await getDictionary();
  return (
    <div className="mx-auto max-w-[820px] px-4 py-10">
      <header className="mb-7">
        <span className="eyebrow"><Bell size={13} /> {t.notificationsPage.eyebrow}</span>
        <h1 className="h-page mt-3">{t.notificationsPage.title}</h1>
      </header>
      <NotificationsClient />
    </div>
  );
}
