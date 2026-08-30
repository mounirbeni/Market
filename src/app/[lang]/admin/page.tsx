import { Link } from "@/components/Link";
import { overview, recentLog } from "@/lib/db/moderation";
import { formatNumber } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { fmtTimeAgo } from "@/lib/i18n/labels";
import {
  AlertTriangle, BadgeCheck, Calendar, Car, IdCard, Message, ShieldAlert, Sliders, Star, Users,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const t = await getDictionary();
  const locale = await getLocale();
  const h = t.adminHome;
  const [s, log] = await Promise.all([overview(), recentLog(8)]);

  const cards = [
    { l: h.cards.users, v: s.users, sub: s.usersToday ? `+${s.usersToday} ${h.today}` : null, Icon: Users, href: "/admin/users" as const },
    { l: h.cards.listingsActive, v: s.active, sub: s.listingsToday ? `+${s.listingsToday} ${h.today}` : null, Icon: Car, href: "/admin/listings" as const },
    { l: h.cards.reportsOpen, v: s.reportsOpen, sub: null, Icon: ShieldAlert, href: "/admin/reports" as const, warn: s.reportsOpen > 0 },
    { l: h.cards.promosPending, v: s.promosPending, sub: s.promosActive ? `${s.promosActive} ${h.active}` : null, Icon: Star, href: "/admin/promos" as const, warn: s.promosPending > 0 },
    { l: h.cards.verifsPending, v: s.verifsPending, sub: null, Icon: IdCard, href: "/admin/verifications" as const, warn: s.verifsPending > 0 },
    { l: h.cards.dealers, v: s.dealers, sub: s.dealersUnverified ? `${s.dealersUnverified} ${h.notVerified}` : null, Icon: BadgeCheck, href: "/admin/dealers" as const },
    { l: h.cards.listingsHidden, v: s.hidden, sub: null, Icon: AlertTriangle, href: "/admin/listings" as const },
    { l: h.cards.usersBanned, v: s.banned, sub: null, Icon: AlertTriangle, href: "/admin/users" as const },
    { l: h.cards.messages7d, v: s.messages7d, sub: null, Icon: Message, href: "/admin/users" as const },
    { l: h.cards.appointments, v: s.appointments, sub: null, Icon: Calendar, href: "/admin/listings" as const },
    { l: h.cards.models, v: s.models, sub: `${s.pros} ${h.proSellers}`, Icon: Sliders, href: "/admin/catalog" as const },
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
        <h2 className="text-[13px] font-bold">{h.recentActionsTitle}</h2>
        {log.length === 0 ? (
          <p className="mt-3 text-[12px]" style={{ color: "var(--text-dim)" }}>
            {h.noActionsYet}
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {log.map((r, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 text-[11.5px]">
                <span className="num" style={{ color: "var(--text-dim)" }}>{fmtTimeAgo(r.created_at, locale)}</span>
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
