import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/Shell";
import { EditListing } from "@/components/dashboard/EditListing";

export const metadata: Metadata = {
  title: "تعديل إعلان",
  robots: { index: false, follow: false },
};

export default async function EditListingPage({
  params,
}: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return (
    <DashboardShell title="تعديل إعلان">
      <EditListing listingRef={ref} />
    </DashboardShell>
  );
}
