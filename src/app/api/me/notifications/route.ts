import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, ok, unauthorized, writeFail } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** إشعارات المستخدم اللي داخل */
export async function GET() {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { listNotifications } = await import("@/lib/db/writes");
  return ok({ items: await listNotifications(user.id) });
}

/** علّم كمقروء — إشعار واحد ولا الكل */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<{ ids?: string[]; all?: boolean }>(req);
  try {
    const { markNotificationsRead } = await import("@/lib/db/writes");
    await markNotificationsRead(user.id, b?.all ? undefined : b?.ids);
    return ok({ done: true });
  } catch (e) {
    return writeFail(e);
  }
}
