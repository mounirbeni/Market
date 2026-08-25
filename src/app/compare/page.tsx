import type { Metadata } from "next";
import { CompareClient } from "@/components/CompareClient";

export const metadata: Metadata = {
  title: "قارن بين المركبات",
  description:
    "قارن حتى ثلاث سيارات أو دراجات نارية جنباً إلى جنب: الثمن، مؤشر الثقة، تكلفة الاستعمال السنوية والمواصفات الكاملة.",
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="h-page">المقارنة</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          ماشي غير المواصفات — قارن الثقة، الثمن مقابل السوق، وشحال غادي تصرف فالسنة.
        </p>
      </header>
      <CompareClient />
    </div>
  );
}
