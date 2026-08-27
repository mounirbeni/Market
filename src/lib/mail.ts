import "server-only";

/* ============================================================
   إرسال الإيميل

   ثلاثة مزوّدين:
   · brevo  — HTTP API، بلا تبعية (منصوح بيه)
   · resend — HTTP API، بلا تبعية
   · smtp   — أي خادم SMTP عبر nodemailer (Gmail، Brevo SMTP…)

   HTTP خير من SMTP فVercel: SMTP كيفتح اتصال TCP وTLS جديد فكل
   استدعاء ديال الدالة، فكيكون أبطأ، وأحياناً كيتقطع.
   ============================================================ */

export const mailProvider = () => process.env.EMAIL_PROVIDER?.trim().toLowerCase() ?? "";

export function mailConfigured(): boolean {
  switch (mailProvider()) {
    case "brevo":
      return Boolean(process.env.BREVO_API_KEY);
    case "resend":
      return Boolean(process.env.RESEND_API_KEY);
    case "smtp":
      return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    default:
      return false;
  }
}

/** «الاسم <العنوان>» → { name, email } — Brevo كيطلبهم مفرّقين */
function splitFrom(value: string): { name?: string; email: string } {
  const m = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1] || undefined, email: m[2].trim() };
  return { email: value.trim() };
}

/** المُرسِل — خاصو يكون نطاق موثّق عند المزوّد */
const from = () => process.env.EMAIL_FROM?.trim() || "طريق <onboarding@resend.dev>";

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /**
   * العنوان اللي كيتجاوب عليه.
   * المرسل كيبقى ديالنا — مزوّدي البريد كيرفضو عنواناً ماشي موثق —
   * وهاد الرأس كيخلّي «رد» يمشي مباشرة للي صيفط.
   */
  replyTo?: string;
}

export interface SendResult {
  ok: boolean;
  error?: string;
}

async function sendResend(mail: Mail): Promise<SendResult> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: from(),
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: [mail.replyTo] } : {}),
      }),
    });

    if (!res.ok) {
      // رسالة المزوّد كتمشي للسجل، ماشي للمستخدم — فيها تفاصيل الحساب
      const body = await res.text().catch(() => "");
      console.error(`[mail] Resend ${res.status}: ${body.slice(0, 300)}`);
      return { ok: false, error: "ماقدرناش نصيفطو الإيميل." };
    }
    return { ok: true };
  } catch (e) {
    console.error("[mail] فشل الاتصال بمزوّد الإيميل:", e);
    return { ok: false, error: "ماقدرناش نصيفطو الإيميل." };
  }
}

async function sendBrevo(mail: Mail): Promise<SendResult> {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY as string,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: splitFrom(from()),
        to: [{ email: mail.to }],
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
        ...(mail.replyTo ? { replyTo: { email: mail.replyTo } } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[mail] Brevo ${res.status}: ${body.slice(0, 300)}`);
      return { ok: false, error: "ماقدرناش نصيفطو الإيميل." };
    }
    return { ok: true };
  } catch (e) {
    console.error("[mail] فشل الاتصال بـBrevo:", e);
    return { ok: false, error: "ماقدرناش نصيفطو الإيميل." };
  }
}

/**
 * SMTP عام — كيخدم مع Gmail (بكلمة سر التطبيقات)، Brevo SMTP، وغيرهم.
 *
 * nodemailer كيتحمّل كسولاً باش ماتّجرّش الحزمة ملي المزوّد HTTP.
 */
async function sendSmtp(mail: Mail): Promise<SendResult> {
  try {
    const { createTransport } = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transport = createTransport({
      host: process.env.SMTP_HOST,
      port,
      // 465 = TLS من البداية، 587 = STARTTLS
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transport.sendMail({
      from: from(),
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
    });
    return { ok: true };
  } catch (e) {
    console.error("[mail] فشل SMTP:", e);
    return { ok: false, error: "ماقدرناش نصيفطو الإيميل." };
  }
}

export async function send(mail: Mail): Promise<SendResult> {
  if (!mailConfigured()) return { ok: false, error: "مزوّد الإيميل ماشي مضبوط." };
  switch (mailProvider()) {
    case "brevo":
      return sendBrevo(mail);
    case "resend":
      return sendResend(mail);
    case "smtp":
      return sendSmtp(mail);
    default:
      return { ok: false, error: "مزوّد الإيميل ماشي معروف." };
  }
}

/** رسالة رمز الدخول — عربية، من اليمين لليسار */
export function otpMail(to: string, code: string, ttlMinutes: number): Mail {
  const spaced = code.split("").join(" ");
  return {
    to,
    subject: `${code} — رمز الدخول ديالك فطريق`,
    text:
      `رمز الدخول ديالك فطريق هو: ${code}\n\n` +
      `صالح ${ttlMinutes} دقائق. إلا ماطلبتيهش، تجاهل هاد الرسالة.\n`,
    html: `<!doctype html>
<html lang="ar" dir="rtl"><body style="margin:0;padding:24px;background:#f4f6fb;font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e3e8f0">
    <tr><td style="padding:24px 24px 8px;text-align:right">
      <div style="font-size:19px;font-weight:800;color:#0a1e3d">طريق</div>
      <div style="font-size:11px;letter-spacing:.14em;color:#8a94a6">TRIQ</div>
    </td></tr>
    <tr><td style="padding:8px 24px 4px;text-align:right;font-size:15px;color:#0a1e3d;font-weight:700">
      رمز الدخول ديالك
    </td></tr>
    <tr><td style="padding:16px 24px">
      <div style="background:#f4f6fb;border:1px solid #e3e8f0;border-radius:12px;padding:18px;text-align:center;font-size:30px;font-weight:800;letter-spacing:.24em;color:#0a1e3d;direction:ltr">${spaced}</div>
    </td></tr>
    <tr><td style="padding:0 24px 22px;text-align:right;font-size:12.5px;line-height:1.8;color:#5b6577">
      صالح <b>${ttlMinutes}</b> دقائق. إلا ماطلبتيهش، تجاهل هاد الرسالة —
      حتى واحد ماقدر يدخل بلا هاد الرمز.
    </td></tr>
  </table>
  <div style="max-width:440px;margin:12px auto 0;text-align:center;font-size:11px;color:#8a94a6">
    طريق — سوق السيارات والدراجات فالمغرب
  </div>
</body></html>`,
  };
}
