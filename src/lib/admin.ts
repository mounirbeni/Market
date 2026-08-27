import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { sql, one } from "./db/client";
import { adminOtpMail, mailConfigured, send } from "./mail";

/* ============================================================
   الإشراف — دخول مستقل تماماً

   ثلاث طبقات:
     1. الإيميل خاصو يكون فـADMIN_EMAILS
     2. كلمة السر خاصها تطابق ADMIN_PASSWORD_HASH
     3. رمز ديال 6 أرقام كيتصيفط لنفس الإيميل

   علاش متغيّرات بيئة ماشي جدول: باش الواحد يولّي مشرف خاصو
   يوصل لإعدادات Vercel. حتى إلا تسرّبات قاعدة البيانات، حتى
   واحد ماقدر يدير راسو مشرف بـUPDATE.

   الجلسة عندها كوكي ديالها (`triq_admin`) منفصل على كوكي
   المستخدمين: جلسة مستخدم عادي ماكتعطي حتى صلاحية هنا.
   ============================================================ */

const COOKIE = "triq_admin";
const SESSION_HOURS = 8;
const CODE_TTL_MIN = 10;
const CODE_MAX_ATTEMPTS = 5;
/** أقصى محاولات دخول فاشلة فالساعة — على كل الموقع */
const MAX_FAILS_PER_HOUR = 12;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

const admins = () =>
  new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );

export const adminConfigured = () =>
  admins().size > 0 && Boolean(process.env.ADMIN_PASSWORD_HASH);

/** شحال من مشرف مضبوط — للفحص، بلا ما نبيّنو الإيميلات */
export const adminCount = () => admins().size;

/* ---------------- كلمة السر ---------------- */

/**
 * الشكل: scrypt$<ملح hex>$<hash hex>
 *
 * scrypt بطيء عن قصد: التخمين كيولّي غالي. والمقارنة
 * timingSafeEqual باش وقت الرد ماينفعش المهاجم.
 */
export function hashPassword(password: string, salt = randomBytes(16)): string {
  const key = scryptSync(password.normalize("NFKC"), salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

function passwordOk(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH ?? "";
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  try {
    const key = scryptSync(password.normalize("NFKC"), Buffer.from(saltHex, "hex"), 64);
    const stored2 = Buffer.from(keyHex, "hex");
    return key.length === stored2.length && timingSafeEqual(key, stored2);
  } catch {
    return false;
  }
}

/* ---------------- الجلسة ---------------- */

export interface AdminSession {
  email: string;
}

/** المشرف الحالي من الكوكي — null إلا ماكانش داخل */
export async function getAdmin(): Promise<AdminSession | null> {
  if (!adminConfigured() || !process.env.DATABASE_URL) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const row = await one<{ email: string }>(
      "SELECT email FROM admin_sessions WHERE token_hash = $1 AND expires_at > now()",
      [sha256(token)],
    );
    // الإيميل خاصو يبقى فاللائحة — حيّدو من ADMIN_EMAILS والجلسة كتموت
    if (!row || !admins().has(row.email)) return null;
    return { email: row.email };
  } catch {
    return null;
  }
}

async function createAdminSession(email: string, userAgent?: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_HOURS * 3600_000);
  await sql(
    "INSERT INTO admin_sessions (email, token_hash, user_agent, expires_at) VALUES ($1,$2,$3,$4)",
    [email, sha256(token), userAgent?.slice(0, 300) ?? null, expires],
  );
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires,
  });
}

export async function adminLogout() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await sql("DELETE FROM admin_sessions WHERE token_hash = $1", [sha256(token)]);
  jar.delete(COOKIE);
}

/* ---------------- الدخول ---------------- */

export interface AdminAuthResult {
  ok: boolean;
  error?: string;
  /** فالتطوير المحلي فقط */
  devCode?: string;
}

async function tooManyFails(): Promise<boolean> {
  const r = await one<{ n: string }>(
    `SELECT count(*)::text AS n FROM admin_attempts
      WHERE NOT ok AND created_at > now() - interval '1 hour'`,
  );
  return Number(r?.n ?? 0) >= MAX_FAILS_PER_HOUR;
}

const record = (email: string | null, ok: boolean) =>
  sql("INSERT INTO admin_attempts (email, ok) VALUES ($1,$2)", [email, ok]);

/** الخطوة 1: الإيميل + كلمة السر → كيتصيفط رمز */
export async function startAdminLogin(
  rawEmail: string,
  password: string,
): Promise<AdminAuthResult> {
  if (!adminConfigured()) return { ok: false, error: "الإشراف ماشي مضبوط." };

  const email = rawEmail.trim().toLowerCase();

  if (await tooManyFails()) {
    return { ok: false, error: "محاولات بزاف. عاود من بعد ساعة." };
  }

  /* نفس الرسالة سواء الإيميل غالط ولا كلمة السر: بلا هادشي
     المهاجم كيعرف واش الإيميل صحيح. وكنحسبو كلمة السر حتى ملي
     الإيميل غالط باش الوقت مايفرّقش. */
  const emailOk = admins().has(email);
  const pwOk = passwordOk(password);
  if (!emailOk || !pwOk) {
    await record(email || null, false);
    return { ok: false, error: "الإيميل ولا كلمة السر ماشي صحاح." };
  }

  const code = String(randomBytes(4).readUInt32BE(0) % 1_000_000).padStart(6, "0");
  await sql(
    `INSERT INTO otp_codes (identifier, code_hash, expires_at)
     VALUES ($1,$2, now() + ($3 || ' minutes')::interval)`,
    [`admin:${email}`, sha256(code), String(CODE_TTL_MIN)],
  );

  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    console.log(`[ADMIN] ${email} → ${code}`);
    if (!mailConfigured()) return { ok: true, devCode: code };
  }
  if (!mailConfigured()) {
    return { ok: false, error: "إرسال الإيميل ماشي مضبوط. ماقدرناش نصيفطو الرمز." };
  }

  const sent = await send(adminOtpMail(email, code, CODE_TTL_MIN));
  if (!sent.ok) return { ok: false, error: "ماقدرناش نصيفطو الرمز." };
  return { ok: true };
}

/** الخطوة 2: الرمز → جلسة إشراف */
export async function finishAdminLogin(
  rawEmail: string,
  code: string,
  userAgent?: string,
): Promise<AdminAuthResult> {
  if (!adminConfigured()) return { ok: false, error: "الإشراف ماشي مضبوط." };
  const email = rawEmail.trim().toLowerCase();
  if (!admins().has(email)) return { ok: false, error: "الرمز ماشي صحيح." };

  const row = await one<{ id: string; code_hash: string; attempts: number }>(
    `SELECT id, code_hash, attempts FROM otp_codes
      WHERE identifier = $1 AND consumed_at IS NULL AND expires_at > now()
      ORDER BY created_at DESC LIMIT 1`,
    [`admin:${email}`],
  );
  if (!row) return { ok: false, error: "الرمز منتهي. عاود الدخول." };
  if (row.attempts >= CODE_MAX_ATTEMPTS) {
    return { ok: false, error: "محاولات بزاف. عاود الدخول." };
  }

  const a = Buffer.from(sha256(code.trim()));
  const b = Buffer.from(row.code_hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await sql("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1", [row.id]);
    await record(email, false);
    return { ok: false, error: "الرمز ماشي صحيح." };
  }

  await sql("UPDATE otp_codes SET consumed_at = now() WHERE id = $1", [row.id]);
  await record(email, true);
  await createAdminSession(email, userAgent);
  await logAdmin(email, "login");
  return { ok: true };
}

/** سجل الإجراءات — كل إجراء إشراف كيتسجّل */
export async function logAdmin(
  email: string,
  action: string,
  target?: string,
  detail?: string,
) {
  await sql(
    "INSERT INTO admin_log (email, action, target, detail) VALUES ($1,$2,$3,$4)",
    [email, action, target ?? null, detail ?? null],
  ).catch(() => {
    /* السجل ماخاصوش يوقف الإجراء */
  });
}
