import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "دخل لحسابك فطريق باش توصل لإعلاناتك ورسائلك ومفضلتك.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14">
      {/* AuthForm كيقرا ?next= بـuseSearchParams، فخاصو حدّ Suspense
          باش الصفحة تبقى قابلة للتوليد المسبق */}
      <Suspense fallback={<div className="card mx-auto h-[420px] max-w-md animate-pulse" />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
