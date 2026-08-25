"use client";

import { useState } from "react";
import { useApp } from "@/store/app";
import {
  BadgeCheck, Bell, IdCard, Info, Lock2, Message, Phone, ShieldCheck, Users,
} from "@/components/icons";

export function DashboardSettings() {
  const { user, signOut, unit, setUnit, theme, toggleTheme } = useApp();
  const [name, setName] = useState(user?.name ?? "");
  const [alerts, setAlerts] = useState({ priceDrops: true, messages: true, listings: true, newsletter: false });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold">
          <Users size={16} style={{ color: "var(--brand)" }} /> معلومات الحساب
        </h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="st-name"><Users size={13} /> الاسم</label>
            <input id="st-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="st-phone"><Phone size={13} /> الهاتف</label>
            <input id="st-phone" className="field num" dir="ltr" defaultValue={user?.phone ?? ""} readOnly />
          </div>
          <button className="btn btn-primary btn-sm">حفظ التغييرات</button>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold">
          <ShieldCheck size={16} style={{ color: "var(--brand)" }} /> التوثيق
        </h2>
        <ul className="mt-4 space-y-2.5">
          {[
            { Icon: Phone, label: "رقم الهاتف", done: true },
            { Icon: IdCard, label: "البطاقة الوطنية", done: true },
            { Icon: BadgeCheck, label: "السجل التجاري (للمحترفين)", done: false },
          ].map((v) => (
            <li
              key={v.label}
              className="flex items-center gap-2.5 rounded-lg p-3"
              style={{ background: "var(--surface-3)" }}
            >
              <v.Icon size={16} style={{ color: v.done ? "var(--good)" : "var(--text-dim)" }} />
              <span className="flex-1 text-[12.5px] font-semibold">{v.label}</span>
              {v.done ? (
                <span className="tag tag-good"><BadgeCheck size={11} /> موثّق</span>
              ) : (
                <button className="btn btn-solid btn-sm">وثّق</button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold">
          <Bell size={16} style={{ color: "var(--brand)" }} /> الإشعارات
        </h2>
        <div className="mt-4 space-y-2">
          {([
            ["priceDrops", "انخفاض ثمن مركبة محفوظة"],
            ["messages", "رسائل جديدة"],
            ["listings", "حالة إعلاناتي"],
            ["newsletter", "نصائح وعروض المنصة"],
          ] as const).map(([k, label]) => (
            <label
              key={k}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg p-3"
              style={{ background: "var(--surface-3)" }}
            >
              <input
                type="checkbox"
                checked={alerts[k]}
                onChange={(e) => setAlerts((a) => ({ ...a, [k]: e.target.checked }))}
              />
              <span className="text-[12.5px]">{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-bold">
          <Lock2 size={16} style={{ color: "var(--brand)" }} /> التفضيلات
        </h2>
        <div className="mt-4 space-y-3">
          <div>
            <span className="label">وحدة عرض الثمن</span>
            <div className="flex gap-1.5">
              {(["dh", "million"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  aria-pressed={unit === u}
                  className="chip transition"
                  style={{
                    borderColor: unit === u ? "var(--brand)" : "var(--line)",
                    background: unit === u ? "var(--brand-soft)" : "var(--surface-1)",
                    color: unit === u ? "var(--brand)" : "var(--text-muted)",
                  }}
                >
                  {u === "dh" ? "بالدرهم" : "بالمليون"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">مظهر الموقع</span>
            <button onClick={toggleTheme} className="btn btn-solid btn-sm">
              {theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
            </button>
          </div>
          <div className="border-t pt-3" style={{ borderColor: "var(--line-soft)" }}>
            <button onClick={signOut} className="btn btn-ghost btn-sm" style={{ color: "var(--bad)" }}>
              تسجيل الخروج
            </button>
          </div>
        </div>

        <p
          className="mt-5 flex gap-2 rounded-lg p-3 text-[10.5px] leading-relaxed"
          style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
        >
          <Info size={13} className="mt-px shrink-0" style={{ color: "var(--data)" }} />
          نسخة تجريبية: الإعدادات كتبقى فمتصفحك وماكتتصيفطش لأي خادم.
        </p>
      </section>
    </div>
  );
}
