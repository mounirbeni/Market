import type { Metadata } from "next";
import { FinancingClient } from "@/components/FinancingClient";
import { Coins } from "@/components/icons";

export const metadata: Metadata = {
  title: "محاكي تمويل السيارات في المغرب",
  description:
    "احسب القسط الشهري لتمويل سيارتك أو دراجتك: قرض كلاسيكي أو مرابحة تشاركية، مع نسبة الجهد من دخلك وكلفة القرض الكاملة.",
  alternates: { canonical: "/financing" },
};

export default function FinancingPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <header className="mb-8 max-w-2xl">
        <span className="eyebrow"><Coins size={13} /> تمويل</span>
        <h1 className="h-page mt-4">شحال غادي يكون القسط الشهري؟</h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          قارن بين القرض الكلاسيكي والمرابحة التشاركية على نفس المركبة، وشوف واش القسط
          مناسب لدخلك قبل ما تمشي للبنك.
        </p>
      </header>
      <FinancingClient />
    </div>
  );
}
