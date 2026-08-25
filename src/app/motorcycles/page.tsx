import { Suspense } from "react";
import type { Metadata } from "next";
import { VehiclesClient } from "@/components/search/VehiclesClient";

export const metadata: Metadata = {
  title: "دراجات نارية مستعملة للبيع في المغرب",
  description:
    "دراجات نارية وسكوتر للبيع في المغرب: رياضية، رودستر، طرق وعرة وكوستوم — مع مؤشر ثقة وثمن مرجعي لكل إعلان.",
  alternates: { canonical: "/motorcycles" },
};

export default function MotorcyclesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1400px] px-4 py-20 text-center text-sm">كنحمّلو…</div>}>
      <VehiclesClient
        lockKind="moto"
        basePath="/motorcycles"
        heading="دراجات نارية للبيع في المغرب"
        intro="من السكوتر ديال المدينة حتى دراجات الطرق الوعرة — كل إعلان بمؤشر ثقة وثمن مرجعي محسوب."
      />
    </Suspense>
  );
}
