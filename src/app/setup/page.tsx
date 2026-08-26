import type { Metadata } from "next";
import { SetupClient } from "@/components/SetupClient";

export const metadata: Metadata = {
  title: "إعداد قاعدة البيانات",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-10">
      <h1 className="h-page">إعداد قاعدة البيانات</h1>
      <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        هاد الصفحة كتصاوب الجداول وكتعمّرها بالإعلانات التجريبية. كتّدار مرة
        وحدة على قاعدة خاوية — ملي تكون فيها إعلانات، ماكتمسّهاش.
      </p>
      <SetupClient />
    </div>
  );
}
