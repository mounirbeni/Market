import { mailConfigured, mailProvider } from "@/lib/mail";
import { blobConfigured } from "@/lib/blob";
import { ok } from "@/lib/api";
import { sql } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * فحص الإعداد — بولياني فقط، بلا أي سرّ.
 * كيقول شنو مضبوط، ماشي شنو هي القيم.
 */
export async function GET() {
  let db = false;
  let listings = 0;
  if (process.env.DATABASE_URL) {
    try {
      const r = await sql<{ n: string }>("SELECT count(*)::text AS n FROM listings");
      db = true;
      listings = Number(r[0].n);
    } catch {
      /* موصولة ولكن الجداول ناقصة */
    }
  }

  return ok({
    db,
    listings,
    blob: blobConfigured(),
    mail: { configured: mailConfigured(), provider: mailProvider() || null },
  });
}
