import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { dictionaryOf } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = await dictionaryOf(isLocale(lang) ? lang : DEFAULT_LOCALE);
  return { title: t.auth.registerTitle, description: t.auth.registerDesc, robots: { index: false, follow: true } };
}

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14">
      {/* AuthForm كيقرا ?next= بـuseSearchParams، فخاصو حدّ Suspense
          باش الصفحة تبقى قابلة للتوليد المسبق */}
      <Suspense fallback={<div className="card mx-auto h-[420px] max-w-md animate-pulse" />}>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
