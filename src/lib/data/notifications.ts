export interface AppNotification {
  id: string;
  type: "message" | "price-drop" | "listing" | "appointment" | "system";
  title: string;
  body: string;
  href: string;
  at: string;
}

/** إشعارات تجريبية — فالنسخة الكاملة كتجي من الخادم */
export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "message",
    title: "رسالة جديدة من يوسف الإدريسي",
    body: "سلام، واش الطوموبيل مازال متوفرة؟ يمكن نجي نشوفها غدا الصباح.",
    href: "/messages",
    at: "2026-08-24T08:35:00Z",
  },
  {
    id: "n2",
    type: "price-drop",
    title: "انخفض ثمن مركبة محفوظة",
    body: "Renault Clio 4 — نقص 6 000 د.م ووصل لـ118 000 د.م.",
    href: "/favorites",
    at: "2026-08-23T17:10:00Z",
  },
  {
    id: "n3",
    type: "listing",
    title: "إعلانك تمت الموافقة عليه",
    body: "Dacia Duster 2018 ولّى ظاهر فنتائج البحث.",
    href: "/dashboard/listings",
    at: "2026-08-23T09:00:00Z",
  },
  {
    id: "n4",
    type: "appointment",
    title: "طلب موعد معاينة",
    body: "سناء م. طلبات موعد نهار السبت على 11:00 لمعاينة Volkswagen Golf 7.",
    href: "/dashboard/appointments",
    at: "2026-08-22T14:20:00Z",
  },
  {
    id: "n5",
    type: "system",
    title: "توثيق الهوية اكتمل",
    body: "الحساب ديالك ولّى موثقاً — إعلاناتك غادي تاخد نقطة ثقة أعلى.",
    href: "/dashboard/settings",
    at: "2026-08-20T11:05:00Z",
  },
  {
    id: "n6",
    type: "price-drop",
    title: "مركبات جديدة فبحث محفوظ",
    body: "3 مركبات جديدة كتطابق «سيارات ديزل تحت 13 مليون فكازا».",
    href: "/favorites",
    at: "2026-08-19T07:45:00Z",
  },
];
