import { getCurrentUser } from "@/lib/auth";
import { markThreadRead } from "@/lib/db/chat";
import { CHAT_ERRORS, dbMissing, fail, ok, unauthorized } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const down = dbMissing();
  if (down) return down;
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  try {
    await markThreadRead(id, user.id);
    return ok({ done: true });
  } catch (e) {
    const [m, status] = CHAT_ERRORS[(e as Error).message] ?? ["وقع مشكل.", 500];
    return fail(m, status);
  }
}
