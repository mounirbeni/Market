import { getCurrentUser } from "@/lib/auth";
import { unreadCount } from "@/lib/db/chat";
import { ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return ok({ user: null, unread: 0 });
  return ok({ user, unread: await unreadCount(user.id) });
}
