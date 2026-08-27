"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminAction } from "./actions";
import { Toolbar } from "./Toolbar";
import { timeAgo } from "@/lib/format";
import { cityName } from "@/lib/cities";
import { BadgeCheck, Car, Users } from "@/components/icons";

interface Row {
  id: string; name: string; email: string | null; phone: string | null;
  type: string; city: string | null; id_verified: boolean;
  banned_at: string | null; created_at: string; listings: string;
}

export function UsersPanel({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(key: string, payload: Record<string, string>) {
    setBusy(key);
    setError(null);
    const err = await adminAction(payload);
    if (err) setError(err);
    else router.refresh();
    setBusy(null);
  }

  return (
    <div>
      <header className="mb-5">
        <h2 className="text-[17px] font-extrabold">الحسابات</h2>
        <p className="mt-1 text-[12.5px]" style={{ color: "var(--text-muted)" }}>
          الحضر كيقطع الجلسة دغيا وكيحيّد كل الإعلانات النشيطة ديال الحساب.
        </p>
      </header>

      <Toolbar
        tabKey="filter"
        placeholder="إيميل، اسم، ولا هاتف…"
        tabs={[
          { key: "all", label: "كلشي" },
          { key: "pro", label: "محترفون" },
          { key: "verified", label: "موثّقون" },
          { key: "banned", label: "محضورون" },
        ]}
      />

      {error && <p className="mb-3 text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          ماكاين حتى حساب.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((u) => {
            const banned = Boolean(u.banned_at);
            return (
              <li key={u.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-bold">{u.name}</span>
                      {u.type === "professionnel" && (
                        <span className="tag" style={{ background: "var(--brand)", color: "#fff" }}>
                          <Users size={10} /> محترف
                        </span>
                      )}
                      {u.id_verified && (
                        <span className="tag" style={{ background: "var(--good)", color: "#fff" }}>
                          <BadgeCheck size={10} /> موثّق
                        </span>
                      )}
                      {banned && (
                        <span className="tag" style={{ background: "var(--bad)", color: "#fff" }}>
                          محضور
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 flex flex-wrap gap-x-2.5 text-[11.5px]" style={{ color: "var(--text-dim)" }}>
                      {u.email && <bdi dir="ltr" className="num">{u.email}</bdi>}
                      {u.phone && <bdi dir="ltr" className="num">{u.phone}</bdi>}
                      {u.city && <span>{cityName(u.city)}</span>}
                      <span><Car size={11} /> <span className="num">{u.listings}</span></span>
                      <span>{timeAgo(u.created_at)}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <button className="btn btn-solid btn-sm" disabled={busy !== null}
                      onClick={() => act(u.id + "v", {
                        action: u.id_verified ? "user:unverify" : "user:verify", userId: u.id,
                      })}>
                      {u.id_verified ? "حيّد التوثيق" : "وثّق"}
                    </button>
                    <button className="btn btn-solid btn-sm" disabled={busy !== null}
                      onClick={() => act(u.id + "t", {
                        action: u.type === "professionnel" ? "user:private" : "user:pro", userId: u.id,
                      })}>
                      {u.type === "professionnel" ? "خلّيه فردي" : "خلّيه محترف"}
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{
                        background: banned ? "var(--surface-3)" : "var(--bad)",
                        color: banned ? "var(--text)" : "#fff",
                      }}
                      disabled={busy !== null}
                      onClick={() => act(u.id + "b", {
                        action: banned ? "user:unban" : "user:ban", userId: u.id,
                      })}
                    >
                      {banned ? "رفع الحضر" : "حضر"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
