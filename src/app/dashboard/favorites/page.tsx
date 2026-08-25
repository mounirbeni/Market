import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/Shell";
import { FavoritesClient } from "@/components/FavoritesClient";

export const metadata: Metadata = { title: "المفضلة", robots: { index: false, follow: false } };

export default function DashboardFavoritesPage() {
  return (
    <DashboardShell title="المفضلة والتنبيهات">
      <FavoritesClient />
    </DashboardShell>
  );
}
