"use client";

import { Link } from "@/components/Link";
import { useApp } from "@/store/app";
import { useVehiclesByIds } from "@/lib/useVehicles";
import { useDict } from "@/lib/i18n/client";
import { VehicleArt } from "./VehicleArt";
import { Close, Scale, Trash } from "./icons";
import { artShape } from "@/lib/artshape";

export function CompareBar() {
  const t = useDict();
  const c = t.compareBar;
  const { compare, toggleCompare, clearCompare, ready } = useApp();
  const { items } = useVehiclesByIds(compare);
  if (!ready || compare.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-40 px-3 pb-3 animate-rise sm:bottom-0"
    >
      <div
        className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border p-2.5 shadow-2xl"
        style={{
          background: "color-mix(in oklab, var(--surface-1) 94%, transparent)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--data)",
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          {items.map((v) => (
            <div key={v!.id} className="relative shrink-0">
              <div className="h-11 w-16 overflow-hidden rounded-lg">
                <VehicleArt id={v!.id} kind={v!.kind} body={artShape(v!)} color={v!.color} className="h-full w-full" />
              </div>
              <button
                onClick={() => toggleCompare(v!.id)}
                aria-label={`${c.removeAria} ${v!.make} ${c.fromCompare}`}
                className="absolute -top-1.5 -end-1.5 grid h-4 w-4 place-items-center rounded-full"
                style={{ background: "var(--bad)", color: "#fff" }}
              >
                <Close size={10} />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
            <div
              key={i}
              className="grid h-11 w-16 shrink-0 place-items-center rounded-lg border border-dashed text-[10px]"
              style={{ borderColor: "var(--line)", color: "var(--text-dim)" }}
            >
              {c.add}
            </div>
          ))}
        </div>
        <button onClick={clearCompare} className="btn btn-ghost btn-sm">
          <Trash size={13} /> {c.clear}
        </button>
        <Link
          href="/compare"
          className="btn btn-sm"
          style={{ background: "var(--data)", color: "#fff" }}
        >
          <Scale size={14} /> {c.compare} <span className="num">({items.length})</span>
        </Link>
      </div>
    </div>
  );
}
