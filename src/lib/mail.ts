import "server-only";
import { formatDh, formatNumber } from "./format";

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

/**
 * إرسال «هادئ» لإشعارات الأحداث.
 *
 * الفرق على send(): هادي عمرها ماترمي ولا تخلّي العملية الأصلية
 * تطيح. رسالة ماوصلاتش ماخاصهاش تمنع المحادثة ولا الموعد من
 * التسجيل — الإشعار الداخلي هو المصدر الأساسي، والإيميل زيادة.
 */
export async function sendQuiet(mail: Mail): Promise<void> {
  if (!mailConfigured()) return;
  try {
    const r = await send(mail);
    if (!r.ok) console.error(`[mail] إشعار ماتصيفطش لـ${mail.to}: ${r.error}`);
  } catch (e) {
    console.error("[mail] إشعار طاح:", e);
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

/** تهريب النص ديال المستخدم — أي نص كيدخل فـHTML كيدوز من هنا */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * سطر واحد لعنوان الرسالة (subject).
 *
 * العنوان هو رأس (header) ديال الإيميل. مزوّدينا كيمرّرو JSON
 * فكيهرّبو وحدهم، ولكن أي نص ديال المستخدم كيدخل فرأس خاصو يبقى
 * سطراً واحداً — حماية زائدة بلا تكلفة.
 */
const oneLine = (s: string, max = 90) =>
  s.replace(/[\r\n\t]+/g, " ").trim().slice(0, max);

/**
 * جذر الموقع للروابط المطلقة.
 *
 * الإيميل ماكيقدرش يستعمل روابط نسبية — خاصو النطاق كامل. نفس
 * القيمة ديال sitemap.ts وrobots.ts، مع إمكانية تبديلها فالبيئة
 * (مفيد للتجريب على نطاق مؤقت ديال Vercel).
 */
const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || "https://tariqmaroc.com").replace(/\/+$/, "");

/** رابط مطلق من مسار داخلي: "/messages" → "https://tariqmaroc.com/messages" */
const abs = (path: string) => `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * زر CTA — جدول ماشي <a> مصفّف.
 *
 * Outlook لسطح المكتب كيتجاهل padding على <a>، فالزر كيولّي نص
 * عادي. الجدول بـbgcolor هو الطريقة الوحيدة اللي كتخدم فكل مكان.
 */
function ctaButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px auto 0">
    <tr><td bgcolor="${C.brand}" style="border-radius:10px">
      <a href="${href}" style="display:inline-block;padding:11px 26px;font-family:${FONT};font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px">${label}</a>
    </td></tr>
  </table>`;
}

/** سطر معلومة: «التسمية: القيمة» بمحاذاة يمين */
const infoRow = (label: string, value: string) =>
  `<tr><td style="padding:3px 0"><b style="color:${C.text}">${label}:</b> ${esc(value)}</td></tr>`;

/**
 * ثمن بالدرهم معزول اتجاهياً.
 *
 * «95 000» فيها فراغ بين رقمين. فسياق RTL، خوارزمية bidi كتعتبر
 * داك الفراغ محايداً بين عددين فكتقلب الترتيب: «000 95» — ثمن
 * غالط بالكامل. نفس العزل اللي كتدير .num فـglobals.css.
 */
const dh = (n: number) =>
  `<span dir="ltr" style="unicode-bidi:isolate">${formatNumber(n)}</span> د.م`;

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
  return {
    to: opts.to,
    subject: `[طريق] ${opts.topic} — ${opts.name}`,
    replyTo: opts.replyTo,
    text: `الموضوع: ${opts.topic}\nالاسم: ${opts.name}\nالتواصل: ${opts.contact}\n\n${opts.message}`,
    html: emailShell({
      heading: "رسالة تواصل جديدة",
      bodyHtml: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;font-size:12.5px;color:${C.muted};text-align:right">
          ${infoRow("الموضوع", opts.topic)}
          ${infoRow("الاسم", opts.name)}
          ${infoRow("التواصل", opts.contact)}
        </table>
        <div style="margin-top:12px;background:${C.bg};border:1px solid ${C.line};border-radius:10px;padding:14px;font-size:12.5px;line-height:1.8;color:${C.text};text-align:right;white-space:pre-wrap">${esc(opts.message)}</div>`,
    }),
  };
}

/* ============================================================
   إشعارات الأحداث

   هاد الرسائل كتتصيفط مع الإشعار الداخلي — ماشي بدلو. المستخدم
   اللي ماشي فالموقع دابا خاصو يعرف أنّ شي حد كيسناه، وإلا الإعلان
   كيموت بلا جواب.

   كل وحدة فيهم عندها رابط مطلق: الإيميل ماكيعرفش النطاق ديالنا.
   ============================================================ */

/** رسالة جديدة فمحادثة إعلان */
export function newMessageMail(opts: {
  to: string;
  /** اسم اللي صيفط */
  fromName: string;
  /** «Dacia Logan 2018» — باش يعرف على أي إعلان */
  listingTitle: string;
  /** أول سطور الرسالة */
  preview: string;
}): Mail {
  const url = abs("/messages");
  return {
    to: opts.to,
    subject: oneLine(`رسالة جديدة من ${opts.fromName} — ${opts.listingTitle}`),
    text:
      `${opts.fromName} صيفط ليك رسالة على «${opts.listingTitle}»:\n\n` +
      `${opts.preview}\n\nجاوب من هنا: ${url}\n`,
    html: emailShell({
      heading: "عندك رسالة جديدة",
      bodyHtml: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;font-size:12.5px;color:${C.muted};text-align:right">
          ${infoRow("من", opts.fromName)}
          ${infoRow("على الإعلان", opts.listingTitle)}
        </table>
        <div style="margin-top:12px;background:${C.bg};border:1px solid ${C.line};border-radius:10px;padding:14px;font-size:12.5px;line-height:1.8;color:${C.text};text-align:right;white-space:pre-wrap">${esc(opts.preview)}</div>
        ${ctaButton("جاوب على الرسالة", url)}
        <div style="margin-top:14px;font-size:11px;color:${C.dim};text-align:right">
          غادي نصيفطو ليك إيميل واحد غير ملي تكون عندك رسائل ماقريتيهاش —
          ماشي فكل رسالة.
        </div>`,
    }),
  };
}

/** الثمن هبط على إعلان فالمفضّلة (مع تفعيل مراقبة الثمن) */
export function priceDropMail(opts: {
  to: string;
  listingTitle: string;
  oldPrice: number;
  newPrice: number;
  /** slug ديال الإعلان */
  slug: string;
}): Mail {
  const url = abs(`/vehicle/${opts.slug}`);
  const saved = opts.oldPrice - opts.newPrice;
  return {
    to: opts.to,
    subject: oneLine(`الثمن هبط: ${opts.listingTitle} — ${formatDh(opts.newPrice)}`),
    text:
      `إعلان كتراقب هبط ثمنو.\n\n` +
      `${opts.listingTitle}\n` +
      `من ${formatDh(opts.oldPrice)} إلى ${formatDh(opts.newPrice)} ` +
      `(أقل بـ${formatDh(saved)})\n\n${url}\n`,
    html: emailShell({
      heading: "الثمن هبط على إعلان كتراقب",
      bodyHtml: `
        <div style="margin-top:14px;font-size:13.5px;font-weight:700;color:${C.text};text-align:right">${esc(opts.listingTitle)}</div>
        <div style="margin-top:12px;background:${C.brandSoft};border:1px solid ${C.brandLine};border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:12px;color:${C.muted};text-decoration:line-through">${dh(opts.oldPrice)}</div>
          <div style="margin-top:4px;font-size:24px;font-weight:800;color:${C.brand}">${dh(opts.newPrice)}</div>
          <div style="margin-top:6px;font-size:12px;font-weight:700;color:${C.text}">أقل بـ${dh(saved)}</div>
        </div>
        ${ctaButton("شوف الإعلان", url)}
        <div style="margin-top:14px;font-size:11px;color:${C.dim};text-align:right">
          كتوصلك هاد الرسالة حيت فعّلتي مراقبة الثمن على هاد الإعلان فالمفضّلة.
        </div>`,
    }),
  };
}

/** طلب موعد معاينة من مشتري */
export function appointmentRequestMail(opts: {
  to: string;
  listingTitle: string;
  /** التاريخ والوقت مكتوبين بالعربية */
  when: string;
  place?: string | null;
}): Mail {
  const url = abs("/dashboard/appointments");
  return {
    to: opts.to,
    subject: oneLine(`طلب موعد معاينة — ${opts.listingTitle}`),
    text:
      `شي حد بغى يشوف «${opts.listingTitle}».\n\n` +
      `الوقت المقترح: ${opts.when}\n` +
      (opts.place ? `البلاصة: ${opts.place}\n` : "") +
      `\nأكّد ولا اقترح وقت آخر: ${url}\n`,
    html: emailShell({
      heading: "طلب موعد معاينة",
      bodyHtml: `
        <div style="margin-top:14px;font-size:12.5px;line-height:1.8;color:${C.muted};text-align:right">
          شي حد بغى يشوف المركبة ديالك.
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;font-size:12.5px;color:${C.muted};text-align:right">
          ${infoRow("الإعلان", opts.listingTitle)}
          ${infoRow("الوقت المقترح", opts.when)}
          ${opts.place ? infoRow("البلاصة", opts.place) : ""}
        </table>
        ${ctaButton("أكّد الموعد", url)}
        <div style="margin-top:14px;background:${C.badSoft};border-radius:10px;padding:12px 14px;font-size:11.5px;line-height:1.8;color:${C.bad};text-align:right;font-weight:700">
          تلاقاو فبلاصة عامة ونهاراً. ماتقبلش عربون قبل المعاينة.
        </div>`,
    }),
  };
}

/** نتيجة مراجعة توثيق الهوية — مقبول ولا مرفوض */
export function verificationResultMail(opts: {
  to: string;
  approved: boolean;
  /** سبب الرفض — كيبان غير ملي يكون الرفض */
  note?: string | null;
}): Mail {
  const url = abs("/dashboard/trust");

  if (opts.approved) {
    return {
      to: opts.to,
      subject: "تّوثق حسابك فطريق",
      text:
        `تّوثق حسابك فطريق.\n\n` +
        `شارة «حساب موثق» كتبان دابا فكل إعلاناتك، ومؤشر الثقة ديالك تزاد.\n\n${url}\n`,
      html: emailShell({
        heading: "تّوثق حسابك",
        bodyHtml: `
          <div style="margin-top:14px;font-size:12.5px;line-height:1.8;color:${C.muted};text-align:right">
            راجعنا الوثيقة ديالك وتّقبلات. من دابا:
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;font-size:12.5px;line-height:1.9;color:${C.muted};text-align:right">
            <tr><td>· شارة <b style="color:${C.text}">«حساب موثق»</b> كتبان فكل إعلاناتك.</td></tr>
            <tr><td>· مؤشر الثقة ديال حسابك تزاد.</td></tr>
            <tr><td>· المشترين كيثقو أكثر فالإعلانات الموثّقة.</td></tr>
          </table>
          ${ctaButton("شوف مركز الثقة", url)}`,
      }),
    };
  }

  return {
    to: opts.to,
    subject: "طلب التوثيق ديالك محتاج تصحيح",
    text:
      `ماقدرناش نقبلو طلب التوثيق ديالك.\n` +
      (opts.note ? `السبب: ${opts.note}\n` : "") +
      `\nتقدّر تعاود تصيفط وثيقة أوضح من هنا: ${url}\n`,
    html: emailShell({
      heading: "طلب التوثيق محتاج تصحيح",
      bodyHtml: `
        <div style="margin-top:14px;font-size:12.5px;line-height:1.8;color:${C.muted};text-align:right">
          راجعنا الوثيقة ديالك وماقدرناش نقبلوها هاد المرة.
        </div>
        ${
          opts.note
            ? `<div style="margin-top:12px;background:${C.badSoft};border-radius:10px;padding:12px 14px;font-size:12.5px;line-height:1.8;color:${C.bad};text-align:right"><b>السبب:</b> ${esc(opts.note)}</div>`
            : ""
        }
        <div style="margin-top:12px;font-size:12.5px;line-height:1.8;color:${C.muted};text-align:right">
          التوثيق اختياري — حسابك مازال خدّام عادي. إلا بغيتي تعاود، صوّر
          الوثيقة بضو مزيان وبلا ما يتقطع شي طرف.
        </div>
        ${ctaButton("عاود صيفط الوثيقة", url)}`,
    }),
  };
}
