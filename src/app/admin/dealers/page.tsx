import { listDealers } from "@/lib/db/moderation";
import { DealersPanel } from "@/components/admin/DealersPanel";

export const dynamic = "force-dynamic";

export default async function AdminDealers() {
  return <DealersPanel rows={await listDealers()} />;
}
