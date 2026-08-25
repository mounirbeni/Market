import type { Metadata } from "next";
import { Suspense } from "react";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { SmartSearch } from "@/components/SmartSearch";
import { Search } from "@/components/icons";

export const metadata: Metadata = {
  title: "البحث المتقدم عن المركبات",
  description:
    "ابحث عن سيارتك أو دراجتك بدقة: الماركة، الموديل، الهيكل، الثمن، السنة، الكيلومتراج، الوقود، الناقل والمدينة — مع عدد النتائج مباشرة.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <header className="mb-8 max-w-2xl">
        <span className="eyebrow"><Search size={13} /> بحث دقيق</span>
        <h1 className="h-page mt-4">البحث المتقدم</h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          حدّد كل معايير المركبة اللي كتقلّب عليها. عدد النتائج كيتحدّث مباشرة مع كل اختيار،
          فتعرف واش المعايير ديالك واقعية قبل ما تشوف النتائج.
        </p>
      </header>

      <div className="mb-8">
        <Suspense fallback={null}>
          <SmartSearch big />
        </Suspense>
      </div>

      <AdvancedSearch />
    </div>
  );
}
