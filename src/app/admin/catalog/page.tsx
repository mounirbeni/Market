import { listCatalog, overview } from "@/lib/db/moderation";
import { CatalogPanel } from "@/components/admin/CatalogPanel";

export const dynamic = "force-dynamic";

export default async function AdminCatalog({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [rows, s] = await Promise.all([listCatalog(q), overview()]);
  return <CatalogPanel rows={rows} total={s.models} />;
}
