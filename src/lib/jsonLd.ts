/**
 * JSON آمن للحقن كـ<script type="application/ld+json"> عبر
 * dangerouslySetInnerHTML — كنهربو `<` باش نص مستخدم (وصف الإعلان،
 * اسم المعرض، النسخة...) ما يقدرش يسكّر الوسم ويحقن
 * `</script><script>…</script>`. JSON.stringify وحدها ماكتهربش `<`.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
