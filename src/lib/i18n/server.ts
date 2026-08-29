import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

/* ============================================================
   القاموس فالخادم

   كل المسارات تحت app/[lang]/، فـ`lang` هو معامل جذري: أي Server
   Component ولا أداة فالخادم كتقدر تقراه بلا ما نمرّرو props من
   طبقة لطبقة.

   القواميس كتتحمّل كسولاً — الفرنسية ماكتوصلش للمتصفح ملي الزائر
   كيتصفّح بالعربية.
   ============================================================ */

const dictionaries = {
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
};

/** شكل القاموس — العربية هي المرجع، والفرنسية خاصها تطابقو */
export type Dictionary = Awaited<ReturnType<typeof dictionaries.ar>>;

/** القاموس ديال لغة معيّنة — كيتستعمل ملي اللغة معروفة سلفاً */
export async function dictionaryOf(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]() as Promise<Dictionary>;
}

/**
 * القاموس ديال الطلب الحالي.
 *
 * لغة ماشي معروفة = 404 ماشي خطأ وقت التشغيل: `/xx/cars` خاصو
 * يرجع صفحة «ماكايناش» بحال أي مسار غالط.
 */
export async function getDictionary(): Promise<Dictionary> {
  const locale = await lang();
  if (!locale || !isLocale(locale)) notFound();
  return dictionaryOf(locale);
}

/** اللغة الحالية — للمكوّنات اللي محتاجة اللغة بلا القاموس */
export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  return locale && isLocale(locale) ? locale : DEFAULT_LOCALE;
}
