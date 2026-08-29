"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "@/components/icons";

/** بحث + فلاتر — كيكتبو فالرابط باش الصفحة تبقى قابلة للمشاركة */
export function Toolbar({
  tabs,
  tabKey = "status",
  placeholder = "بحث…",
}: {
  tabs: { key: string; label: string; count?: number }[];
  tabKey?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const active = params.get(tabKey) ?? tabs[0]?.key;

  const go = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`?${next.toString()}`);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <form
        onSubmit={(e) => { e.preventDefault(); go({ q }); }}
        className="relative min-w-[200px] flex-1"
      >
        <Search
          size={15}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-dim)" }}
        />
        <input
          className="field pe-9"
          placeholder={placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => go({ [tabKey]: t.key })}
            className="chip transition"
            style={{
              borderColor: active === t.key ? "var(--brand)" : "var(--line)",
              background: active === t.key ? "var(--brand-soft)" : "var(--surface-1)",
              color: active === t.key ? "var(--brand)" : "var(--text-muted)",
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 ? <span className="num"> {t.count}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
