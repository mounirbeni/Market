import type { Metadata } from "next";
import { Suspense } from "react";
import { PromoteClient } from "@/components/PromoteClient";

export const metadata: Metadata = {
  title: "روّج إعلانك — بيع أسرع",
  description:
    "خيارات ترويج الإعلانات فطريق: فأعلى اللائحة، بيع مستعجل، وإعلان مميّز. شوف الفرق فالمشاهدات وشحال كيسوى كل خيار.",
  alternates: { canonical: "/promote" },
};

export default function PromotePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1100px] px-4 py-20 text-center text-sm">كنحمّلو…</div>}>
      <PromoteClient />
    </Suspense>
  );
}
