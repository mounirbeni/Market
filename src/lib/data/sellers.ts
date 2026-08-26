import type { Seller } from "@/lib/types";

export const SELLERS: Seller[] = [
  { id: "s01", name: "أوطو بلاص كازا", type: "professionnel", city: "casablanca", since: 2014, idVerified: true, phoneVerified: true, rating: 4.7, salesCount: 412, responseMinutes: 12 },
  { id: "s02", name: "كراج الأطلس", type: "professionnel", city: "marrakech", since: 2016, idVerified: true, phoneVerified: true, rating: 4.5, salesCount: 268, responseMinutes: 25 },
  { id: "s03", name: "منير ب.", type: "particulier", city: "rabat", since: 2021, idVerified: true, phoneVerified: true, rating: 4.9, salesCount: 3, responseMinutes: 40 },
  { id: "s04", name: "سيارات الشمال", type: "professionnel", city: "tanger", since: 2012, idVerified: true, phoneVerified: true, rating: 4.3, salesCount: 590, responseMinutes: 18 },
  { id: "s05", name: "يوسف الإدريسي", type: "particulier", city: "fes", since: 2022, idVerified: false, phoneVerified: true, rating: 4.6, salesCount: 1, responseMinutes: 90 },
  { id: "s06", name: "أوطو سوس", type: "professionnel", city: "agadir", since: 2018, idVerified: true, phoneVerified: true, rating: 4.4, salesCount: 187, responseMinutes: 30 },
  { id: "s07", name: "سناء م.", type: "particulier", city: "casablanca", since: 2020, idVerified: true, phoneVerified: true, rating: 5.0, salesCount: 2, responseMinutes: 22 },
  { id: "s08", name: "موتور هاوس", type: "professionnel", city: "casablanca", since: 2017, idVerified: true, phoneVerified: true, rating: 4.8, salesCount: 96, responseMinutes: 15 },
  { id: "s09", name: "عبد الرحيم ح.", type: "particulier", city: "meknes", since: 2023, idVerified: false, phoneVerified: true, rating: 4.1, salesCount: 1, responseMinutes: 140 },
  { id: "s10", name: "الرحمة كار", type: "professionnel", city: "oujda", since: 2019, idVerified: true, phoneVerified: true, rating: 4.2, salesCount: 143, responseMinutes: 45 },
  { id: "s11", name: "خديجة ل.", type: "particulier", city: "kenitra", since: 2019, idVerified: true, phoneVerified: true, rating: 4.8, salesCount: 4, responseMinutes: 35 },
  { id: "s12", name: "بريميوم موتورز", type: "professionnel", city: "rabat", since: 2015, idVerified: true, phoneVerified: true, rating: 4.6, salesCount: 331, responseMinutes: 10 },
  { id: "s13", name: "حمزة ر.", type: "particulier", city: "tetouan", since: 2024, idVerified: true, phoneVerified: false, rating: 4.0, salesCount: 0, responseMinutes: 180 },
  { id: "s14", name: "بايك ستور", type: "professionnel", city: "casablanca", since: 2020, idVerified: true, phoneVerified: true, rating: 4.7, salesCount: 121, responseMinutes: 20 },
  { id: "s15", name: "إلياس ن.", type: "particulier", city: "safi", since: 2022, idVerified: true, phoneVerified: true, rating: 4.5, salesCount: 2, responseMinutes: 60 },
  { id: "s16", name: "أوطو ديل الجنوب", type: "professionnel", city: "laayoune", since: 2018, idVerified: true, phoneVerified: true, rating: 4.1, salesCount: 88, responseMinutes: 70 },
];

/** بائع محايد ملي المعرّف ماشي من البيانات المرفقة (مثلاً UUID من قاعدة البيانات) */
const UNKNOWN_SELLER: Seller = {
  id: "unknown", name: "بائع", type: "particulier", city: "casablanca",
  since: 2020, idVerified: false, phoneVerified: false,
  rating: 4, salesCount: 0, responseMinutes: 60,
};

export const sellerById = (id: string): Seller =>
  SELLERS.find((s) => s.id === id) ?? UNKNOWN_SELLER;
