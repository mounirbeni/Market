#!/usr/bin/env node
/**
 * تشغيل الهجرات بالترتيب.
 *
 *   npm run db:migrate            # كيطبّق اللي مازال ماتطبّقش
 *   npm run db:migrate -- --status  # كيعرض الحالة بلا ما يطبّق
 *
 * كيقرا DATABASE_URL من البيئة ولا من .env.local
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = resolve(ROOT, "db/migrations");

/** DATABASE_URL من البيئة، وإلا من .env.local */
export function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envFile = resolve(ROOT, ".env.local");
  if (existsSync(envFile)) {
    const m = readFileSync(envFile, "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\n]+)"?/m);
    if (m) return m[1];
  }
  console.error("\x1b[31m✗\x1b[0m ماكاينش DATABASE_URL. حطّو فـ.env.local ولا فالبيئة.");
  process.exit(1);
}

const url = databaseUrl();
const client = new pg.Client({
  connectionString: url,
  ssl: /sslmode=require/.test(url) ? { rejectUnauthorized: false } : undefined,
});

const statusOnly = process.argv.includes("--status");

try {
  await client.connect();
} catch (e) {
  console.error(`\x1b[31m✗\x1b[0m ماقدرناش نتصلو بقاعدة البيانات:\n  ${e.message}`);
  process.exit(1);
}

await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);

const { rows } = await client.query("SELECT name FROM schema_migrations");
const applied = new Set(rows.map((r) => r.name));
const files = readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();

if (statusOnly) {
  console.log(`الهجرات (${files.length}):`);
  for (const f of files) console.log(`  ${applied.has(f) ? "\x1b[32m✓\x1b[0m" : "\x1b[33m·\x1b[0m"} ${f}`);
  await client.end();
  process.exit(0);
}

let ran = 0;
for (const file of files) {
  if (applied.has(file)) continue;
  const sql = readFileSync(resolve(DIR, file), "utf8");
  process.stdout.write(`  → ${file} … `);
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    await client.query("COMMIT");
    console.log("\x1b[32m✓\x1b[0m");
    ran++;
  } catch (e) {
    await client.query("ROLLBACK");
    console.log("\x1b[31m✗\x1b[0m");
    console.error(`\n${e.message}\n`);
    await client.end();
    process.exit(1);
  }
}

console.log(ran ? `\x1b[32m✓\x1b[0m تطبّقات ${ran} هجرة.` : "كلشي محدّث — ماكاين حتى هجرة جديدة.");
await client.end();
