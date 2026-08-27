import { recentLog } from "@/lib/db/moderation";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

/** سجل كامل ديال إجراءات الإشراف — شكون دار شنو وفوقاش */
export default async function AdminLog() {
  const rows = await recentLog(200);

  return (
    <section className="card p-5">
      <h2 className="text-[13px] font-bold">سجل الإجراءات</h2>
      <p className="mt-1 text-[11.5px]" style={{ color: "var(--text-muted)" }}>
        كل إجراء إشراف كيتسجّل هنا. آخر <span className="num">200</span>.
      </p>
      {rows.length === 0 ? (
        <p className="mt-4 text-[12px]" style={{ color: "var(--text-dim)" }}>ماكاين والو.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-right text-[11.5px]">
            <thead>
              <tr style={{ color: "var(--text-dim)" }}>
                <th className="pb-2 font-bold">فوقاش</th>
                <th className="pb-2 font-bold">شكون</th>
                <th className="pb-2 font-bold">الإجراء</th>
                <th className="pb-2 font-bold">على شنو</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t" style={{ borderColor: "var(--line-soft)" }}>
                  <td className="num py-1.5 whitespace-nowrap">{timeAgo(r.created_at)}</td>
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
