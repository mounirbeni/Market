import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { one } from "./client";

/** Only trust the deployment's proxy header, not client-supplied forwarded IPs.
 * https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for */
export function adminRequestSource(req: Request): string | null {
  if (process.env.VERCEL !== "1") return null;
  const ip = req.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim();
  return ip && isIP(ip) ? ip : null;
}

/** Atomic fixed-window quota. Only hashed keys are persisted. */
export async function takeRateLimit(key: string, limit: number, seconds: number): Promise<boolean> {
  const hash = createHash("sha256").update(key).digest("hex");
  const row = await one<{ attempts: number }>(
    `INSERT INTO auth_rate_limits (key_hash, attempts, expires_at)
       VALUES ($1, 1, now() + make_interval(secs => $3::int))
     ON CONFLICT (key_hash) DO UPDATE SET
       attempts = CASE WHEN auth_rate_limits.expires_at <= now() THEN 1
                       ELSE auth_rate_limits.attempts + 1 END,
       expires_at = CASE WHEN auth_rate_limits.expires_at <= now()
                        THEN now() + make_interval(secs => $3::int)
                        ELSE auth_rate_limits.expires_at END
     WHERE auth_rate_limits.expires_at <= now() OR auth_rate_limits.attempts < $2
     RETURNING attempts`,
    [hash, limit, seconds],
  );
  return Boolean(row);
}
