import type { Metadata } from "next";
import { Link } from "@/components/Link";
import { DashboardShell } from "@/components/dashboard/Shell";
import { DealerProfileForm } from "@/components/dashboard/DealerProfile";
import { getCurrentUser } from "@/lib/auth";
import { dictionaryOf, getDictionary } from "@/lib/i18n/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { Users } from "@/components/icons";

export async function generateMetadata({
  params,
}: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = await dictionaryOf(locale);
  return { title: t.dealerForm.metaTitle, robots: { index: false, follow: false } };
}

export default async function DealerPage() {
  const t = await getDictionary();
  const d0 = t.dealerForm;
  const user = await getCurrentUser();

  return (
    <DashboardShell title={d0.metaTitle}>
      {user && user.type !== "professionnel" ? (
        <div className="card mx-auto max-w-md p-8 text-center">
          <span
            className="mx-auto grid h-12 w-12 place-items-center rounded-2xl"
            style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
          >
            <Users size={22} />
          </span>
          <h2 className="mt-4 text-[15px] font-bold">{d0.needsProTitle}</h2>
          <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {d0.needsProLead}
          </p>
          <Link href="/dashboard/settings" className="btn btn-primary mt-5">
            {d0.goToSettings}
          </Link>
        </div>
      ) : (
        <DealerProfileForm />
      )}
    </DashboardShell>
  );
}
