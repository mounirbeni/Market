"use client";

import { useEffect, useState } from "react";
import { useDict } from "@/lib/i18n/client";
import { Diagnostic, FileText, Scale, Wallet } from "@/components/icons";

const GROUP_ICONS = [
  { Icon: Scale, color: "var(--brand)" },
  { Icon: Diagnostic, color: "var(--good)" },
  { Icon: FileText, color: "var(--data)" },
  { Icon: Wallet, color: "var(--warn)" },
] as const;

const KEY = "triq:checklist";

export function SafetyChecklist() {
  const t = useDict();
  const groups = t.safetyChecklist.groups.map((g, i) => ({ ...g, ...GROUP_ICONS[i] }));
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      /* تجاهل */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(done));
    } catch {
      /* تجاهل */
    }
  }, [done, ready]);

  const total = groups.reduce((s, g) => s + g.items.length, 0);
  const checked = Object.values(done).filter(Boolean).length;

  return (
    <div id="checklist">
      <div className="card mb-5 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold">{t.safetyChecklist.progress}</span>
          <span className="num font-bold" style={{ color: "var(--brand)" }}>
            {checked} / {total}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full" style={{ background: "var(--surface-3)" }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${(checked / total) * 100}%`, background: "var(--brand)" }}
          />
        </div>
        {checked > 0 && (
          <button
            onClick={() => setDone({})}
            className="mt-2 text-[11px] underline"
            style={{ color: "var(--text-dim)" }}
          >
            {t.safetyChecklist.reset}
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <div key={g.title} className="card p-5">
            <h3 className="mb-3 flex items-center gap-2.5 text-sm font-extrabold">
              <span
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{ background: `color-mix(in oklab, ${g.color} 13%, transparent)`, color: g.color }}
              >
                <g.Icon size={16} />
              </span>
              {g.title}
            </h3>
            <ul className="space-y-2">
              {g.items.map((it) => {
                const id = `${g.title}:${it}`;
                const on = Boolean(done[id]);
                return (
                  <li key={id}>
                    <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={(e) => setDone((p) => ({ ...p, [id]: e.target.checked }))}
                        className="mt-0.5 h-4 w-4 shrink-0 "
                      />
                      <span
                        style={{
                          color: on ? "var(--text-dim)" : "var(--text-muted)",
                          textDecoration: on ? "line-through" : undefined,
                        }}
                      >
                        {it}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
