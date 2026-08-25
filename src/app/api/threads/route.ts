import { getCurrentUser } from "@/lib/auth";
import { listThreads, openThread } from "@/lib/db/chat";
import { CHAT_ERRORS, body, dbMissing, fail, ok, unauthorized } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** محادثاتي */
export async function GET() {
  const down = dbMissing();
  if (down) return down;
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return ok({ threads: await listThreads(user.id) });
}

/** فتح محادثة على إعلان */
export async function POST(req: Request) {
  const down = dbMissing();
  if (down) return down;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<{ listing?: string }>(req);
  if (!b?.listing) return fail("خاص معرّف الإعلان.");

  try {
    const id = await openThread(b.listing, user.id);
    return ok({ threadId: id });
  } catch (e) {
    const [msg, status] = CHAT_ERRORS[(e as Error).message] ?? ["وقع مشكل.", 500];
    return fail(msg, status);
  }
}
