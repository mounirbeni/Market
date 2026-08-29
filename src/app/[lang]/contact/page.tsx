import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { Clock, MapPin, Message, Phone, ShieldAlert } from "@/components/icons";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: "تواصل مع فريق طريق: أسئلة، تبليغ عن إعلان، أو شراكة مع معرضك.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12">
      <header className="mb-9 max-w-2xl">
        <span className="eyebrow"><Message size={13} /> نحن هنا</span>
        <h1 className="h-page mt-3">اتصل بنا</h1>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          عندك سؤال، ولا لقيتي إعلاناً مشبوهاً، ولا بغيتي تسجّل معرضك؟ صيفط لينا رسالة.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ContactForm />

        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="text-[13px] font-bold">معلومات التواصل</h2>
            <ul className="mt-3 space-y-3 text-[12px]">
              <li className="flex gap-2.5">
                <Phone size={15} className="mt-0.5 shrink-0" style={{ color: "var(--text-dim)" }} />
                <span style={{ color: "var(--text-muted)" }}>
                  <span className="num" dir="ltr">05 22 00 00 00</span>
                </span>
              </li>
              <li className="flex gap-2.5">
                <Clock size={15} className="mt-0.5 shrink-0" style={{ color: "var(--text-dim)" }} />
                <span style={{ color: "var(--text-muted)" }}>الإثنين ـ الجمعة · 9:00 — 18:00</span>
              </li>
              <li className="flex gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: "var(--text-dim)" }} />
                <span style={{ color: "var(--text-muted)" }}>الدار البيضاء، المغرب</span>
              </li>
            </ul>
          </section>

          <section className="card p-5" style={{ background: "var(--bad-soft)" }}>
            <h2 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--bad)" }}>
              <ShieldAlert size={15} /> بلّغ عن نصب
            </h2>
            <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              إلا لقيتي إعلاناً كذاباً ولا بائعاً كيطلب عربوناً قبل المعاينة، بلّغ عليه فوراً.
              كنراجعو كل تبليغ داخل 24 ساعة.
            </p>
            <Link href="/safety" className="btn btn-solid btn-sm mt-3 w-full">دليل البيع الآمن</Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
