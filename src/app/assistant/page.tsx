import type { Metadata } from "next";
import { AssistantClient } from "@/components/AssistantClient";

export const metadata: Metadata = {
  title: "مساعد اختيار المركبة",
  description:
    "جاوب على 5 أسئلة بسيطة — الميزانية، المدينة، عدد الأشخاص، الاستعمال — ونقترحو عليك المركبات اللي كتناسبك فعلاً من السوق المغربي.",
  alternates: { canonical: "/assistant" },
};

export default function AssistantPage() {
  return <AssistantClient />;
}
