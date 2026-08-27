import { get } from "@vercel/blob";
import { getAdmin } from "@/lib/admin";
import { BLOB_ACCESS, PRIVATE_PREFIX, blobConfigured } from "@/lib/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * وثائق الهوية — للمشرف وحدو.
 *
 * ماكاينش cache: وثيقة هوية ماخاصهاش تبقى فأي حافة ولا فأي
 * متصفح وسيط.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const admin = await getAdmin();
  if (!admin || !blobConfigured()) return new Response("ماكايناش", { status: 404 });

  const { path } = await ctx.params;
  const pathname = path.map(decodeURIComponent).join("/");
  if (!pathname.startsWith(PRIVATE_PREFIX) || pathname.includes("..")) {
    return new Response("ماكايناش", { status: 404 });
  }

  try {
    const found = await get(pathname, { access: BLOB_ACCESS });
    if (!found || found.statusCode !== 200 || !found.stream) {
      return new Response("ماكايناش", { status: 404 });
    }
    return new Response(found.stream, {
      headers: {
        "content-type": found.blob.contentType || "application/octet-stream",
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("ماكايناش", { status: 404 });
  }
}
