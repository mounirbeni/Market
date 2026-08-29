import { Suspense } from "react";
import type { Metadata } from "next";
import { VehiclesClient } from "@/components/search/VehiclesClient";
import { VehiclesPageSkeleton } from "@/components/VehicleGridSkeleton";

export const metadata: Metadata = {
  title: "سيارات ودراجات نارية مستعملة للبيع في المغرب",
  description:
    "تصفح مئات السيارات والدراجات النارية المستعملة في المغرب مع مؤشر ثقة وثمن مرجعي لكل إعلان. صفّي حسب المدينة، الثمن، الكيلومتراج والماركة.",
};

export default function VehiclesPage() {
  return (
    <Suspense fallback={<VehiclesPageSkeleton />}>
      <VehiclesClient />
    </Suspense>
  );
}
