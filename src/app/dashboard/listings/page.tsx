import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/Shell";
import { DashboardListings } from "@/components/dashboard/Listings";

export const metadata: Metadata = { title: "إعلاناتي", robots: { index: false, follow: false } };

export default function ListingsPage() {
  return (
    <DashboardShell title="إعلاناتي">
      <DashboardListings />
    </DashboardShell>
  );
}
