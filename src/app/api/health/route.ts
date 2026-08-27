import { mailConfigured, mailProvider } from "@/lib/mail";
import { blobConfigured } from "@/lib/blob";
import { adminCount } from "@/lib/admin";
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

  let users = 0;
  if (db) {
    try {
      const r = await sql<{ n: string }>("SELECT count(*)::text AS n FROM users");
      users = Number(r[0].n);
    } catch {
      /* ماشي حرج */
    }
  }

  return ok({
    db,
    listings,
    users,
    blob: blobConfigured(),
    mail: { configured: mailConfigured(), provider: mailProvider() || null },
    // شحال من إيميل فADMIN_EMAILS — الرقم فقط، بلا ما نبيّنو شكون
    admins: adminCount(),
  });
}
