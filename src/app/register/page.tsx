import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "أنشئ حساباً مجانياً فطريق: انشر إعلاناتك، احفظ المركبات، وتوصلك تنبيهات الأثمنة.",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14">
      <AuthForm mode="register" />
    </div>
  );
}
