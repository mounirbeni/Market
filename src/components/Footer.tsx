"use client";

import { Link } from "./Link";
import { TOP_CITIES } from "@/lib/cities";
import { brandsOf } from "@/lib/slug";
import { Logo } from "./Logo";
import { useDict } from "@/lib/i18n/client";
import {
  Coins, Message, Navigation, ShieldCheck,
} from "./icons";

type Dict = ReturnType<typeof useDict>;

const columns = (t: Dict["footer"]) => [
  {
    title: t.col.vehicles,
    links: [
      { href: "/cars", label: t.link.cars },
      { href: "/motorcycles", label: t.link.motorcycles },
      { href: "/cars?deals=1", label: t.link.bestDeals },
      { href: "/cars?inspected=1", label: t.link.inspected },
      { href: "/cars?fuel=electrique", label: t.link.electric },
      { href: "/cars?priceMin=250000", label: t.link.premium },
    ],
  },
  {
    title: t.col.buyers,
    links: [
      { href: "/search", label: t.link.advancedSearch },
      { href: "/assistant", label: t.link.assistant },
      { href: "/compare", label: t.link.compare },
      { href: "/favorites", label: t.link.favorites },
      { href: "/cost", label: t.link.costCalculator },
      { href: "/guides/chira-tomobil-mostaamla", label: t.link.buyingGuide },
    ],
  },
  {
    title: t.col.sellers,
    links: [
      { href: "/sell", label: t.link.sell },
      { href: "/promote", label: t.link.promote },
      { href: "/valuation", label: t.link.valuation },
      { href: "/dealers", label: t.link.dealers },
      { href: "/dashboard", label: t.link.dashboard },
      { href: "/inspection", label: t.link.inspection },
      { href: "/register", label: t.link.register },
    ],
  },
  {
    title: t.col.platform,
    links: [
      { href: "/about", label: t.link.about },
      { href: "/contact", label: t.link.contact },
      { href: "/guides", label: t.link.guides },
      { href: "/help", label: t.link.help },
      { href: "/safety", label: t.link.safety },
    ],
  },
  {
    title: t.col.legal,
    links: [
      { href: "/terms", label: t.link.terms },
      { href: "/privacy", label: t.link.privacy },
      { href: "/privacy#cookies", label: t.link.cookies },
      { href: "/help#rules", label: t.link.rules },
    ],
  },
];

export function Footer() {
  const d = useDict();
  const t = d.footer;
  const tc = d.common;
  const COLUMNS = columns(t);
  const carBrands = brandsOf("car").slice(0, 12);
  const motoBrands = brandsOf("moto").slice(0, 9);

  return (
    <footer
      className="mt-20 border-t"
      style={{ borderColor: "var(--line-soft)", background: "var(--surface-2)" }}
    >
      <div className="mx-auto max-w-[1400px] px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo size={40} />
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
{t.tagline}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip chip-plain"><ShieldCheck size={12} /> {t.madeInMorocco}</span>
              <span className="chip chip-plain"><Coins size={12} /> {t.noBuyerFee}</span>
              <span className="chip chip-plain"><Message size={12} /> {t.darijaSupport}</span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-[13px] font-bold">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-[12.5px] transition hover:text-[var(--brand)]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rule my-9" />

        <div className="grid gap-8 lg:grid-cols-3">
          <div>
            <h4 className="mb-3 text-[11px] font-bold" style={{ color: "var(--text-dim)" }}>
              {t.carBrands}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {carBrands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/cars/${b.slug}`}
                  className="chip chip-plain transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  <bdi dir="ltr">{b.make}</bdi>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-bold" style={{ color: "var(--text-dim)" }}>
              {t.motoBrands}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {motoBrands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/motorcycles/${b.slug}`}
                  className="chip chip-plain transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  <bdi dir="ltr">{b.make}</bdi>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-bold" style={{ color: "var(--text-dim)" }}>
              {t.cities}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {TOP_CITIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/cars?city=${c.slug}`}
                  className="chip chip-plain transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  {c.ar}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col items-start justify-between gap-4 border-t pt-6 text-[11px] sm:flex-row sm:items-center"
          style={{ borderColor: "var(--line-soft)", color: "var(--text-dim)" }}
        >
          <p>
            © <span className="num">2026</span> {t.copyright}
          </p>
          <div className="flex items-center gap-4">
            <span>
              <span className="num">1</span> {t.millionNote} <span className="num">10 000</span> {tc.currency}
            </span>
            <span className="flex items-center gap-2">
              <Navigation size={13} /> {t.country}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
