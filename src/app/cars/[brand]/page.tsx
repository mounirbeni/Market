import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehiclesClient } from "@/components/search/VehiclesClient";
import { brandFromSlug, brandsWithCounts } from "@/lib/slug";

export function generateStaticParams() {
  return brandsWithCounts("car").map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  const make = brandFromSlug(brand, "car");
  if (!make) return { title: "ماركة غير موجودة" };
  return {
    title: `سيارات ${make} مستعملة في المغرب`,
    description: `كل إعلانات ${make} المتوفرة في المغرب مع مؤشر ثقة وثمن مرجعي محسوب لكل مركبة.`,
    alternates: { canonical: `/cars/${brand}` },
  };
}

export default async function CarBrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const make = brandFromSlug(brand, "car");
  if (!make) notFound();

  return (
    <Suspense fallback={<div className="mx-auto max-w-[1400px] px-4 py-20 text-center text-sm">كنحمّلو…</div>}>
      <VehiclesClient
        lockKind="car"
        lockBrand={make}
        basePath={`/cars/${brand}`}
        heading={`سيارات ${make} في المغرب`}
        intro={`كل إعلانات ${make} المتوفرة حالياً، مرتّبة حسب الأنسب. صفّي حسب الموديل، السنة، الثمن أو المدينة.`}
      />
    </Suspense>
  );
}
