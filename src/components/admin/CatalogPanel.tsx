"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminAction } from "./actions";
import { Toolbar } from "./Toolbar";
import { Car, Moto, Plus, Trash } from "@/components/icons";

interface Row {
  kind: string; make: string; model: string; body: string | null; listings: string;
}

/* ============================================================
   الكتالوج

   الماركات والموديلات اللي كتبان فقوائم البيع والبحث. زيد
   موديل جديد ملي يدخل السوق بلا ما تعاود تنشر الموقع.

   الموديل اللي عندو إعلانات ماكيتمسحش من الواجهة — الإعلانات
   كيبقاو خدّامين ولكن الموديل كيختفي من القوائم، وهادشي كيخلّط.
   ============================================================ */
export function CatalogPanel({ rows, total }: { rows: Row[]; total: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ kind: "car", make: "", model: "" });

  async function act(key: string, payload: Record<string, string>) {
    setBusy(key);
    setError(null);
    const err = await adminAction(payload);
    if (err) setError(err);
    else router.refresh();
    setBusy(null);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const make = form.make.trim();
    if (!make || !form.model.trim()) return;

    setBusy("add");
    setError(null);
    const err = await adminAction({ action: "catalog:add", ...form, make });
    setBusy(null);
    if (err) {
      setError(err);
      return;
    }
    /* اللائحة محدودة ب200 ومرتّبة بالماركة — الموديل الجديد
       يقدر ماينوضش فيها. كنفلترو على الماركة باش يبان دغيا. */
    setForm((f) => ({ ...f, model: "" }));
    router.push(`?q=${encodeURIComponent(make)}`);
    router.refresh();
  }

  return (
    <div>
      <header className="mb-5">
        <h2 className="text-[17px] font-extrabold">الكتالوج</h2>
        <p className="mt-1 text-[12.5px]" style={{ color: "var(--text-muted)" }}>
          <span className="num">{total}</span> موديل. هادو اللي كيبانو فقوائم البيع
          والتقييم والاقتراحات.
        </p>
      </header>

      <form onSubmit={add} className="card mb-4 flex flex-wrap items-end gap-2 p-4">
        <div className="min-w-[110px]">
          <label className="label" htmlFor="c-kind">النوع</label>
          <select id="c-kind" className="field" value={form.kind}
            onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}>
            <option value="car">سيارة</option>
            <option value="moto">دراجة</option>
          </select>
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="label" htmlFor="c-make">الماركة</label>
          <input id="c-make" className="field" dir="ltr" value={form.make}
            onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))} placeholder="BYD" />
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="label" htmlFor="c-model">الموديل</label>
          <input id="c-model" className="field" dir="ltr" value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} placeholder="Seal" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy !== null}>
          <Plus size={15} /> زيد
        </button>
      </form>

      <Toolbar tabs={[]} placeholder="ماركة ولا موديل…" />

      {error && <p className="mb-3 text-[12px] font-bold" style={{ color: "var(--bad)" }}>{error}</p>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-right text-[12px]">
          <thead>
            <tr style={{ color: "var(--text-dim)" }}>
              <th className="p-3 font-bold">النوع</th>
              <th className="p-3 font-bold">الماركة</th>
              <th className="p-3 font-bold">الموديل</th>
              <th className="p-3 font-bold">إعلانات</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const used = Number(r.listings) > 0;
              const key = `${r.kind}|${r.make}|${r.model}`;
              return (
                <tr key={key} className="border-t" style={{ borderColor: "var(--line-soft)" }}>
                  <td className="p-3">
                    {r.kind === "moto" ? <Moto size={14} /> : <Car size={14} />}
                  </td>
                  <td className="p-3"><bdi dir="ltr" className="font-bold">{r.make}</bdi></td>
                  <td className="p-3"><bdi dir="ltr">{r.model}</bdi></td>
                  <td className="num p-3">{used ? r.listings : "—"}</td>
                  <td className="p-3 text-left">
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={busy !== null || used}
                      title={used ? "عندو إعلانات — ماكيتمسحش" : "امسح من الكتالوج"}
                      onClick={() =>
                        act(key, { action: "catalog:remove", kind: r.kind, make: r.make, model: r.model })
                      }
                    >
                      <Trash size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
