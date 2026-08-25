import type { Metadata } from "next";
import { CostClient } from "@/components/CostClient";
import { Calculator, Coins, Info } from "@/components/icons";

export const metadata: Metadata = {
  title: "حاسبة التكلفة الحقيقية للسيارة في المغرب",
  description:
    "احسب التكلفة السنوية الحقيقية لسيارتك: الفينيات حسب القوة الجبائية، التأمين، المحروقات، الصيانة، الإطارات، الفحص التقني وخسارة القيمة — بالدرهم لكل كيلومتر.",
};

const VIGNETTE_ROWS: [string, string, string][] = [
  ["≤ 7 حصان", "350 د.م", "700 د.م"],
  ["8 — 10 حصان", "650 د.م", "1 500 د.م"],
  ["11 — 14 حصان", "3 000 د.م", "6 000 د.م"],
  ["≥ 15 حصان", "8 000 د.م", "20 000 د.م"],
];

export default function CostPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 max-w-2xl">
        <span className="eyebrow"><Calculator size={13} /> الأداة اللي ماكاينة فحتى موقع مغربي</span>
        <h1 className="h-page mt-4">ثمن الشراء ماشي هو التكلفة</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          سيارة رخيصة ممكن تكون غالية فالاستعمال. هنا كتشوف بالضبط شحال غادي تصرف
          فالسنة: الضريبة، التأمين، المازوط، الصيانة، الإطارات، الفحص التقني وخسارة
          القيمة — وكاع مقارنة مع باقي المركبات.
        </p>
      </header>

      <CostClient />

      <section className="card mt-10 p-5">
        <h2 className="flex items-center gap-2 text-[15px] font-bold">
          <Coins size={17} style={{ color: "var(--brand)" }} /> جدول الضريبة الخصوصية السنوية (الفينيات)
        </h2>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          التعريفة كتحدد حسب القوة الجبائية ونوع الوقود. الديزل كيأدي أكثر من البنزين.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-right text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--line)" }}>
                <th className="pb-2 font-extrabold">القوة الجبائية</th>
                <th className="pb-2 font-extrabold">بنزين</th>
                <th className="pb-2 font-extrabold">ديزل</th>
              </tr>
            </thead>
            <tbody>
              {VIGNETTE_ROWS.map((r) => (
                <tr key={r[0]} className="border-b" style={{ borderColor: "var(--line-soft)" }}>
                  <td className="py-2.5 font-bold">{r[0]}</td>
                  <td className="num py-2.5" style={{ color: "var(--text-muted)" }}>{r[1]}</td>
                  <td className="num py-2.5" style={{ color: "var(--text-muted)" }}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex gap-2 text-[11px]" style={{ color: "var(--text-dim)" }}>
          <Info size={13} className="mt-px shrink-0" />
          المركبات الكهربائية معفية. الدراجات النارية كتأدي حسب سعة المحرك.
          التعريفات إرشادية — تحقق من الموقع الرسمي للإدارة العامة للضرائب.
        </p>
      </section>
    </div>
  );
}
