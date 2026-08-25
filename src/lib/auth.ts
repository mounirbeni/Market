import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { sql, one } from "./db/client";

/* ============================================================
   الجلسات والمصادقة

   · الرمز كيتولّد عشوائياً (32 بايت) وكيترجع للمتصفح فكوكي httpOnly.
   · فقاعدة البيانات كنخزنو غير الـhash — سرقة نسخة من الجدول
     ماكتعطيش الجلسات.
   · نفس المبدأ لرموز OTP.
   ============================================================ */

const COOKIE = "triq_session";
const SESSION_DAYS = 30;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  /** اختياري — كيتزاد من الملف الشخصي، ماشي من التسجيل */
  phone: string | null;
  type: "particulier" | "professionnel";
  city: string | null;
  email_verified: boolean;
  id_verified: boolean;
}

/** المستخدم الحالي من الكوكي — null إلا ماكانش داخل */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!process.env.DATABASE_URL) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    return await one<CurrentUser>(
      `SELECT u.id, u.name, u.email, u.phone, u.type, u.city, u.email_verified, u.id_verified
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > now() AND u.banned_at IS NULL`,
      [sha256(token)],
    );
  } catch {
    return null;
  }
}

/** إنشاء جلسة وضبط الكوكي */
export async function createSession(userId: string, userAgent?: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await sql(
    `INSERT INTO sessions (user_id, token_hash, user_agent, expires_at)
     VALUES ($1,$2,$3,$4)`,
    [userId, sha256(token), userAgent?.slice(0, 300) ?? null, expires],
  );
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await sql("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
  jar.delete(COOKIE);
}

/* ---------------- OTP ---------------- */

const OTP_TTL_MIN = 10;
const OTP_MAX_ATTEMPTS = 5;
/** أقصى عدد طلبات لنفس الرقم فالساعة */
const OTP_RATE_PER_HOUR = 5;

/**
 * تنظيف الإيميل: حذف الفراغات وتصغير الحروف.
 * التحقق بسيط عن قصد — RFC كامل ماكيزيدش أمان، والتأكيد الحقيقي
 * كيجي من الرمز اللي كيتصيفط للصندوق.
 */
export function normalizeEmail(raw: string): string | null {
  const e = raw.trim().toLowerCase();
  if (e.length < 6 || e.length > 254) return null;
  return /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/.test(e) ? e : null;
}

export interface OtpIssue {
  ok: boolean;
  error?: string;
  /** كيترجع غير فالتطوير — فالإنتاج كيتصيفط بـSMS */
  devCode?: string;
}

/** توليد رمز وتخزين الـhash ديالو */
export async function issueOtp(email: string): Promise<OtpIssue> {
  const recent = await one<{ n: string }>(
    `SELECT count(*)::text AS n FROM otp_codes
     WHERE identifier = $1 AND created_at > now() - interval '1 hour'`,
    [email],
  );
  if (Number(recent?.n ?? 0) >= OTP_RATE_PER_HOUR) {
    return { ok: false, error: "طلبتي رموز بزاف. عاود من بعد ساعة." };
  }

  const code = String(randomBytes(4).readUInt32BE(0) % 1_000_000).padStart(6, "0");
  await sql(
    `INSERT INTO otp_codes (identifier, code_hash, expires_at)
     VALUES ($1,$2, now() + ($3 || ' minutes')::interval)`,
    [email, sha256(code), String(OTP_TTL_MIN)],
  );

  // TODO(إنتاج): صيفط الرمز بالإيميل (Resend / Postmark / SES).
  // ملي يتفعّل الإرسال الحقيقي، الرمز ماكيرجعش أبداً للمتصفح.
  const isProd = process.env.NODE_ENV === "production";
  const mailerEnabled = Boolean(process.env.EMAIL_PROVIDER);
  if (!isProd || !mailerEnabled) {
    console.log(`[OTP] ${email} → ${code}`);
    return { ok: true, devCode: mailerEnabled ? undefined : code };
  }
  return { ok: true };
}

export interface OtpCheck {
  ok: boolean;
  error?: string;
}

/** التحقق من الرمز واستهلاكه */
export async function verifyOtp(email: string, code: string): Promise<OtpCheck> {
  const row = await one<{ id: string; code_hash: string; attempts: number }>(
    `SELECT id, code_hash, attempts FROM otp_codes
     WHERE identifier = $1 AND consumed_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`,
    [email],
  );
  if (!row) return { ok: false, error: "الرمز منتهي ولا ماكاينش. اطلب واحد جديد." };
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, error: "محاولات بزاف. اطلب رمزاً جديداً." };
  }

  const a = Buffer.from(sha256(code));
  const b = Buffer.from(row.code_hash);
  const good = a.length === b.length && timingSafeEqual(a, b);

  if (!good) {
    await sql("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1", [row.id]);
    return { ok: false, error: "الرمز ماشي صحيح." };
  }
  await sql("UPDATE otp_codes SET consumed_at = now() WHERE id = $1", [row.id]);
  return { ok: true };
}

/** إيجاد المستخدم بالإيميل ولا إنشاؤه */
export async function upsertUserByEmail(email: string, name?: string) {
  const existing = await one<{ id: string }>(
    "SELECT id FROM users WHERE lower(email) = $1",
    [email],
  );
  if (existing) {
    await sql("UPDATE users SET email_verified = true WHERE id = $1", [existing.id]);
    return existing.id;
  }
  const created = await one<{ id: string }>(
    `INSERT INTO users (email, email_verified, name) VALUES ($1, true, $2) RETURNING id`,
    [email, name?.trim() || "مستعمل طريق"],
  );
  return created!.id;
}
