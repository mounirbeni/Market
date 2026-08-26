import { getCurrentUser } from "@/lib/auth";
import { dbMissing, ok, unauthorized } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** إعلانات المستخدم اللي داخل — للوحة التحكّم */
export async function GET() {
  const missing = dbMissing();
  if (missing) return missing;

  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { listingsOfSeller, rowToVehicle } = await import("@/lib/db/listings");
  const rows = await listingsOfSeller(user.id);
  return ok({
    items: rows.map((r) => ({ ...rowToVehicle(r), status: r.status })),
  });
}
