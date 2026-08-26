import { body, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * تقرير فشل الرفع.
 *
 * الرفع كيوقع فالمتصفح بين المستخدم وVercel Blob — الخادم ديالنا
 * ماكيشوفش الخطأ. هاد المسار كيخلّي المتصفح يقولّو، والخطأ كيبان
 * فسجلات Vercel.
 *
 * ماكيتسجّل حتى محتوى ديال الملف — غير الحجم والنوع ورسالة الخطأ.
 */
export async function POST(req: Request) {
  const b = await body<{
    message?: string;
    name?: string;
    status?: number;
    percentage?: number;
    elapsedMs?: number;
    size?: number;
    type?: string;
    aborted?: boolean;
  }>(req);

  const user = await getCurrentUser().catch(() => null);

  console.error(
    "[upload-fail]",
    JSON.stringify({
      user: user?.id ?? null,
      name: b?.name ?? null,
      status: b?.status ?? null,
      message: String(b?.message ?? "").slice(0, 400),
      percentage: b?.percentage ?? null,
      elapsedMs: b?.elapsedMs ?? null,
      size: b?.size ?? null,
      type: b?.type ?? null,
      aborted: Boolean(b?.aborted),
      ua: req.headers.get("user-agent")?.slice(0, 160) ?? null,
    }),
  );

  return ok({ logged: true });
}
