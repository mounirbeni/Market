import type { Metadata } from "next";
import { MessagesClient } from "@/components/MessagesClient";
import { getDictionary, dictionaryOf } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { Message } from "@/components/icons";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = await dictionaryOf(locale);
  return { title: t.messagesPage.metaTitle, robots: { index: false, follow: false } };
}

export default async function MessagesPage() {
  const t = await getDictionary();
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <header className="mb-7">
        <span className="eyebrow"><Message size={13} /> {t.messagesPage.eyebrow}</span>
        <h1 className="h-page mt-3">{t.messagesPage.title}</h1>
      </header>
      <MessagesClient />
    </div>
  );
}
