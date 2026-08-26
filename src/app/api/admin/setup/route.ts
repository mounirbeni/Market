import { sql, transaction } from "@/lib/db/client";
import { migrationStatus, runMigrations } from "@/lib/db/migrate";
import { SEED_BATCH, seedDatabase, tableCounts } from "@/lib/db/seed";
import { dbMissing, fail, ok } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/* ============================================================
   إعداد قاعدة البيانات مرة وحدة

   قاعدة بيانات Neon جديدة كتجي خاوية. `npm run db:setup` كيحتاج
   حاسوب، وهاد المسار كيدير نفس الشي من داخل Vercel — اللي عندو
   وصول للقاعدة.

   الحمايات:
   · الهجرات: idempotent أصلاً (schema_migrations كيتبّع اللي طبّق)
   · التعمير: كيتّدار غير ملي تكون جدول الإعلانات خاوي. ملي تكون
     كاينة إعلانات حقيقية، المسار كيرجع الأرقام وماكيكتب والو —
     باش عمرو مايطمس بيانات حقيقية ببيانات تجريبية.
   · SETUP_KEY: إلا كان مضبوط، خاصو يتطابق. إلا ماكانش، المسار
     كيخدم غير على قاعدة خاوية (وهي بطبيعتها مرة وحدة).
   ============================================================ */

/** واش المفتاح صحيح — إلا ماكانش SETUP_KEY مضبوط ماكاين حتى فحص */
function keyOk(req: Request): boolean {
  const expected = process.env.SETUP_KEY;
  if (!expected) return true;
  const given = new URL(req.url).searchParams.get("key") ?? "";
  return given === expected;
}

/** عدد الإعلانات، ولا null إلا الجدول ماكاينش أصلاً */
async function listingCount(): Promise<number | null> {
  try {
    const rows = await sql<{ n: string }>("SELECT count(*)::text AS n FROM listings");
    return Number(rows[0].n);
  } catch {
    return null;
  }
}

/** الحالة الحالية — بلا ما نكتبو والو */
export async function GET(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;
  if (!keyOk(req)) return fail("المفتاح ماشي صحيح.", 403);

  const listings = await listingCount();
  let migrations: { name: string; applied: boolean }[] = [];
  try {
    migrations = await migrationStatus(sql);
  } catch (e) {
    return fail(
      `ماقدرناش نوصلو لقاعدة البيانات: ${e instanceof Error ? e.message : "خطأ"}`,
      503,
    );
  }

  return ok({
    connected: true,
    tablesExist: listings !== null,
    listings: listings ?? 0,
    migrations,
    pending: migrations.filter((m) => !m.applied).map((m) => m.name),
    counts: listings === null ? null : await tableCounts(sql),
  });
}

/**
 * تشغيل الهجرات، ثم التعمير إلا كانت القاعدة خاوية.
 *
 * التعمير كيتقسّم على دفعات: Neon بعيد، وكل استعلام فيه ذهاب وإياب،
 * ف104 إعلان دفعة وحدة يقدرو يتجاوزو الحد ديال مدة الدالة. الواجهة
 * كتعاود تعيّط بـ?from= حتى تسالي.
 */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;
  if (!keyOk(req)) return fail("المفتاح ماشي صحيح.", 403);

  const sp = new URL(req.url).searchParams;
  const from = Math.max(0, Math.trunc(Number(sp.get("from") ?? 0)) || 0);

  const before = await listingCount();

  // بلا مفتاح، كنخدمو غير على قاعدة خاوية — الدفعات اللي مورا الأولى
  // كيكون فيها إعلانات بطبيعة الحال، فالفحص كيدار غير فالبداية
  if (!process.env.SETUP_KEY && from === 0 && before !== null && before > 0)
    return fail(
      "قاعدة البيانات فيها إعلانات. باش تعاود الإعداد، ضبط SETUP_KEY فمتغيّرات البيئة.",
      409,
    );

  let ran: string[] = [];
  if (from === 0) {
    try {
      ran = await runMigrations(sql, transaction);
    } catch (e) {
      return fail(
        `فشلات الهجرة: ${e instanceof Error ? e.message : "خطأ غير معروف"}`,
        500,
      );
    }

    const after = await listingCount();
    if (after === null) return fail("الهجرات دازو ولكن الجداول مازال ماكايناش.", 500);

    // التعمير غير على قاعدة خاوية — البيانات الحقيقية ماكتّمسّش
    if (after > 0) {
      return ok({
        migrated: ran,
        seeded: false,
        done: true,
        reason: "القاعدة فيها إعلانات من قبل — ماعمّرناش.",
        counts: await tableCounts(sql),
      });
    }
  }

  try {
    const p = await seedDatabase(sql, { from, count: SEED_BATCH });
    const done = p.next === null;
    return ok({
      migrated: ran,
      seeded: true,
      done,
      next: p.next,
      progress: { at: Math.min(from + SEED_BATCH, p.total), total: p.total },
      counts: done ? await tableCounts(sql) : null,
    });
  } catch (e) {
    return fail(
      `الهجرات دازو ولكن التعمير طاح: ${e instanceof Error ? e.message : "خطأ"}`,
      500,
    );
  }
}
