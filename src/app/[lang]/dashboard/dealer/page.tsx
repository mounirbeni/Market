import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/Shell";
import { DealerProfileForm } from "@/components/dashboard/DealerProfile";

export const metadata: Metadata = {
  title: "المعرض ديالي",
  robots: { index: false, follow: false },
};

export default function DealerPage() {
  return (
    <DashboardShell title="المعرض ديالي">
      <DealerProfileForm />
    </DashboardShell>
  );
}
