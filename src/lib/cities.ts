export interface City {
  slug: string;
  ar: string;
  fr: string;
  region: string;
  /** أسماء دارجة/بديلة للبحث الذكي */
  aliases: string[];
  lat: number;
  lng: number;
}

export const CITIES: City[] = [
  { slug: "casablanca", ar: "الدار البيضاء", fr: "Casablanca", region: "الدار البيضاء ـ سطات", aliases: ["كازا", "كازابلانكا", "البيضا", "casa", "casablanca", "dar lbida"], lat: 33.573, lng: -7.59 },
  { slug: "rabat", ar: "الرباط", fr: "Rabat", region: "الرباط ـ سلا ـ القنيطرة", aliases: ["رباط", "rabat"], lat: 34.02, lng: -6.84 },
  { slug: "marrakech", ar: "مراكش", fr: "Marrakech", region: "مراكش ـ آسفي", aliases: ["مراكش", "marrakech", "marrakch"], lat: 31.63, lng: -7.99 },
  { slug: "fes", ar: "فاس", fr: "Fès", region: "فاس ـ مكناس", aliases: ["فاس", "fes", "fès"], lat: 34.03, lng: -5.0 },
  { slug: "tanger", ar: "طنجة", fr: "Tanger", region: "طنجة ـ تطوان ـ الحسيمة", aliases: ["طنجة", "طنجا", "tanger", "tanja"], lat: 35.77, lng: -5.8 },
  { slug: "agadir", ar: "أكادير", fr: "Agadir", region: "سوس ـ ماسة", aliases: ["اكادير", "أكادير", "agadir"], lat: 30.42, lng: -9.6 },
  { slug: "meknes", ar: "مكناس", fr: "Meknès", region: "فاس ـ مكناس", aliases: ["مكناس", "meknes"], lat: 33.9, lng: -5.55 },
  { slug: "oujda", ar: "وجدة", fr: "Oujda", region: "الشرق", aliases: ["وجدة", "oujda"], lat: 34.68, lng: -1.9 },
  { slug: "kenitra", ar: "القنيطرة", fr: "Kénitra", region: "الرباط ـ سلا ـ القنيطرة", aliases: ["القنيطرة", "قنيطرة", "kenitra"], lat: 34.26, lng: -6.58 },
  { slug: "tetouan", ar: "تطوان", fr: "Tétouan", region: "طنجة ـ تطوان ـ الحسيمة", aliases: ["تطوان", "tetouan"], lat: 35.57, lng: -5.37 },
  { slug: "safi", ar: "آسفي", fr: "Safi", region: "مراكش ـ آسفي", aliases: ["اسفي", "آسفي", "safi"], lat: 32.3, lng: -9.24 },
  { slug: "el-jadida", ar: "الجديدة", fr: "El Jadida", region: "الدار البيضاء ـ سطات", aliases: ["الجديدة", "jadida"], lat: 33.25, lng: -8.5 },
  { slug: "beni-mellal", ar: "بني ملال", fr: "Béni Mellal", region: "بني ملال ـ خنيفرة", aliases: ["بني ملال", "beni mellal"], lat: 32.34, lng: -6.36 },
  { slug: "nador", ar: "الناظور", fr: "Nador", region: "الشرق", aliases: ["الناظور", "ناظور", "nador"], lat: 35.17, lng: -2.93 },
  { slug: "mohammedia", ar: "المحمدية", fr: "Mohammedia", region: "الدار البيضاء ـ سطات", aliases: ["المحمدية", "mohammedia"], lat: 33.69, lng: -7.38 },
  { slug: "sale", ar: "سلا", fr: "Salé", region: "الرباط ـ سلا ـ القنيطرة", aliases: ["سلا", "sale", "salé"], lat: 34.05, lng: -6.8 },
  { slug: "temara", ar: "تمارة", fr: "Témara", region: "الرباط ـ سلا ـ القنيطرة", aliases: ["تمارة", "temara"], lat: 33.93, lng: -6.91 },
  { slug: "settat", ar: "سطات", fr: "Settat", region: "الدار البيضاء ـ سطات", aliases: ["سطات", "settat"], lat: 33.0, lng: -7.62 },
  { slug: "laayoune", ar: "العيون", fr: "Laâyoune", region: "العيون ـ الساقية الحمراء", aliases: ["العيون", "laayoune"], lat: 27.15, lng: -13.2 },
  { slug: "dakhla", ar: "الداخلة", fr: "Dakhla", region: "الداخلة ـ وادي الذهب", aliases: ["الداخلة", "dakhla"], lat: 23.68, lng: -15.95 },
  { slug: "errachidia", ar: "الرشيدية", fr: "Errachidia", region: "درعة ـ تافيلالت", aliases: ["الرشيدية", "errachidia"], lat: 31.93, lng: -4.42 },
  { slug: "khouribga", ar: "خريبكة", fr: "Khouribga", region: "بني ملال ـ خنيفرة", aliases: ["خريبكة", "khouribga"], lat: 32.88, lng: -6.9 },
];

export const cityBySlug = (slug: string) => CITIES.find((c) => c.slug === slug);
export const cityName = (slug: string) => cityBySlug(slug)?.ar ?? slug;
