"use client";

/**
 * نداء موحّد لإجراءات الإشراف.
 * كيرجع رسالة الخطأ ولا null ملي ينجح — كل لوحة كتقرّر شنو
 * تدير بيها.
 */
export async function adminAction(payload: Record<string, string | null>): Promise<string | null> {
  try {
    const res = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return json?.ok ? null : (json?.error ?? "ماقدرناش.");
  } catch {
    return "الشبكة قاطعة.";
  }
}
