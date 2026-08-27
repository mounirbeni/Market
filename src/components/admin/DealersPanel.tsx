"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminAction } from "./actions";
import { timeAgo } from "@/lib/format";
import { cityName } from "@/lib/cities";
import { BadgeCheck, Car } from "@/components/icons";

interface Row {
  slug: string; name: string; city: string; verified: boolean; created_at: string;
  owner_id: string; owner_name: string; owner_email: string | null; listings: string;
}

export function DealersPanel({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(slug: string, verify: boolean) {
    setBusy(slug);
    setError(null);
    const err = await adminAction({
      action: verify ? "dealer:verify" : "dealer:unverify",
      slug,
    });
    if (err) setError(err);
    else router.refresh();
    setBusy(null);
  }

  return (
    <div>
      <header className="mb-5">
        <h2 className="text-[17px] font-extrabold">المعارض</h2>
        <p className="mt-1 text-[12.5px]" style={{ color: "var(--text-muted)" }}>
          شارة «موثّق» كتتحط غير من هنا، بعد ما تشوف السجل التجاري. اللي ماشي
          موثّق كيبان أولاً.
        </p>
      </header>

      {error && <p className="mb-3 text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          باقي ماتسجّل حتى معرض.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((d) => (
            <li key={d.slug} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/dealer/${d.slug}`} className="text-[14px] font-bold">
                      {d.name}
                    </Link>
                    {d.verified ? (
                      <span className="tag" style={{ background: "var(--good)", color: "#fff" }}>
                        <BadgeCheck size={10} /> موثّق
                      </span>
                    ) : (
                      <span className="tag" style={{ background: "var(--warn)", color: "#000" }}>
                        فانتظار التوثيق
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 flex flex-wrap gap-x-2.5 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                    <span>{cityName(d.city)}</span>
                    <span><Car size={11} /> <span className="num">{d.listings}</span></span>
                    <span>{d.owner_name}</span>
                    {d.owner_email && <bdi dir="ltr" className="num">{d.owner_email}</bdi>}
                    <span>{timeAgo(d.created_at)}</span>
                  </p>
                </div>
                <button
                  className="btn btn-sm shrink-0"
                  style={{
                    background: d.verified ? "var(--surface-3)" : "var(--good)",
                    color: d.verified ? "var(--text)" : "#fff",
                  }}
                  disabled={busy !== null}
                  onClick={() => act(d.slug, !d.verified)}
                >
                  {d.verified ? "حيّد التوثيق" : "وثّق المعرض"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
