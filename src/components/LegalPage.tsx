import Link from "next/link";
import { ChevronLeft, FileText } from "./icons";

export interface LegalSection {
  id?: string;
  heading: string;
  body?: string[];
  list?: string[];
}

export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-10">
      <nav className="mb-6 flex items-center gap-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
        <Link href="/" className="transition hover:text-[var(--brand)]">الرئيسية</Link>
        <ChevronLeft size={12} className="dir-flip" />
        <span style={{ color: "var(--text-muted)" }}>{title}</span>
      </nav>

      <header className="mb-9">
        <span className="eyebrow"><FileText size={13} /> وثيقة قانونية</span>
        <h1 className="h-page mt-3">{title}</h1>
        <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{intro}</p>
        <p className="mt-3 text-[11.5px]" style={{ color: "var(--text-dim)" }}>آخر تحديث: {updated}</p>
      </header>

      <div className="space-y-6">
        {sections.map((s, i) => (
          <section key={i} id={s.id} className="card p-6 scroll-mt-24">
            <h2 className="text-[16px] font-bold">{s.heading}</h2>
            {s.body?.map((p, j) => (
              <p key={j} className="mt-3 text-[13px] leading-loose" style={{ color: "var(--text-muted)" }}>{p}</p>
            ))}
            {s.list && (
              <ul className="mt-3 space-y-2">
                {s.list.map((item, j) => (
                  <li key={j} className="flex gap-2.5 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--brand)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
