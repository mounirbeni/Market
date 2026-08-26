import "server-only";
import { Pool } from "pg";

/* ============================================================
   اتصال قاعدة البيانات

   Pool وحيد على مستوى العملية. فالتطوير Next كيعاود يحمّل الوحدات
   مع كل تعديل، فكنخبّيوه فـglobalThis باش مانخلقوش عشرات الاتصالات.
   ============================================================ */

declare global {
  // eslint-disable-next-line no-var
  var __triqPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL ماكاينش. حطّو فـ.env.local (شوف .env.example).",
    );
  }
  return new Pool({
    connectionString,
    // Neon كيفرض TLS. الشهادة كتتحقق من طرف المزوّد.
    ssl: /sslmode=(require|verify)/.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
    max: Number(process.env.PGPOOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

/**
 * Pool كسول — كيتخلق غير ملي يتّطلب أول استعلام.
 * بهاد الطريقة استيراد الوحدة آمن حتى إلا ماكانش DATABASE_URL
 * (البناء، الاختبارات، الصفحات اللي ماكتقراش من القاعدة).
 */
export function getPool(): Pool {
  if (!globalThis.__triqPool) globalThis.__triqPool = createPool();
  return globalThis.__triqPool;
}

/** استعلام بسيط — كيرجع الصفوف فقط */
export async function sql<T extends object>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await getPool().query<T>(text, params);
  return res.rows;
}

/** صف واحد ولا null */
export async function one<T extends object>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await sql<T>(text, params);
  return rows[0] ?? null;
}

/** واش قاعدة البيانات مضبوطة ومتصلة */
export async function dbReady(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    await getPool().query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

/**
 * استعلامات متتالية على نفس الاتصال، داخل transaction.
 *
 * الهجرات خاصهم هادشي: BEGIN و COMMIT خاصهم يكونو على نفس الاتصال،
 * والـpool يقدر يعطي كل استعلام اتصال آخر.
 */
export async function transaction<T>(
  fn: (q: <R extends object>(text: string, params?: unknown[]) => Promise<R[]>) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const out = await fn(async (text, params = []) => (await client.query(text, params)).rows);
    await client.query("COMMIT");
    return out;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
