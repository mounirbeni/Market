"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AccountBasicsForm } from "./AccountBasicsForm";
import { Info, ShieldCheck } from "@/components/icons";

export function CompleteProfile() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");
  const forSelling = next === "/sell" || Boolean(next?.startsWith("/sell"));

  return (
    <div className="card p-6">
      <span
        className="grid h-12 w-12 place-items-center rounded-2xl"
        style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
      >
        <ShieldCheck size={22} />
      </span>
      <h1 className="mt-4 text-xl font-extrabold tracking-tight">أكمل معلومات حسابك</h1>
      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {forSelling
          ? "أكمل معلومات حسابك أولًا للتمكن من نشر إعلانك والاستفادة من جميع خدمات المنصة."
          : "خطوة وحدة باقية باش تستافد بكل خدمات طريق: الاسم، الهاتف، المدينة، ونوع الحساب."}
      </p>
      <p
        className="mt-3 flex items-start gap-2 rounded-lg p-3 text-[11.5px] leading-relaxed"
        style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
      >
        <Info size={14} className="mt-px shrink-0" style={{ color: "var(--data)" }} />
        هاد المعلومات إلزامية باش نضمنو تواصل حقيقي بين البائعين والمشترين — توثيق
        الهوية يبقى اختياري تماماً.
      </p>

      <div className="mt-5">
        <AccountBasicsForm
          ctaLabel="كمّل وتابع"
          onSaved={({ wantsDealer }) => router.push(
            wantsDealer ? "/dashboard/dealer" : (next && next.startsWith("/") ? next : "/dashboard"),
          )}
        />
      </div>
    </div>
  );
}
