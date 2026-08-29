import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { CompleteProfile } from "@/components/dashboard/CompleteProfile";

export const metadata: Metadata = {
  title: "استكمال الملف الشخصي",
  robots: { index: false, follow: false },
};

export default async function CompleteProfilePage() {
  /* dashboard/layout.tsx خاصو خدام قبل هادي — إلا وصلنا هنا وماكاينش
     مستخدم، معناه الطلب دخل مباشرة بلا layout (نادر). نتأكدو مرة أخرى. */
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/complete-profile");
  if (user.onboarded) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-[560px] px-4 py-14">
      <Suspense fallback={<div className="card h-[520px] animate-pulse" />}>
        <CompleteProfile />
      </Suspense>
    </div>
  );
}
