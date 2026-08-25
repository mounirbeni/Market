import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/Shell";
import { DashboardSettings } from "@/components/dashboard/Settings";

export const metadata: Metadata = { title: "الإعدادات", robots: { index: false, follow: false } };

export default function SettingsPage() {
  return (
    <DashboardShell title="الإعدادات">
      <DashboardSettings />
    </DashboardShell>
  );
}
