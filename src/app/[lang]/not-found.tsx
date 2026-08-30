import { Link } from "@/components/Link";
import { getDictionary } from "@/lib/i18n/server";
import { Car, Road } from "@/components/icons";

export default async function NotFound() {
  const t = await getDictionary();
  const n = t.notFoundPage;
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span
        className="grid h-16 w-16 place-items-center rounded-2xl"
        style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
      >
        <Road size={30} />
      </span>
      <span className="num mt-5 text-4xl font-extrabold" style={{ color: "var(--brand)" }}>404</span>
      <h1 className="mt-4 text-2xl font-black">{n.title}</h1>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {n.text}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/vehicles" className="btn btn-primary"><Car size={16} /> {n.browseVehicles}</Link>
        <Link href="/" className="btn btn-ghost">{n.home}</Link>
      </div>
    </div>
  );
}
