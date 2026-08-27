import { listVerifications, verificationCounts } from "@/lib/db/moderation";
import { VerificationsPanel } from "@/components/admin/VerificationsPanel";

export const dynamic = "force-dynamic";

export default async function AdminVerifications({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "pending" } = await searchParams;
  const [rows, counts] = await Promise.all([listVerifications(status), verificationCounts()]);
  return <VerificationsPanel rows={rows} counts={counts} />;
}
