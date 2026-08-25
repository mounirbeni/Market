import { getCurrentUser } from "@/lib/auth";
import { listMessages, sendMessage } from "@/lib/db/chat";
import { CHAT_ERRORS, body, dbMissing, fail, ok, unauthorized } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** رسائل المحادثة — ?after=<آخر id> للاستقصاء التدريجي */
export async function GET(req: Request, { params }: Ctx) {
  const down = dbMissing();
  if (down) return down;
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  const after = new URL(req.url).searchParams.get("after") ?? undefined;

  try {
    return ok({ messages: await listMessages(id, user.id, after) });
  } catch (e) {
    const [msg, status] = CHAT_ERRORS[(e as Error).message] ?? ["وقع مشكل.", 500];
    return fail(msg, status);
  }
}

/** إرسال رسالة */
export async function POST(req: Request, { params }: Ctx) {
  const down = dbMissing();
  if (down) return down;
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  const b = await body<{ text?: string }>(req);

  try {
    const msg = await sendMessage(id, user.id, b?.text ?? "");
    return ok({ message: { ...msg, mine: true, body: (b?.text ?? "").trim() } });
  } catch (e) {
    const [m, status] = CHAT_ERRORS[(e as Error).message] ?? ["وقع مشكل.", 500];
    return fail(m, status);
  }
}
