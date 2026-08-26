import { get } from "@vercel/blob";
import { BLOB_ACCESS, blobConfigured } from "@/lib/blob";

export const runtime = "nodejs";

/* ============================================================
   تقديم صور الإعلانات

   الخزّان خاص (private)، فالمتصفح ماقدرش يقراه نيشان. هاد المسار
   كيقرا الملف بالتوكن ديال الخادم وكيرجّعو.

   المسار فيه لاحقة عشوائية من Vercel، يعني رابط الصورة ماكيتبدّلش
   أبداً — ولهذا كنعطيوه cache ديال سنة. الرد كيتخزّن فCDN ديال
   Vercel، فالزوّار اللي جايين كياخدو الصورة من الحافة بلا ما
   توصل حتى للدالة.
   ============================================================ */

const YEAR = 60 * 60 * 24 * 365;

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  if (!blobConfigured()) return new Response("غير مضبوط", { status: 503 });

  const { path } = await ctx.params;
  const pathname = path.map(decodeURIComponent).join("/");

  // ماكاين حتى سبب باش شي مسار يطلع لفوق — كنرفضوه على طول
  if (!pathname || pathname.includes("..")) return new Response("مسار ماشي صحيح", { status: 400 });

  try {
    const found = await get(pathname, { access: BLOB_ACCESS });
    if (!found) return new Response("ماكايناش", { status: 404 });

    return new Response(found.stream, {
      headers: {
        "content-type": found.blob.contentType || "application/octet-stream",
        "cache-control": `public, max-age=${YEAR}, immutable`,
        "content-disposition": "inline",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (e) {
    console.error("[media] ماقدرناش نقراو الصورة:", pathname, e);
    return new Response("ماكايناش", { status: 404 });
  }
}
