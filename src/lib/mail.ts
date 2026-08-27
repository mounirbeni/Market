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

/* ============================================================
   القالب البصري — نفس هوية الموقع

   الألوان جايين من نفس المتغيّرات ديال globals.css (النسخة
   الفاتحة: البريد ماكيقدرش يتبع theme المستخدم بثقة). العلامة
   هي نفسها النجمة الزليجية ديال Logo.tsx، بصيغة لون واحد بلا
   تدرّج — Outlook لسطح المكتب كيكسّر <linearGradient> فالبريد،
   فخيّرنا السلامة على الزخرفة.

   شكل البطاقة (16px استدارة، حدود فاتحة) و«الشارة» الزرقاء
   (--brand-soft خلفية + --brand نص) نفس القالب اللي كيبان بيه
   العنصر النشيط فالموقع — مثلاً الفلاتر المفعّلة.
   ============================================================ */
const C = {
  bg: "#f4f8fe", // --bg-deep
  card: "#ffffff", // --surface-1
  line: "#dde6f2", // --line
  text: "#0a1e3d", // --text
  muted: "#4a5c78", // --text-muted
  dim: "#7d8ea8", // --text-dim
  brand: "#1f5fe0", // --brand
  brandSoft: "#eaf1ff", // --brand-soft
  brandLine: "#c3d7fb",
  bad: "#dc2626", // --bad
  badSoft: "#fdeceb", // --bad-soft
};

const FONT =
  "'IBM Plex Sans Arabic','Segoe UI',Tahoma,system-ui,-apple-system,sans-serif";

/** نجمة زليجية ثمانية بلون العلامة الواحد — نفس مسار Logo.tsx بلا تدرّج */
function logoMarkSvg(size = 34): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" style="display:block">
    <path d="M24 1.5 30.6 8.1 39.9 8.1 39.9 17.4 46.5 24 39.9 30.6 39.9 39.9 30.6 39.9 24 46.5 17.4 39.9 8.1 39.9 8.1 30.6 1.5 24 8.1 17.4 8.1 8.1 17.4 8.1Z" fill="${C.brand}" />
    <path d="M17 33 L24 15 L31 33" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linejoin="round" opacity="0.95" />
    <path d="M24 20.5v2.5M24 26v2.5M24 31v2" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity="0.95" />
  </svg>`;
}

/**
 * الغلاف المشترك لكل رسائل الموقع — رأس بالعلامة، بطاقة، وتذييل.
 * هاد الطريقة أي إيميل جديد كيولد بنفس الهوية بلا ما نعاودو الكود.
 */
function emailShell(opts: { heading: string; bodyHtml: string; footer?: string }): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
</head>
<body style="margin:0;padding:28px 16px;background:${C.bg};font-family:${FONT}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;margin:0 auto">
    <tr><td style="padding:0 6px 18px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-right:0">
        <tr>
          <td style="padding-left:9px">${logoMarkSvg()}</td>
          <td style="text-align:right">
            <div style="font-size:18px;font-weight:800;color:${C.text};line-height:1.1">طريق</div>
            <div style="font-size:10px;letter-spacing:.18em;color:${C.dim};line-height:1.4">TRIQ</div>
          </td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:26px 24px">
      <div style="font-size:15.5px;font-weight:800;color:${C.text};text-align:right">${opts.heading}</div>
      ${opts.bodyHtml}
    </td></tr>
    <tr><td style="padding:18px 6px 0;text-align:center;font-size:11px;color:${C.dim}">
      ${opts.footer ?? "طريق — سوق السيارات والدراجات النارية المستعملة في المغرب"}
    </td></tr>
  </table>
</body></html>`;
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
    html: emailShell({
      heading: "رمز الدخول ديالك",
      bodyHtml: `
        <div style="margin-top:14px;background:${C.brandSoft};border:1px solid ${C.brandLine};border-radius:12px;padding:18px;text-align:center;direction:ltr">
          <span style="font-size:30px;font-weight:800;letter-spacing:.24em;color:${C.brand}">${spaced}</span>
        </div>
        <div style="margin-top:14px;font-size:12.5px;line-height:1.8;color:${C.muted};text-align:right">
          صالح <b style="color:${C.text}">${ttlMinutes}</b> دقائق. إلا ماطلبتيهش، تجاهل هاد الرسالة —
          حتى واحد ماقدر يدخل بلا هاد الرمز.
        </div>`,
    }),
  };
}

/** رسالة رمز دخول لوحة الإشراف — نفس القالب، مع تنبيه أمان واضح */
export function adminOtpMail(to: string, code: string, ttlMinutes: number): Mail {
  const spaced = code.split("").join(" ");
  return {
    to,
    subject: `رمز دخول الإشراف: ${code}`,
    text:
      `رمز دخول لوحة الإشراف ديال طريق: ${code}\n` +
      `صالح ${ttlMinutes} دقايق.\n\n` +
      `إلا ماشي نتا اللي طلبتيه، شي واحد عندو كلمة السر — بدّلها دابا.\n`,
    html: emailShell({
      heading: "رمز دخول لوحة الإشراف",
      bodyHtml: `
        <div style="margin-top:14px;background:${C.brandSoft};border:1px solid ${C.brandLine};border-radius:12px;padding:18px;text-align:center;direction:ltr">
          <span style="font-size:30px;font-weight:800;letter-spacing:.24em;color:${C.brand}">${spaced}</span>
        </div>
        <div style="margin-top:12px;font-size:12.5px;color:${C.muted};text-align:right">
          صالح <b style="color:${C.text}">${ttlMinutes}</b> دقايق.
        </div>
        <div style="margin-top:12px;background:${C.badSoft};border-radius:10px;padding:12px 14px;font-size:12px;line-height:1.8;color:${C.bad};text-align:right;font-weight:700">
          إلا ماشي نتا اللي طلبتيه، شي واحد عندو كلمة السر — بدّلها دابا.
        </div>`,
    }),
  };
}

/** إشعار رسالة التواصل — نفس القالب، وصلة للمستوى الداخلي مانخصّوش الزخرفة */
export function contactNotifyMail(opts: {
  to: string;
  topic: string;
  name: string;
  contact: string;
  message: string;
  replyTo?: string;
}): Mail {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return {
    to: opts.to,
    subject: `[طريق] ${opts.topic} — ${opts.name}`,
    replyTo: opts.replyTo,
    text: `الموضوع: ${opts.topic}\nالاسم: ${opts.name}\nالتواصل: ${opts.contact}\n\n${opts.message}`,
    html: emailShell({
      heading: "رسالة تواصل جديدة",
      bodyHtml: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;font-size:12.5px;color:${C.muted};text-align:right">
          <tr><td style="padding:3px 0"><b style="color:${C.text}">الموضوع:</b> ${esc(opts.topic)}</td></tr>
          <tr><td style="padding:3px 0"><b style="color:${C.text}">الاسم:</b> ${esc(opts.name)}</td></tr>
          <tr><td style="padding:3px 0"><b style="color:${C.text}">التواصل:</b> ${esc(opts.contact)}</td></tr>
        </table>
        <div style="margin-top:12px;background:${C.bg};border:1px solid ${C.line};border-radius:10px;padding:14px;font-size:12.5px;line-height:1.8;color:${C.text};text-align:right;white-space:pre-wrap">${esc(opts.message)}</div>`,
    }),
  };
}
