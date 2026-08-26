import "server-only";

/* ============================================================
   إرسال الإيميل

   مزوّد واحد دابا (Resend) عبر HTTP مباشرة — بلا SDK، باش
   نبقاو على نفس المبدأ ديال المشروع: أقل ما يمكن من التبعيات.

   زيادة مزوّد آخر = حالة جديدة فـsend() بلا ما يتبدّل أي شي آخر.
   ============================================================ */

export const mailProvider = () => process.env.EMAIL_PROVIDER?.trim().toLowerCase() ?? "";
export const mailConfigured = () =>
  mailProvider() === "resend" && Boolean(process.env.RESEND_API_KEY);

/** المُرسِل — خاصو يكون نطاق موثّق عند المزوّد */
const from = () => process.env.EMAIL_FROM?.trim() || "طريق <onboarding@resend.dev>";

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
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

export async function send(mail: Mail): Promise<SendResult> {
  switch (mailProvider()) {
    case "resend":
      if (!process.env.RESEND_API_KEY)
        return { ok: false, error: "RESEND_API_KEY ناقص." };
      return sendResend(mail);
    default:
      return { ok: false, error: "مزوّد الإيميل ماشي مضبوط." };
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
