import { listListings } from "@/lib/db/moderation";
import { ListingsPanel } from "@/components/admin/ListingsPanel";

export const dynamic = "force-dynamic";

export default async function AdminListings({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "all" } = await searchParams;
  return <ListingsPanel rows={await listListings(q, status)} />;
}
