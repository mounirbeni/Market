import { listReports, reportCounts } from "@/lib/db/moderation";
import { ReportsPanel } from "@/components/admin/ReportsPanel";

export const dynamic = "force-dynamic";

export default async function AdminReports({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "open" } = await searchParams;
  const [reports, counts] = await Promise.all([listReports(status), reportCounts()]);
  return <ReportsPanel reports={reports} counts={counts} status={status} />;
}
