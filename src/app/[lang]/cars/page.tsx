import { Suspense } from "react";
import type { Metadata } from "next";
import { VehiclesClient } from "@/components/search/VehiclesClient";
import { VehiclesPageSkeleton } from "@/components/VehicleGridSkeleton";
import { PageTransition } from "@/components/PageTransition";
import { dictionaryOf, getDictionary } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = await dictionaryOf(locale);
  return {
    title: t.pages.cars.metaTitle,
    description: t.pages.cars.metaDesc,
    alternates: { canonical: localePath("/cars", locale) },
  };
}

export default async function CarsPage() {
  const t = await getDictionary();
  return (
    <PageTransition>
      <Suspense fallback={<VehiclesPageSkeleton />}>
        <VehiclesClient
          lockKind="car"
          basePath="/cars"
          heading={t.pages.cars.heading}
          intro={t.pages.cars.intro}
        />
      </Suspense>
    </PageTransition>
  );
}
