import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { Pool } from "pg";
import { issueOtp } from "../src/lib/auth";

test("concurrent OTP issuance cannot bypass the hourly quota", async () => {
  const db = new PGlite();
  const env = { ...process.env };
  const quiet = mock.method(console, "log", () => {});

  globalThis.__triqPool = {
    query: async (text: string, params: unknown[] = []) => db.query(text, params),
  } as unknown as Pool;
  process.env.DATABASE_URL = "postgresql://isolated-otp-issue-test";
  Object.assign(process.env, { NODE_ENV: "development" });
  delete process.env.EMAIL_PROVIDER;

  try {
    await db.exec(`
      CREATE TABLE otp_codes (
        id bigserial PRIMARY KEY,
        identifier text NOT NULL,
        code_hash text NOT NULL,
        attempts integer NOT NULL DEFAULT 0,
        consumed_at timestamptz,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE auth_rate_limits (
        key_hash text PRIMARY KEY,
        attempts integer NOT NULL,
        expires_at timestamptz NOT NULL
      );
    `);

    const results = await Promise.all(
      Array.from({ length: 12 }, () => issueOtp("race@example.test")),
    );
    assert.equal(results.filter((r) => r.ok).length, 5);
    assert.equal(results.filter((r) => r.code === "RATE_LIMIT").length, 7);

    const { rows: [row] } = await db.query<{ n: string }>(
      "SELECT count(*)::text AS n FROM otp_codes WHERE identifier='race@example.test'",
    );
    assert.equal(Number(row.n), 5);
  } finally {
    quiet.mock.restore();
    globalThis.__triqPool = undefined;
    for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key];
    Object.assign(process.env, env);
    await db.close();
  }
});
