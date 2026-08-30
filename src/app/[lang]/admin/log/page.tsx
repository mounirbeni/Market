import type { Metadata } from "next";
import { recentLog } from "@/lib/db/moderation";
import { dictionaryOf, getDictionary, getLocale } from "@/lib/i18n/server";
import { fmtTimeAgo } from "@/lib/i18n/labels";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = await dictionaryOf(locale);
  return { title: t.adminLog.metaTitle, robots: { index: false, follow: false } };
}

export const dynamic = "force-dynamic";

/** سجل كامل ديال إجراءات الإشراف — شكون دار شنو وفوقاش */
export default async function AdminLog() {
  const t = await getDictionary();
  const locale = await getLocale();
  const l = t.adminLog;
  const rows = await recentLog(200);

  return (
    <section className="card p-5">
      <h2 className="text-[13px] font-bold">{l.title}</h2>
      <p className="mt-1 text-[11.5px]" style={{ color: "var(--text-muted)" }}>
        {l.lead} <span className="num">200</span>.
      </p>
      {rows.length === 0 ? (
        <p className="mt-4 text-[12px]" style={{ color: "var(--text-dim)" }}>{l.empty}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-start text-[11.5px]">
            <thead>
              <tr style={{ color: "var(--text-dim)" }}>
                <th className="pb-2 font-bold">{l.colWhen}</th>
                <th className="pb-2 font-bold">{l.colWho}</th>
                <th className="pb-2 font-bold">{l.colAction}</th>
                <th className="pb-2 font-bold">{l.colTarget}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t" style={{ borderColor: "var(--line-soft)" }}>
                  <td className="num py-1.5 whitespace-nowrap">{fmtTimeAgo(r.created_at, locale)}</td>
                  <td className="py-1.5"><bdi dir="ltr">{r.email}</bdi></td>
                  <td className="py-1.5 font-bold">{r.action}</td>
                  <td className="py-1.5"><bdi dir="ltr" className="opacity-70">{r.target ?? "—"}</bdi></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
