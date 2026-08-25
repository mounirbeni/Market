import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "دخل لحسابك فطريق باش توصل لإعلاناتك ورسائلك ومفضلتك.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14">
      <AuthForm mode="login" />
    </div>
  );
}
