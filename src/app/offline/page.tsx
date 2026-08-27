import Link from "next/link";
import { Reset, WifiOff } from "@/components/icons";

export const metadata = { title: "بلا انترنت", robots: { index: false, follow: false } };

/**
 * الصفحة اللي كيوريها Service Worker ملي التطبيق مزاد للشاشة
 * الرئيسية والتيليفون بلا شبكة. مخزّنة فcache وقت التنصيب —
 * خاصها تبقى صفحة بسيطة بلا اعتماد على طلب شبكة جديد.
 */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span
        className="grid h-16 w-16 place-items-center rounded-2xl"
        style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
      >
        <WifiOff size={30} />
      </span>
      <h1 className="mt-5 text-2xl font-black">ماكاين انترنت</h1>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        التيليفون ديالك مقطوع عن الشبكة دابا. تأكّد من الواي-فاي ولا بيانات
        الهاتف، وعاود المحاولة.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <a href="/" className="btn btn-primary"><Reset size={16} /> عاود المحاولة</a>
        <Link href="/" className="btn btn-ghost">الصفحة الرئيسية</Link>
      </div>
    </div>
  );
}
