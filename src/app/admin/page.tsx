import Link from "next/link";
import { overview, recentLog } from "@/lib/db/moderation";
import { timeAgo, formatNumber } from "@/lib/format";
import {
  AlertTriangle, BadgeCheck, Calendar, Car, IdCard, Message, ShieldAlert, Sliders, Star, Users,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [s, log] = await Promise.all([overview(), recentLog(8)]);

  const cards = [
    { l: "حسابات", v: s.users, sub: s.usersToday ? `+${s.usersToday} اليوم` : null, Icon: Users, href: "/admin/users" as const },
    { l: "إعلانات نشيطة", v: s.active, sub: s.listingsToday ? `+${s.listingsToday} اليوم` : null, Icon: Car, href: "/admin/listings" as const },
    { l: "تبليغات مفتوحة", v: s.reportsOpen, sub: null, Icon: ShieldAlert, href: "/admin/reports" as const, warn: s.reportsOpen > 0 },
    { l: "ترويج فانتظار الأداء", v: s.promosPending, sub: s.promosActive ? `${s.promosActive} شغّال` : null, Icon: Star, href: "/admin/promos" as const, warn: s.promosPending > 0 },
    { l: "توثيق فانتظار", v: s.verifsPending, sub: null, Icon: IdCard, href: "/admin/verifications" as const, warn: s.verifsPending > 0 },
    { l: "معارض", v: s.dealers, sub: s.dealersUnverified ? `${s.dealersUnverified} ماشي موثّق` : null, Icon: BadgeCheck, href: "/admin/dealers" as const },
    { l: "إعلانات محيّدة", v: s.hidden, sub: null, Icon: AlertTriangle, href: "/admin/listings" as const },
    { l: "حسابات محضورة", v: s.banned, sub: null, Icon: AlertTriangle, href: "/admin/users" as const },
    { l: "رسائل (7 أيام)", v: s.messages7d, sub: null, Icon: Message, href: "/admin/users" as const },
    { l: "مواعيد مطلوبة", v: s.appointments, sub: null, Icon: Calendar, href: "/admin/listings" as const },
    { l: "موديلات فالكتالوج", v: s.models, sub: `${s.pros} بائع محترف`, Icon: Sliders, href: "/admin/catalog" as const },
  ];

  return (
    <div className="space-y-7">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ l, v, sub, Icon, href, warn }) => (
          <Link key={l} href={href} className="card card-hover flex items-center gap-3 p-4">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
              style={{
                background: warn ? "var(--bad)" : "var(--brand-soft)",
                color: warn ? "#fff" : "var(--brand)",
              }}
            >
              <Icon size={19} />
            </span>
            <span className="min-w-0">
              <span className="num block text-[22px] font-extrabold leading-none">
                {formatNumber(v)}
              </span>
              <span className="block text-[12px]" style={{ color: "var(--text-muted)" }}>{l}</span>
              {sub && (
                <span className="block text-[10.5px]" style={{ color: "var(--good)" }}>{sub}</span>
              )}
            </span>
          </Link>
        ))}
      </div>

      <section className="card p-5">
        <h2 className="text-[13px] font-bold">آخر الإجراءات</h2>
        {log.length === 0 ? (
          <p className="mt-3 text-[12px]" style={{ color: "var(--text-dim)" }}>
            ماكاين حتى إجراء بعد.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {log.map((r, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 text-[11.5px]">
                <span className="num" style={{ color: "var(--text-dim)" }}>{timeAgo(r.created_at)}</span>
                <span className="font-bold">{r.action}</span>
                {r.target && <bdi dir="ltr" className="num opacity-70">{r.target}</bdi>}
                {r.detail && <span className="opacity-70">{r.detail}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
