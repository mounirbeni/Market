import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { CompleteProfile } from "@/components/dashboard/CompleteProfile";
import { dictionaryOf, getLocale } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = await dictionaryOf(locale);
  return { title: t.completeProfilePage.metaTitle, robots: { index: false, follow: false } };
}

export default async function CompleteProfilePage() {
  const locale = await getLocale();
  /* dashboard/layout.tsx خاصو خدام قبل هادي — إلا وصلنا هنا وماكاينش
     مستخدم، معناه الطلب دخل مباشرة بلا layout (نادر). نتأكدو مرة أخرى. */
  const user = await getCurrentUser();
  if (!user) redirect(localePath("/login?next=/dashboard/complete-profile", locale));
  if (user.onboarded) redirect(localePath("/dashboard", locale));

  return (
    <div className="mx-auto max-w-[560px] px-4 py-14">
      <Suspense fallback={<div className="card h-[520px] animate-pulse" />}>
        <CompleteProfile />
      </Suspense>
    </div>
  );
}
