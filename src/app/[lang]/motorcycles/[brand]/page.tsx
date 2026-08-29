import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehiclesClient } from "@/components/search/VehiclesClient";
import { VehiclesPageSkeleton } from "@/components/VehicleGridSkeleton";
import { PageTransition } from "@/components/PageTransition";
import { brandFromSlug } from "@/lib/slug";

/* الصفحة كتّرندر عند كل طلب.

   قبل كانت `generateStaticParams` وNext كيصنّفها SSG. المشكل: التخطيط
   الجذري كيقرا الكوكي (الجلسة فالهيدر)، يعني حتى صفحة ماتقدرش تتّبنى
   ساكنة بصح. ملي البناء كيلقى القائمة خاوية (قاعدة الإنتاج كانت خاوية
   ملي تبنا الموقع)، كل رابط جديد كيتحاول يتّبنى ساكن عند أول طلب —
   وتما كتطيح cookies() بـDYNAMIC_SERVER_USAGE و500 بدل الصفحة.

   يعني: كل إعلان جديد كان كيعطي 500. */
export const dynamic = "force-dynamic";

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
    <PageTransition>
      <Suspense fallback={<VehiclesPageSkeleton />}>
        <VehiclesClient
          lockKind="moto"
          lockBrand={make}
          basePath={`/motorcycles/${brand}`}
          heading={`دراجات ${make} في المغرب`}
          intro={`كل إعلانات ${make} المتوفرة حالياً، مرتّبة حسب الأنسب. صفّي حسب الموديل، السنة، الثمن أو المدينة.`}
        />
      </Suspense>
    </PageTransition>
  );
}
