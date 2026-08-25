export interface ChatMessage {
  from: "me" | "them";
  text: string;
  at: string;
}

export interface Thread {
  id: string;
  person: string;
  role: "مشترٍ" | "بائع";
  vehicleId: string;
  unread: number;
  messages: ChatMessage[];
}

/** محادثات تجريبية */
export const THREADS: Thread[] = [
  {
    id: "t1",
    person: "يوسف الإدريسي",
    role: "مشترٍ",
    vehicleId: "c003",
    unread: 2,
    messages: [
      { from: "them", text: "سلام، واش الطوموبيل مازال متوفرة؟", at: "2026-08-24T08:20:00Z" },
      { from: "me", text: "سلام، إيه مازال متوفرة.", at: "2026-08-24T08:26:00Z" },
      { from: "them", text: "شحال آخر ثمن؟ وواش الوثائق كاملة؟", at: "2026-08-24T08:31:00Z" },
      { from: "them", text: "يمكن نجي نشوفها غدا الصباح إلا مزيان.", at: "2026-08-24T08:35:00Z" },
    ],
  },
  {
    id: "t2",
    person: "سناء م.",
    role: "مشترٍ",
    vehicleId: "c017",
    unread: 0,
    messages: [
      { from: "them", text: "مساء الخير، الگولف واش فيها شي صباغة؟", at: "2026-08-22T18:02:00Z" },
      { from: "me", text: "لا، كلها صباغة الأصل. عندي تقرير الفحص إلا بغيتي نصيفطو ليك.", at: "2026-08-22T18:15:00Z" },
      { from: "them", text: "إيه عافاك صيفطو. ونتفقو على موعد المعاينة.", at: "2026-08-22T18:20:00Z" },
      { from: "me", text: "مرحبا، صيفطتو ليك. السبت على 11:00 مناسب؟", at: "2026-08-22T18:40:00Z" },
    ],
  },
  {
    id: "t3",
    person: "كراج الأطلس",
    role: "بائع",
    vehicleId: "c026",
    unread: 1,
    messages: [
      { from: "me", text: "سلام، واش Kia Sportage مازال متوفر؟", at: "2026-08-21T10:10:00Z" },
      { from: "them", text: "سلام، إيه متوفر. الثمن 242 000 قابل للنقاش الخفيف.", at: "2026-08-21T10:32:00Z" },
      { from: "them", text: "تقدر تجي تشوفو أي يوم من 9 حتى 8 ديال العشية.", at: "2026-08-21T10:33:00Z" },
    ],
  },
];
