import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/Shell";
import { DashboardAppointments } from "@/components/dashboard/Appointments";

export const metadata: Metadata = { title: "المواعيد", robots: { index: false, follow: false } };

export default function AppointmentsPage() {
  return (
    <DashboardShell title="مواعيد المعاينة">
      <DashboardAppointments />
    </DashboardShell>
  );
}
