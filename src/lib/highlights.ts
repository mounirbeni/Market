import type { Vehicle } from "./types";
import type { FairPrice } from "./market";
import { CURRENT_YEAR } from "./market";
import { formatNumber } from "./format";
import {
  BadgeCheck, Check, ClipboardCheck, Key, OilCan, ShieldCheck, Sparkle, TrendingDown,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";

/* ============================================================
   لماذا قد تهمك هذه المركبة؟

   كل نقطة هنا مبنية على معطى حقيقي فالإعلان — بلا نص عام يصلح
   لأي مركبة. الترتيب حسب الأهمية: الثمن أولاً (أكبر قرار)، بعده
   إشارات الثقة والحالة.

   الدالة كترجّع مفاتيح وأرقام، ماشي نصوص: النص كيجي من القاموس
   حسب لغة الزائر. التاريخ كيتنسّق فالمكوّن حيت هو اللي كيعرف
   اللغة — هنا كنمرّرو غير الـISO.
   ============================================================ */

export interface VehicleHighlight {
  key: string;
  Icon: (p: IconProps) => React.JSX.Element;
  /** قيم كتّعوّض داخل نص القاموس: {pct}، {km}، {n}، {date} */
  vars?: Record<string, string>;
  /** تاريخ ISO كيتنسّق فالعرض حسب اللغة */
  dateIso?: string;
}

export function vehicleHighlights(v: Vehicle, fp: FairPrice): VehicleHighlight[] {
  const list: VehicleHighlight[] = [];

  if (!fp.weak && fp.delta <= -0.045) {
    list.push({
      key: "price",
      Icon: TrendingDown,
      vars: { pct: String(Math.round(Math.abs(fp.delta) * 100)) },
    });
  }

  if (v.firstHand) list.push({ key: "first-hand", Icon: Key });

  const ageYears = Math.max(1, CURRENT_YEAR - v.year);
  const kmPerYear = v.km / ageYears;
  if (kmPerYear < 10000) {
    list.push({
      key: "low-km",
      Icon: Sparkle,
      vars: { km: formatNumber(Math.round(kmPerYear)) },
    });
  }

  if (v.inspected) list.push({ key: "inspected", Icon: BadgeCheck });
  if (v.serviceBook) list.push({ key: "service-book", Icon: OilCan });
  if (v.papersOk && v.vinChecked) list.push({ key: "papers", Icon: ClipboardCheck });

  if (v.technicalControl) {
    const tc = new Date(v.technicalControl);
    if (!Number.isNaN(tc.getTime()) && tc.getTime() > Date.now()) {
      list.push({ key: "technical-control", Icon: ClipboardCheck, dateIso: v.technicalControl });
    }
  }

  if (v.equipment.length >= 8) {
    list.push({ key: "equipment", Icon: Sparkle, vars: { n: String(v.equipment.length) } });
  }

  if (v.seller?.idVerified) list.push({ key: "seller", Icon: ShieldCheck });
  if (v.negotiable) list.push({ key: "negotiable", Icon: Check });

  return list.slice(0, 6);
}
