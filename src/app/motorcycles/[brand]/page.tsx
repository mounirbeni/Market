import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehiclesClient } from "@/components/search/VehiclesClient";
import { brandFromSlug, brandsWithCounts } from "@/lib/slug";

export function generateStaticParams() {
  return brandsWithCounts("moto").map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  const make = brandFromSlug(brand, "moto");
  if (!make) return { title: "ماركة غير موجودة" };
  return {
    title: `دراجات ${make} مستعملة في المغرب`,
    description: `كل إعلانات دراجات ${make} المتوفرة في المغرب مع مؤشر ثقة وثمن مرجعي محسوب لكل مركبة.`,
    alternates: { canonical: `/motorcycles/${brand}` },
  };
}

export default async function MotoBrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const make = brandFromSlug(brand, "moto");
  if (!make) notFound();

  return (
    <Suspense fallback={<div className="mx-auto max-w-[1400px] px-4 py-20 text-center text-sm">كنحمّلو…</div>}>
      <VehiclesClient
        lockKind="moto"
        lockBrand={make}
        basePath={`/motorcycles/${brand}`}
        heading={`دراجات ${make} في المغرب`}
        intro={`كل إعلانات ${make} المتوفرة حالياً، مرتّبة حسب الأنسب. صفّي حسب الموديل، السنة، الثمن أو المدينة.`}
      />
    </Suspense>
  );
}
