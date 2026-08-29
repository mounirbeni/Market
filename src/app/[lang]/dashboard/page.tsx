import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/Shell";
import { DashboardOverview } from "@/components/dashboard/Overview";

export const metadata: Metadata = {
  title: "لوحة القيادة",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <DashboardShell title="لوحة القيادة">
      <DashboardOverview />
    </DashboardShell>
  );
}
