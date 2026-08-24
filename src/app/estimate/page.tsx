import type { Metadata } from "next";
import { EstimateTool } from "@/components/EstimateTool";

export const metadata: Metadata = {
  title: "قيّم سيارتك أو دراجتك مجاناً",
  description:
    "احسب الثمن الحقيقي لسيارتك أو دراجتك النارية في السوق المغربي: تقدير فوري مبني على إعلانات مشابهة مع توقع خسارة القيمة على 5 سنوات.",
};

export default function EstimatePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 max-w-2xl">
        <span className="chip">مجاني · بلا تسجيل</span>
        <h1 className="section-title mt-4">شحال كتسوى مركبتك؟</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          دخّل المعطيات وغادي نحسبو ليك ثمناً مرجعياً من إعلانات مشابهة فالسوق المغربي،
          معدّلاً حسب السنة والكيلومتراج والحالة — بلا ما تخمّن ولا تسول الجيران.
        </p>
      </header>
      <EstimateTool />
    </div>
  );
}
