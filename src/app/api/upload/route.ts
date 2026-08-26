import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import {
  MAX_PHOTO_BYTES, MAX_VIDEO_BYTES, PHOTO_TYPES, VIDEO_TYPES, blobConfigured,
} from "@/lib/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * توكن الرفع المباشر.
 *
 * الملف كيمشي من المتصفح لVercel Blob نيشان، ماشي عبر هاد الدالة —
 * حيت تصاور التيليفون عادة أكبر من الحد ديال جسم الطلب (4.5 ميغا).
 * هنا كنتحققو غير من المستخدم وكنوقّعو توكن محدود.
 */
export async function POST(req: Request) {
  if (!blobConfigured())
    return fail("رفع الصور ماشي مضبوط: BLOB_READ_WRITE_TOKEN ناقص.", 503);

  const body = (await req.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const user = await getCurrentUser();
        if (!user) throw new Error("خاصك تسجّل الدخول باش ترفع صور.");

        // الملف خاصو يكون داخل المجلّد ديال هاد المستخدم — بلا هاد
        // الفحص شي حد يقدر يكتب فوق صور ديال واحد آخر
        if (!pathname.startsWith(`listings/${user.id}/`))
          throw new Error("مسار الملف ماشي صحيح.");

        const isVideo = /\.(mp4|mov|webm)$/i.test(pathname);
        return {
          allowedContentTypes: isVideo ? VIDEO_TYPES : PHOTO_TYPES,
          maximumSizeInBytes: isVideo ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      onUploadCompleted: async () => {
        /* الصورة كتّربط بالإعلان ملي يتنشر — ماشي هنا.
           (هاد الرد ماكيوصلش أصلاً فالتطوير المحلي) */
      },
    });
    return Response.json(result);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "ماقدرناش نرفعو الصورة.", 400);
  }
}

/** فحص بسيط: واش الرفع مضبوط أصلاً — الواجهة كتسولو قبل ما توري زر الرفع */
export async function GET() {
  return ok({ enabled: blobConfigured() });
}
