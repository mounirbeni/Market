import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/Shell";
import { DealerProfileForm } from "@/components/dashboard/DealerProfile";
import { dictionaryOf, getDictionary } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = await dictionaryOf(locale);
  return { title: t.dealerForm.metaTitle, robots: { index: false, follow: false } };
}

export default async function DealerPage() {
  const t = await getDictionary();
  return (
    <DashboardShell title={t.dealerForm.metaTitle}>
      <DealerProfileForm />
    </DashboardShell>
  );
}
