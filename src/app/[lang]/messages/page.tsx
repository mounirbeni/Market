import type { Metadata } from "next";
import { MessagesClient } from "@/components/MessagesClient";
import { Message } from "@/components/icons";

export const metadata: Metadata = {
  title: "الرسائل",
  robots: { index: false, follow: false },
};

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <header className="mb-7">
        <span className="eyebrow"><Message size={13} /> تواصل آمن</span>
        <h1 className="h-page mt-3">الرسائل</h1>
      </header>
      <MessagesClient />
    </div>
  );
}
