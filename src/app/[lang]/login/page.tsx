import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Logo";
import { dictionaryOf, getDictionary } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = await dictionaryOf(isLocale(lang) ? lang : DEFAULT_LOCALE);
  return { title: t.auth.loginTitle, description: t.auth.loginDesc, robots: { index: false, follow: true } };
}

export default async function LoginPage() {
  const t = await getDictionary();

  return (
    <>
      {/* شاشة ترحيب — هوية بصرية كحلية متدرجة بحال باقي "الكروم" فالمنصة،
          بلا ما تفرض نفسها على الزوار: خاصة بصفحة /login فقط */}
      <section
        className="text-center"
        style={{
          background: "linear-gradient(160deg, #040c1a 0%, #0a1e3d 55%, #0d2a55 100%)",
          color: "#fff",
        }}
      >
        <div className="mx-auto max-w-lg px-4 py-16 sm:py-20">
          <div className="flex justify-center">
            <Logo size={56} />
          </div>
          <h1 className="h-page mt-6" style={{ color: "#fff" }}>{t.auth.welcome.title}</h1>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "#b9c9e4" }}>
            {t.auth.welcome.lead}
          </p>
          <a href="#auth-form" className="btn btn-primary btn-lg mt-7 inline-flex">
            {t.auth.welcome.getStarted}
          </a>
        </div>
      </section>

      <div id="auth-form" className="mx-auto max-w-[1100px] px-4 py-14">
        {/* AuthForm كيقرا ?next= بـuseSearchParams، فخاصو حدّ Suspense
            باش الصفحة تبقى قابلة للتوليد المسبق */}
        <Suspense fallback={<div className="card mx-auto h-[420px] max-w-md animate-pulse" />}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </>
  );
}
