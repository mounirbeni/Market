import { Suspense } from "react";
import type { Metadata } from "next";
import { VehiclesClient } from "@/components/search/VehiclesClient";
import { VehiclesPageSkeleton } from "@/components/VehicleGridSkeleton";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "دراجات نارية مستعملة للبيع في المغرب",
  description:
    "دراجات نارية وسكوتر للبيع في المغرب: رياضية، رودستر، طرق وعرة وكوستوم — مع مؤشر ثقة وثمن مرجعي لكل إعلان.",
  alternates: { canonical: "/motorcycles" },
};

export default function MotorcyclesPage() {
  return (
    <PageTransition>
      <Suspense fallback={<VehiclesPageSkeleton />}>
        <VehiclesClient
          lockKind="moto"
          basePath="/motorcycles"
          heading="دراجات نارية للبيع في المغرب"
          intro="من السكوتر ديال المدينة حتى دراجات الطرق الوعرة — كل إعلان بمؤشر ثقة وثمن مرجعي محسوب."
        />
      </Suspense>
    </PageTransition>
  );
}
