import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/Shell";
import { MessagesClient } from "@/components/MessagesClient";

export const metadata: Metadata = { title: "الرسائل", robots: { index: false, follow: false } };

export default function DashboardMessagesPage() {
  return (
    <DashboardShell title="الرسائل">
      <MessagesClient />
    </DashboardShell>
  );
}
