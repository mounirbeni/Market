/**
 * يعرض نصاً مختلطاً (عربي + أرقام) بحيث تأخذ الأرقام فقط الخط اللاتيني.
 * بدون هذا، تطبيق خط الأرقام على النص كاملاً يكسر تشكيل الحروف العربية.
 */
const TOKEN = /(\d[\d\s.,/:-]*\d|\d)/g;

export function Mixed({ text, className }: { text: string | number; className?: string }) {
  const str = String(text);
  const parts = str.split(TOKEN).filter((p) => p !== "");
  return (
    <span className={className}>
      {parts.map((p, i) =>
        /\d/.test(p) ? (
          <span key={i} className="num">{p}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}
