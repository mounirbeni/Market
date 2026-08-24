import type { Metadata } from "next";
import { FavoritesClient } from "@/components/FavoritesClient";

export const metadata: Metadata = {
  title: "مفضلتي وبحوثي",
  description: "المركبات اللي حفظتي والبحوث اللي سجّلتي في مكان واحد.",
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <FavoritesClient />
    </div>
  );
}
