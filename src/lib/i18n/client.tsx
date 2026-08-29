"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { localePath, type Locale } from "./config";
import type { Dictionary } from "./server";

/* ============================================================
   القاموس فالمتصفح

   `next/root-params` كيخدم غير فServer Components. وبزاف من
   الواجهة هنا عبارة عن Client Components (الهيدر، البطاقات،
   الفلاتر، معالج البيع…) — علاش القاموس كيتمرّر مرة وحدة من
   التخطيط الجذري (خادم) لهاد السياق.

   ماكيزيدش حجماً على المتصفح: نفس القاموس اللي أصلاً مرسوم
   فالصفحة، كيتّشارك بدل ما يتكرّر.
   ============================================================ */

interface I18nValue {
  dict: Dictionary;
  locale: Locale;
}

const I18nCtx = createContext<I18nValue | null>(null);

export function I18nProvider({
  dict,
  locale,
  children,
}: I18nValue & { children: ReactNode }) {
  return <I18nCtx.Provider value={{ dict, locale }}>{children}</I18nCtx.Provider>;
}

function useI18n(): I18nValue {
  const v = useContext(I18nCtx);
  if (!v) throw new Error("useDict خاصها تكون داخل <I18nProvider>");
  return v;
}

/** القاموس ديال اللغة الحالية */
export const useDict = () => useI18n().dict;

/** اللغة الحالية */
export const useLocale = () => useI18n().locale;

/**
 * بنّاء روابط محافظ على اللغة.
 *
 * `<Link href="/cars">` كيوصّل لـ`/cars` اللي ماعندوش لغة —
 * الزائر كيخرج من الفرنسية بلا ما يحسّ. هاد الهوك كيزيد البادئة.
 */
export function useHref(): (path: string) => string {
  const { locale } = useI18n();
  return useCallback((path: string) => localePath(path, locale), [locale]);
}
