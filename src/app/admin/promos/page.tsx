import { listPromotions, promoCounts } from "@/lib/db/moderation";
import { PromosPanel } from "@/components/admin/PromosPanel";

export const dynamic = "force-dynamic";

export default async function AdminPromos({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "pending" } = await searchParams;
  const [rows, counts] = await Promise.all([listPromotions(filter), promoCounts()]);
  return <PromosPanel rows={rows} counts={counts} />;
}
