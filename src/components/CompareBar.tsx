"use client";

import Link from "next/link";
import { useApp } from "@/store/app";
import { vehicleById } from "@/lib/data/vehicles";
import { VehicleArt } from "./VehicleArt";
import { artShape } from "@/lib/artshape";

export function CompareBar() {
  const { compare, toggleCompare, clearCompare, ready } = useApp();
  if (!ready || compare.length === 0) return null;

  const items = compare.map((id) => vehicleById(id)).filter(Boolean);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 animate-rise">
      <div
        className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border p-2.5 shadow-2xl"
        style={{
          background: "color-mix(in oklab, var(--bg-card) 92%, transparent)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--color-majorelle-400)",
        }}
      >
        <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          {items.map((v) => (
            <div key={v!.id} className="relative shrink-0">
              <div className="h-11 w-16 overflow-hidden rounded-lg">
                <VehicleArt id={v!.id} kind={v!.kind} body={artShape(v!)} className="h-full w-full" />
              </div>
              <button
                onClick={() => toggleCompare(v!.id)}
                aria-label={`إزالة ${v!.make} من المقارنة`}
                className="absolute -top-1.5 -left-1.5 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold"
                style={{ background: "var(--color-clay-500)", color: "#fff" }}
              >
                ×
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
            <div
              key={i}
              className="grid h-11 w-16 shrink-0 place-items-center rounded-lg border border-dashed text-[10px]"
              style={{ borderColor: "var(--line)", color: "var(--text-dim)" }}
            >
              أضف
            </div>
          ))}
        </div>
        <button onClick={clearCompare} className="btn btn-ghost btn-sm">
          مسح
        </button>
        <Link
          href="/compare"
          className="btn btn-sm"
          style={{ background: "var(--color-majorelle-500)", color: "#fff" }}
        >
          قارن (<span className="num">{items.length}</span>)
        </Link>
      </div>
    </div>
  );
}
