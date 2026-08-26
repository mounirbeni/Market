/* بلا "server-only": هاد الوحدة مشتركة مع سطر الأوامر (scripts/db-setup.mts).
   ماكتحملش أسرار — كتاخد دالة استعلام من برّا. السرّ (DATABASE_URL)
   كيبقى محبوس فـclient.ts اللي فيها الحارس. */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/* ============================================================
   تشغيل الهجرات

   نفس المنطق كيتستعمل من سطر الأوامر (npm run db:migrate) ومن
   مسار الإعداد فالموقع — باش ماتكونش نسختين كيتفرقو مع الوقت.
   ============================================================ */

export type Query = <T extends object>(text: string, params?: unknown[]) => Promise<T[]>;

/** مجلّد الهجرات — نسبة لجذر المشروع */
export const MIGRATIONS_DIR = resolve(process.cwd(), "db/migrations");

export function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
}

/** أسماء الهجرات المطبّقة — كتخلق الجدول إلا ماكانش */
export async function appliedMigrations(q: Query): Promise<Set<string>> {
  await q(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
  const rows = await q<{ name: string }>("SELECT name FROM schema_migrations");
  return new Set(rows.map((r) => r.name));
}

export interface MigrationStatus {
  name: string;
  applied: boolean;
}

export async function migrationStatus(q: Query): Promise<MigrationStatus[]> {
  const applied = await appliedMigrations(q);
  return migrationFiles().map((name) => ({ name, applied: applied.has(name) }));
}

/**
 * كيطبّق الهجرات الناقصة وحدة بوحدة.
 *
 * `runInTransaction` كياخد دالة كتشغّل استعلامات على نفس الاتصال —
 * كل هجرة فـtransaction ديالها، فإلا طاحت وحدة اللي قبلها كتبقى.
 */
export async function runMigrations(
  q: Query,
  runInTransaction: <T>(fn: (q: Query) => Promise<T>) => Promise<T>,
): Promise<string[]> {
  const applied = await appliedMigrations(q);
  const ran: string[] = [];

  for (const file of migrationFiles()) {
    if (applied.has(file)) continue;
    const sql = readFileSync(resolve(MIGRATIONS_DIR, file), "utf8");
    await runInTransaction(async (tx) => {
      await tx(sql);
      await tx("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    });
    ran.push(file);
  }

  return ran;
}
