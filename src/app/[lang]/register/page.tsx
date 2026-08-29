import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "أنشئ حساباً مجانياً فطريق: انشر إعلاناتك، احفظ المركبات، وتوصلك تنبيهات الأثمنة.",
  robots: { index: false, follow: true },
};

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
