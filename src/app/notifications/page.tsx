import type { Metadata } from "next";
import { NotificationsClient } from "@/components/NotificationsClient";
import { Bell } from "@/components/icons";

export const metadata: Metadata = {
  title: "الإشعارات",
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-[820px] px-4 py-10">
      <header className="mb-7">
        <span className="eyebrow"><Bell size={13} /> تنبيهاتك</span>
        <h1 className="h-page mt-3">الإشعارات</h1>
      </header>
      <NotificationsClient />
    </div>
  );
}
