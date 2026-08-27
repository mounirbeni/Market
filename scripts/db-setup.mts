#!/usr/bin/env tsx
/**
 * تطبيق هجرات قاعدة البيانات.
 *
 *   npm run db:migrate
 *   npm run db:migrate -- --status
 *
 * ماكاينش «تعمير» ديال بيانات: الموقع كيتعمّر بالإعلانات الحقيقية
 * اللي كينشرو الناس. كانت كاينة بذرة ب104 إعلان مخترع للتجريب —
 * تحيّدات باش ماتوصلش للإنتاج.
 */
import pg from "pg";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { migrationStatus, runMigrations, type Query } from "../src/lib/db/migrate";

const G = "\x1b[32m", Y = "\x1b[33m", R = "\x1b[31m", X = "\x1b[0m";

function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const f = resolve(process.cwd(), ".env.local");
  if (existsSync(f)) {
    const m = readFileSync(f, "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\n]+)"?/m);
    if (m) return m[1];
  }
  console.error(`${R}✗${X} ماكاينش DATABASE_URL. حطّو فـ.env.local ولا فالبيئة.`);
  process.exit(1);
}

const url = databaseUrl();
const client = new pg.Client({
  connectionString: url,
  ssl: /sslmode=(require|verify)/.test(url) ? { rejectUnauthorized: false } : undefined,
});

try {
  await client.connect();
} catch (e) {
  console.error(`${R}✗${X} ماقدرناش نتصلو بقاعدة البيانات:\n  ${(e as Error).message}`);
  process.exit(1);
}

const q: Query = async (text, params = []) => (await client.query(text, params)).rows;

/** كل هجرة فـtransaction ديالها — على نفس الاتصال */
const tx = async <T,>(fn: (q: Query) => Promise<T>): Promise<T> => {
  await client.query("BEGIN");
  try {
    const out = await fn(q);
    await client.query("COMMIT");
    return out;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  }
};

const argv = process.argv.slice(2);

try {
  if (argv.includes("--status")) {
    const rows = await migrationStatus(q);
    console.log(`الهجرات (${rows.length}):`);
    for (const r of rows) console.log(`  ${r.applied ? `${G}✓${X}` : `${Y}·${X}`} ${r.name}`);
    await client.end();
    process.exit(0);
  }

  const ran = await runMigrations(q, tx);
  for (const f of ran) console.log(`  → ${f} … ${G}✓${X}`);
  console.log(ran.length ? `${G}✓${X} تطبّقات ${ran.length} هجرة.` : "كلشي محدّث.");
} catch (e) {
  console.error(`\n${R}✗${X} ${(e as Error).message}\n`);
  await client.end();
  process.exit(1);
}

await client.end();
