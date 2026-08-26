import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, ok, unauthorized, writeFail } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** مواعيد المستخدم — بائعاً كان ولا مشترياً */
export async function GET() {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { listAppointments } = await import("@/lib/db/writes");
  return ok({ items: await listAppointments(user.id) });
}

interface ApptBody {
  ref?: string;
  at?: string;
  place?: string;
  id?: string;
  status?: string;
}

/** طلب موعد جديد، ولا تأكيد/إلغاء موعد موجود */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<ApptBody>(req);
  try {
    const w = await import("@/lib/db/writes");
    if (b?.id && b.status) {
      await w.setAppointmentStatus(user.id, b.id, b.status);
      return ok({ done: true });
    }
    if (!b?.ref || !b.at) return writeFail(new Error("BAD_DATE"));
    const id = await w.requestAppointment(user.id, b.ref, new Date(b.at), b.place ?? "");
    return ok({ id });
  } catch (e) {
    return writeFail(e);
  }
}
