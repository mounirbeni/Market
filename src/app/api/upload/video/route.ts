import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { MAX_VIDEO_BYTES, VIDEO_TYPES, blobConfigured } from "@/lib/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   رفع الفيديو

   الصور كيدوزو من الخادم ديالنا حيت كنصغّروهم تحت 3.4 ميغا.
   الفيديو ماقدرناش نديرو ليه هادشي: فيديو ديال 20 ثانية من
   تيليفون كيوزن 30 لـ80 ميغا، وحدّ Vercel على جسم الطلب هو
   4.5 ميغا. وحتى «الرفع بالقطع» ماكيحلّش: أصغر قطعة مسموحة
   هي 5 ميغا، أكبر من الحدّ.

   فالفيديو خاصو يمشي من المتصفح للخزّان نيشان. هنا كنتحققو من
   المستخدم وكنوقّعو توكن محدود: نوع الملف، الحجم، والمسار خاصو
   يكون داخل المجلّد ديالو.

   `access: "private"` جاي من المتصفح وخاصو يطابق الخزّان —
   الخزّان ديالنا خاص، ورفع بـ"public" كيترفض:
   «Cannot use public access on a private store».

   بلا onUploadCompleted عن قصد: كيخلّي الرفع كيسنّى ردّ من خادم
   لخادم، وإلا ماوصلش كيبقى واقف. الروابط كيتربطو بالإعلان ملي
   كينشر، من المتصفح اللي عندو النتيجة.
   ============================================================ */

export async function POST(req: Request) {
  if (!blobConfigured())
    return fail("رفع الفيديو ماشي مضبوط: BLOB_READ_WRITE_TOKEN ناقص.", 503);

  const body = (await req.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const user = await getCurrentUser();
        if (!user) throw new Error("خاصك تسجّل الدخول باش ترفع فيديو.");
        if (!pathname.startsWith(`listings/${user.id}/`))
          throw new Error("مسار الملف ماشي صحيح.");

        return {
          allowedContentTypes: VIDEO_TYPES,
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
    });
    return Response.json(result);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "ماقدرناش نرفعو الفيديو.", 400);
  }
}

/** فحص: واش الرفع مضبوط، وشحال الحد الأقصى */
export async function GET() {
  return ok({ enabled: blobConfigured(), maxBytes: MAX_VIDEO_BYTES });
}
