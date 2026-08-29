import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SellWizard } from "@/components/SellWizard";
import { Coins } from "@/components/icons";

export const metadata: Metadata = {
  title: "بيع سيارتك أو دراجتك في المغرب",
  description:
    "انشر إعلانك مجاناً وشوف مؤشر الثقة ديالك كيتبنى مباشرة أمام عينيك، مع ثمن مقترح مبني على السوق المغربي.",
};

export default async function SellPage() {
  /* الزائر الغير مسجّل يقدر يعمّر الفورمير ويشوف الثمن المقترح —
     التسجيل مطلوب غير فآخر خطوة (publish). ولكن المسجّل بملف
     ناقص خاصو يكمّل قبل، حيت الإعلان بلا رقم ولا مدينة حقيقية
     ماكيخدمش لا للبائع لا للمشتري. */
  const user = await getCurrentUser();
  if (user && !user.onboarded) redirect("/dashboard/complete-profile?next=/sell");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 max-w-2xl">
        <span className="eyebrow"><Coins size={13} /> النشر مجاني · بدون عمولة</span>
        <h1 className="h-page mt-4">بيع بثقة، وبثمن معقول</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          فباقي المواقع كتعمّر فورمير وكتسنّى. هنا كتشوف مباشرة نقطة الثقة ديال إعلانك
          كتزيد مع كل معلومة كتزيدها — والثمن المقترح مبني على إعلانات حقيقية.
        </p>
      </header>
      <SellWizard />
    </div>
  );
}
