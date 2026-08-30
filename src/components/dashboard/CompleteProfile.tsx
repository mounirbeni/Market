"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AccountBasicsForm } from "./AccountBasicsForm";
import { useDict, useHref } from "@/lib/i18n/client";
import { Info, ShieldCheck } from "@/components/icons";

export function CompleteProfile() {
  const t = useDict();
  const p = t.completeProfilePage;
  const router = useRouter();
  const href = useHref();
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
      <h1 className="mt-4 text-xl font-extrabold tracking-tight">{p.title}</h1>
      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {forSelling ? p.leadSelling : p.leadDefault}
      </p>
      <p
        className="mt-3 flex items-start gap-2 rounded-lg p-3 text-[11.5px] leading-relaxed"
        style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
      >
        <Info size={14} className="mt-px shrink-0" style={{ color: "var(--data)" }} />
        {p.note}
      </p>

      <div className="mt-5">
        <AccountBasicsForm
          ctaLabel={p.cta}
          onSaved={({ wantsDealer }) => router.push(
            wantsDealer ? href("/dashboard/dealer") : (next && next.startsWith("/") ? next : href("/dashboard")),
          )}
        />
      </div>
    </div>
  );
}
