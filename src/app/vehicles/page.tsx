import { Suspense } from "react";
import type { Metadata } from "next";
import { VehiclesClient } from "@/components/search/VehiclesClient";

export const metadata: Metadata = {
  title: "سيارات ودراجات نارية مستعملة للبيع في المغرب",
  description:
    "تصفح مئات السيارات والدراجات النارية المستعملة في المغرب مع مؤشر ثقة وثمن مرجعي لكل إعلان. صفّي حسب المدينة، الثمن، الكيلومتراج والماركة.",
};

export default function VehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm" style={{ color: "var(--text-dim)" }}>
          كنحمّلو النتائج…
        </div>
      }
    >
      <VehiclesClient />
    </Suspense>
  );
}
