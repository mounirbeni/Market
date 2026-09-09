import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { transaction } from "./client";

/** Lock the newest challenge, including consumed ones, so an older code can
 * never become usable again after a newer challenge is consumed. */
export async function consumeOtp(identifier: string, code: string, maxAttempts = 5) {
  return transaction(async (q) => {
    const [row] = await q<{
      id: string; code_hash: string; attempts: number;
      consumed_at: unknown; valid: boolean;
    }>(
      `SELECT id, code_hash, attempts, consumed_at, expires_at > now() AS valid
         FROM otp_codes WHERE identifier = $1
         ORDER BY created_at DESC, id DESC LIMIT 1 FOR UPDATE`,
      [identifier],
    );
    if (!row || !row.valid || row.consumed_at) return "CODE_EXPIRED" as const;
    if (row.attempts >= maxAttempts) return "TOO_MANY_ATTEMPTS" as const;
    const actual = Buffer.from(createHash("sha256").update(code).digest("hex"));
    const expected = Buffer.from(row.code_hash);
    const good = actual.length === expected.length && timingSafeEqual(actual, expected);
    await q(
      `UPDATE otp_codes SET attempts = attempts + 1,
         consumed_at = CASE WHEN $2::boolean THEN now() ELSE consumed_at END
         WHERE id = $1`,
      [row.id, good],
    );
    return good ? "OK" as const : "BAD_CODE" as const;
  });
}
