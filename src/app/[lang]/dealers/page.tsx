import type { Metadata } from "next";
import Link from "next/link";
import { getDealerCounts, getDealers } from "@/lib/source";
import { cityName } from "@/lib/cities";
import { formatNumber } from "@/lib/format";
import { ArrowLeft, BadgeCheck, Car, Clock, MapPin, Star, Users } from "@/components/icons";

export const metadata: Metadata = {
  title: "الوكلاء والمعارض المعتمدة",
  description:
    "لائحة المعارض والوكلاء المعتمدين في المغرب: مخزون المركبات، التقييمات، العنوان وساعات العمل.",
  alternates: { canonical: "/dealers" },
};

export default async function DealersPage() {
  const [counts, dealers] = await Promise.all([getDealerCounts(), getDealers()]);
  const rows = dealers
    .map((d) => ({ d, count: counts[d.slug] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const totalListings = rows.reduce((s, r) => s + r.count, 0);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <header className="mb-9 max-w-2xl">
        <span className="eyebrow"><Users size={13} /> بائعون محترفون</span>
        <h1 className="h-page mt-4">الوكلاء والمعارض</h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {rows.length > 0 ? (
            <>
              <span className="num">{rows.length}</span> معرضاً معتمداً كيعرضو{" "}
              <span className="num">{formatNumber(totalListings)}</span> مركبة. كل معرض موثّق
              بهوية تجارية وتقييمات من مشترين حقيقيين.
            </>
          ) : (
            <>
              باقي ماتسجّل حتى معرض. المعارض المعتمدة كيتوثّقو بالسجل التجاري،
              وكيبانو هنا بالمخزون ديالهم وساعات العمل والعنوان.
            </>
          )}
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ d, count }) => (
          <article key={d.slug} className="card card-hover overflow-hidden">
            <Link href={`/dealer/${d.slug}`} className="block">
              <div
                className="relative h-24"
                style={{ background: `linear-gradient(120deg, ${d.cover[0]}, ${d.cover[1]})` }}
              >
                <span
                  className="absolute -bottom-6 start-5 grid h-14 w-14 place-items-center rounded-2xl border-2 text-xl font-extrabold"
                  style={{ background: "var(--surface-1)", borderColor: "var(--surface-1)", color: "var(--brand)" }}
                >
                  {d.name.trim().slice(0, 1)}
                </span>
                {d.verified && (
                  <span className="tag absolute top-3 end-3" style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}>
                    <BadgeCheck size={11} /> موثّق
                  </span>
                )}
              </div>

              <div className="p-5 pt-9">
                <h2 className="text-[15px] font-bold">{d.name}</h2>
                <p className="mt-0.5 text-[11.5px]" style={{ color: "var(--text-dim)" }}>{d.tagline}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="chip chip-plain"><MapPin size={11} /> {cityName(d.city)}</span>
                  <span className="chip chip-plain">
                    <Star size={11} filled style={{ color: "var(--warn)" }} />
                    <span className="num">{d.rating.toFixed(1)}</span>
                  </span>
                  <span className="chip chip-plain"><Car size={11} /> <span className="num">{count}</span> مركبة</span>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
                  <Clock size={12} /> {d.hours}
                </p>

                <span
                  className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold transition-all"
                  style={{ color: "var(--brand)" }}
                >
                  شوف المعرض <ArrowLeft size={14} className="dir-flip" />
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
