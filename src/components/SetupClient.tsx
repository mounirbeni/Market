"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, AlertTriangle, Check, Reset } from "@/components/icons";

interface Status {
  connected: boolean;
  tablesExist: boolean;
  listings: number;
  migrations: { name: string; applied: boolean }[];
  pending: string[];
  counts: Record<string, number> | null;
}

interface RunResult {
  migrated: string[];
  seeded: boolean;
  done: boolean;
  next: number | null;
  reason?: string;
  progress?: { at: number; total: number };
  counts: Record<string, number> | null;
}

/** المفتاح كيجي من الرابط (?key=...) ملي يكون SETUP_KEY مضبوط */
function keyParam() {
  if (typeof window === "undefined") return "";
  const k = new URLSearchParams(window.location.search).get("key");
  return k ? `?key=${encodeURIComponent(k)}` : "";
}

export function SetupClient() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ at: number; total: number } | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const r = await fetch(`/api/admin/setup${keyParam()}`, { cache: "no-store" });
      const j = await r.json();
      if (!j?.ok) {
        setError(j?.error ?? "ماقدرناش نقراو الحالة.");
        return;
      }
      setStatus(j.data as Status);
    } catch {
      setError("الشبكة قاطعة.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * التعمير كيمشي على دفعات — الخادم كيرجع `next` وكنعاودو حتى نساليو.
   * هكا حتى إلا كانت القاعدة بعيدة، حتى دفعة ماكتقربش لحد المدة.
   */
  async function run() {
    setRunning(true);
    setError("");
    setProgress(null);
    setResult(null);

    let from: number | null = 0;
    const migrated: string[] = [];

    try {
      while (from !== null) {
        const sep = keyParam() ? "&" : "?";
        const r = await fetch(`/api/admin/setup${keyParam()}${sep}from=${from}`, {
          method: "POST",
        });
        const j = await r.json();
        if (!j?.ok) {
          setError(j?.error ?? "فشل الإعداد.");
          return;
        }
        const data = j.data as RunResult;
        migrated.push(...(data.migrated ?? []));
        if (data.progress) setProgress(data.progress);
        if (data.done) {
          setResult({ ...data, migrated });
          break;
        }
        from = data.next;
      }
      await load();
    } catch {
      setError("الشبكة قاطعة. عاود الضغط — التعمير كيكمّل من فين وقف.");
    } finally {
      setRunning(false);
    }
  }

  const ready = status?.tablesExist && status.listings > 0;

  return (
    <div className="mt-7 space-y-5">
      {error && (
        <div
          className="flex items-start gap-2.5 rounded-xl p-3.5 text-[13px] leading-relaxed"
          style={{ background: "var(--bad-soft)", color: "var(--bad)" }}
        >
          <AlertTriangle size={16} className="mt-px shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {status && (
        <section className="card p-5">
          <h2 className="text-[14px] font-bold">الحالة</h2>
          <dl className="mt-3 space-y-2 text-[13px]">
            <Row label="الاتصال بقاعدة البيانات" good={status.connected} />
            <Row label="الجداول" good={status.tablesExist} />
            <Row
              label="الإعلانات"
              good={status.listings > 0}
              value={<span className="num">{status.listings}</span>}
            />
            <Row
              label="الهجرات"
              good={status.pending.length === 0}
              value={
                <span className="num">
                  {status.migrations.filter((m) => m.applied).length}/{status.migrations.length}
                </span>
              }
            />
          </dl>

          {status.counts && (
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]" style={{ color: "var(--text-muted)" }}>
              {Object.entries(status.counts).map(([t, c]) => (
                <li key={t} className="flex justify-between gap-2">
                  <span>{t}</span>
                  <span className="num font-bold">{c}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {running && progress && (
        <section className="card p-5">
          <div className="flex items-center justify-between text-[13px] font-bold">
            <span>كنعمّرو الإعلانات…</span>
            <span className="num">
              {progress.at}/{progress.total}
            </span>
          </div>
          <div
            className="mt-2.5 h-2 overflow-hidden rounded-full"
            style={{ background: "var(--surface-3)" }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${Math.round((progress.at / progress.total) * 100)}%`,
                background: "var(--brand)",
              }}
            />
          </div>
        </section>
      )}

      {result && (
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-bold">
            <BadgeCheck size={16} style={{ color: "var(--good)" }} /> تسالى
          </h2>
          <ul className="mt-3 space-y-1.5 text-[13px]" style={{ color: "var(--text-muted)" }}>
            <li>
              الهجرات المطبّقة:{" "}
              {result.migrated.length ? (
                <span className="num font-bold">{result.migrated.length}</span>
              ) : (
                "ماكاين حتى وحدة جديدة"
              )}
            </li>
            <li>{result.seeded ? "تعمّرات البيانات التجريبية." : result.reason}</li>
          </ul>
        </section>
      )}

      {ready ? (
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">شوف الموقع</Link>
          <button onClick={load} className="btn btn-ghost">
            <Reset size={14} /> عاود الفحص
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button onClick={run} disabled={running || !status} className="btn btn-primary">
            <Check size={15} /> {running ? "كنصاوبو… (ممكن ياخد دقيقة)" : "صاوب القاعدة دابا"}
          </button>
          <button onClick={load} className="btn btn-ghost">
            <Reset size={14} /> عاود الفحص
          </button>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  good,
  value,
}: {
  label: string;
  good: boolean;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt style={{ color: "var(--text-muted)" }}>{label}</dt>
      <dd className="flex items-center gap-2 font-bold">
        {value}
        <span
          className="grid h-5 w-5 place-items-center rounded-full text-[11px]"
          style={{
            background: good ? "var(--good-soft)" : "var(--surface-3)",
            color: good ? "var(--good)" : "var(--text-dim)",
          }}
        >
          {good ? "✓" : "—"}
        </span>
      </dd>
    </div>
  );
}
