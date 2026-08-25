import { Suspense } from "react";
import type { Metadata } from "next";
import { VehiclesClient } from "@/components/search/VehiclesClient";

export const metadata: Metadata = {
  title: "سيارات مستعملة للبيع في المغرب",
  description:
    "تصفح السيارات المستعملة والجديدة في المغرب مع مؤشر ثقة وثمن مرجعي لكل إعلان. صفّي حسب الماركة، المدينة، الثمن، الكيلومتراج ونوع الوقود.",
  alternates: { canonical: "/cars" },
};

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1400px] px-4 py-20 text-center text-sm">كنحمّلو…</div>}>
      <VehiclesClient
        lockKind="car"
        basePath="/cars"
        heading="سيارات للبيع في المغرب"
        intro="كل إعلان معاه مؤشر ثقة محسوب وثمن مرجعي من السوق، باش تعرف واش الصفقة معقولة قبل ما تتصل بالبائع."
      />
    </Suspense>
  );
}
