"use client";

import { useEffect, useState } from "react";

const GROUPS = [
  {
    title: "قبل ما تمشي",
    items: [
      "قارن الثمن مع الثمن المرجعي ديال طريق",
      "شوف مؤشر الثقة وقرا التنبيهات كاملة",
      "سول البائع على رقم الهيكل (VIN) وتحقق منه",
      "اطلب صور إضافية للمحرك وأرضية الصندوق",
      "تأكد من صلاحية الفحص التقني والتأمين",
    ],
  },
  {
    title: "فوقت المعاينة",
    items: [
      "تلاقاو نهاراً وفبلاصة عامة ومعروفة",
      "جيب معاك شي حد كيفهم فالميكانيك",
      "شوف المحرك بارد — ماشي مسخّن من قبل",
      "قارن رقم الهيكل على المركبة مع البطاقة الرمادية",
      "شوف سماكة الصباغة وفراغات القطع",
      "جرّب المركبة على الأقل 15 دقيقة، فالمدينة وفالطريق السيار",
      "اختبر الفرامل، التوجيه، المكيف وكل الأضواء",
      "قرا أخطاء الحاسوب (OBD) إذا أمكن",
    ],
  },
  {
    title: "الوثائق",
    items: [
      "البطاقة الرمادية أصلية وفسمية البائع",
      "البطاقة الوطنية للبائع مطابقة للاسم",
      "شهادة عدم الرهن / عدم الحجز",
      "الفحص التقني ساري المفعول",
      "الوصولات ديال الفينيات مدفوعة",
      "دفتر الصيانة والفواتير",
    ],
  },
  {
    title: "الأداء والتحويل",
    items: [
      "ماتدفعش عربوناً قبل ما تشوف المركبة والوثائق",
      "الأداء يكون بحضور شهود أو عبر تحويل بنكي موثّق",
      "حرّر عقد بيع مكتوب بنسختين مع نسخ البطائق",
      "دير التحويل (المطالبة بتغيير الملكية) داخل 30 يوماً",
      "احتفظ بنسخة من كل شي حتى تخرج البطاقة الجديدة بسميتك",
    ],
  },
];

const KEY = "triq:checklist";

export function SafetyChecklist() {
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

  const total = GROUPS.reduce((s, g) => s + g.items.length, 0);
  const checked = Object.values(done).filter(Boolean).length;

  return (
    <div id="checklist">
      <div className="card mb-5 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold">تقدّمك في اللائحة</span>
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
            إعادة الضبط
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.title} className="card p-5">
            <h3 className="mb-3 text-sm font-extrabold">{g.title}</h3>
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
