"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/lib/i18n/client";
import { localePath } from "@/lib/i18n/config";

/* ============================================================
   رابط داخلي محافظ على اللغة.

   `<NextLink href="/cars">` كيمشي لـ/cars اللي ماكاينش كمسار —
   proxy كيحوّلو حسب الكوكي. كيخدم، ولكن كل تنقّل كيدير إعادة
   توجيه زايدة، والزائر يقدر يخرج من الفرنسية بلا ما يقصد.

   هاد الغلاف كيزيد البادئة تلقائياً: href="/cars" وأنت فالفرنسية
   → /fr/cars مباشرة.

   الروابط الخارجية (https://…) والمراسي (#…) وtel:/mailto: كتدوز
   كما هي — بادئة اللغة ماعندها معنى فيهم.

   بديل مقصود لـnext/link: كنبدّلو غير الاستيراد فالملف بلا ما
   نعاودو كتابة كل <Link>.
   ============================================================ */

type Props = ComponentProps<typeof NextLink>;

const isInternal = (href: string) =>
  href.startsWith("/") && !href.startsWith("//");

export function Link({ href, ...rest }: Props) {
  const locale = useLocale();

  if (typeof href !== "string" || !isInternal(href)) {
    return <NextLink href={href} {...rest} />;
  }

  /* الاستعلام والمرساة كيبقاو كما هما — البادئة كتمشي للمسار وحدو */
  const [path, tail] = href.split(/(?=[?#])/, 2) as [string, string?];
  return <NextLink href={`${localePath(path, locale)}${tail ?? ""}`} {...rest} />;
}
