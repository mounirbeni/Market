import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span className="num text-6xl font-black" style={{ color: "var(--accent)" }}>404</span>
      <h1 className="mt-4 text-2xl font-black">ضاعت عليك الطريق</h1>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        الصفحة اللي كتقلّب عليها ماكايناش، ولا الإعلان تباع وتحيّد. جرّب تبدا من السوق.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/vehicles" className="btn btn-primary">تصفح المركبات</Link>
        <Link href="/" className="btn btn-ghost">الصفحة الرئيسية</Link>
      </div>
    </div>
  );
}
