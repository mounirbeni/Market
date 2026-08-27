import { body, fail, ok } from "@/lib/api";
import { mailConfigured, send } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ============================================================
   نموذج الاتصال

   كان كيبيّن «توصلنا برسالتك» بلا ما يصيفط والو. دابا الرسالة
   كتوصل بالإيميل لصاحب الموقع (CONTACT_EMAIL، وإلا EMAIL_FROM).
   ============================================================ */

const TOPICS = [
  "سؤال عام",
  "مشكل فإعلان",
  "التبليغ عن نصب",
  "شراكة أو معرض",
  "اقتراح تحسين",
];

const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inbox(): string | null {
  const raw = process.env.CONTACT_EMAIL || process.env.EMAIL_FROM || "";
  const m = raw.match(/<([^>]+)>/);
  const addr = (m ? m[1] : raw).trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr) ? addr : null;
}

export async function POST(req: Request) {
  const b = await body<Record<string, unknown>>(req);

  const name = clean(b?.name, 80);
  const contact = clean(b?.contact, 120);
  const message = clean(b?.message, 4000);
  const topic = TOPICS.includes(clean(b?.topic, 40)) ? clean(b?.topic, 40) : TOPICS[0];

  if (!name || !contact || message.length < 10)
    return fail("عمّر الاسم والتواصل ورسالة على الأقل 10 حروف.");

  const to = inbox();
  if (!mailConfigured() || !to) {
    console.error("[contact] الإيميل ماشي مضبوط — الرسالة ماتصيفطاتش.");
    return fail("إرسال الرسائل ماشي مضبوط فهاد الموقع دابا. جرّب من بعد.", 503);
  }

  const text = `الموضوع: ${topic}\nالاسم: ${name}\nالتواصل: ${contact}\n\n${message}`;
  const sent = await send({
    to,
    subject: `[طريق] ${topic} — ${name}`,
    // كنخلّيو المرسل ديالنا: مزوّدي البريد كيرفضو عناوين ماشي موثقة
    replyTo: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact) ? contact : undefined,
    text,
    html: `<div dir="rtl" style="font-family:system-ui,sans-serif;line-height:1.7">
      <p><b>الموضوع:</b> ${esc(topic)}</p>
      <p><b>الاسم:</b> ${esc(name)}</p>
      <p><b>التواصل:</b> ${esc(contact)}</p>
      <hr><p style="white-space:pre-wrap">${esc(message)}</p>
    </div>`,
  });

  if (!sent.ok) return fail("ماقدرناش نصيفطو الرسالة. عاود المحاولة.", 502);
  return ok({ sent: true });
}
