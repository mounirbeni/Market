import { get } from "@vercel/blob";
import { BLOB_ACCESS, PRIVATE_PREFIX, blobConfigured } from "@/lib/blob";

export const runtime = "nodejs";

/* ============================================================
   تقديم صور وفيديوهات الإعلانات

   الخزّان خاص (private)، فالمتصفح ماقدرش يقراه نيشان. هاد المسار
   كيقرا الملف بالتوكن ديال الخادم وكيرجّعو.

   Range مهم بزاف للفيديو: Safari فiPhone ماكيقراش فيديو من خادم
   ماكيدعمش الطلبات الجزئية — كيبعث Range وكيسنّى 206، وإلا
   كيرفض يقرا أصلاً. كنمرّرو الرأس للخزّان وكنرجّعو الرد كما هو.

   المسار فيه لاحقة عشوائية من Vercel، يعني الرابط ماكيتبدّلش
   أبداً — ولهذا كنعطيوه cache ديال سنة، والرد كيتخزّن فCDN.
   ============================================================ */

const YEAR = 60 * 60 * 24 * 365;

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  if (!blobConfigured()) return new Response("غير مضبوط", { status: 503 });

  const { path } = await ctx.params;
  const pathname = path.map(decodeURIComponent).join("/");

  // ماكاين حتى سبب باش شي مسار يطلع لفوق — كنرفضوه على طول
  if (!pathname || pathname.includes("..")) return new Response("مسار ماشي صحيح", { status: 400 });

  /* وثائق الهوية ماكتّقدّمش من هنا مهما كان. هاد المسار عام:
     اللي عندو الرابط كيشوف الملف. */
  if (pathname.startsWith(PRIVATE_PREFIX)) return new Response("ماكايناش", { status: 404 });

  const range = req.headers.get("range");

  try {
    const found = await get(pathname, {
      access: BLOB_ACCESS,
      ...(range ? { headers: { range } } : {}),
    });
    if (!found || found.statusCode !== 200 || !found.stream)
      return new Response("ماكايناش", { status: 404 });

    const out = new Headers({
      "content-type": found.blob.contentType || "application/octet-stream",
      "cache-control": `public, max-age=${YEAR}, immutable`,
      "content-disposition": "inline",
      "x-content-type-options": "nosniff",
      "accept-ranges": "bytes",
    });

    /* الخزّان جاوب بجزء — كنمرّرو الحدود والحالة 206 كما هي،
       وإلا المتصفح كيحسب أنّ الملف كامل هو هاد الجزء. */
    const contentRange = found.headers.get("content-range");
    const contentLength = found.headers.get("content-length");
    if (contentLength) out.set("content-length", contentLength);
    if (range && contentRange) {
      out.set("content-range", contentRange);
      return new Response(found.stream, { status: 206, headers: out });
    }

    return new Response(found.stream, { headers: out });
  } catch (e) {
    console.error("[media] ماقدرناش نقراو الملف:", pathname, e);
    return new Response("ماكايناش", { status: 404 });
  }
}

/** المتصفح كيبعث HEAD قبل ما يقرا فيديو باش يعرف الحجم والنوع */
export async function HEAD(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const res = await GET(req, ctx);
  return new Response(null, { status: res.status, headers: res.headers });
}
