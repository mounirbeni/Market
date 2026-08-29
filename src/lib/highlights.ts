import type { Vehicle } from "./types";
import type { FairPrice } from "./market";
import { CURRENT_YEAR } from "./market";
import { formatMonthYear, formatNumber } from "./format";
import {
  BadgeCheck, Check, ClipboardCheck, Key, OilCan, ShieldCheck, Sparkle, TrendingDown,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";

/* ============================================================
   لماذا قد تهمك هذه المركبة؟

   كل نقطة هنا مبنية على معطى حقيقي فالإعلان — بلا نص عام يصلح
   لأي مركبة. الترتيب حسب الأهمية: الثمن أولاً (أكبر قرار)، بعده
   إشارات الثقة والحالة.
   ============================================================ */

export interface VehicleHighlight {
  key: string;
  label: string;
  detail: string;
  Icon: (p: IconProps) => React.JSX.Element;
}

export function vehicleHighlights(v: Vehicle, fp: FairPrice): VehicleHighlight[] {
  const list: VehicleHighlight[] = [];

  if (!fp.weak && fp.delta <= -0.045) {
    list.push({
      key: "price",
      label: "ثمن تحت السوق",
      detail: `أرخص بـ${Math.round(Math.abs(fp.delta) * 100)}٪ من الثمن المرجعي لمركبات مشابهة.`,
      Icon: TrendingDown,
    });
  }

  if (v.firstHand) {
    list.push({
      key: "first-hand",
      label: "يد أولى",
      detail: "بلا أي مالك سابق.",
      Icon: Key,
    });
  }

  const ageYears = Math.max(1, CURRENT_YEAR - v.year);
  const kmPerYear = v.km / ageYears;
  if (kmPerYear < 10000) {
    list.push({
      key: "low-km",
      label: "كيلومتراج منخفض لسنتها",
      detail: `~${formatNumber(Math.round(kmPerYear))} كم فالسنة — أقل من المتوسط.`,
      Icon: Sparkle,
    });
  }

  if (v.inspected) {
    list.push({
      key: "inspected",
      label: "مفحوصة من طريق",
      detail: "فحص مستقل بأكثر من 100 نقطة قبل النشر.",
      Icon: BadgeCheck,
    });
  }

  if (v.serviceBook) {
    list.push({
      key: "service-book",
      label: "دفتر الصيانة موجود",
      detail: "سجل صيانة كيوثّق العناية بالمركبة.",
      Icon: OilCan,
    });
  }

  if (v.papersOk && v.vinChecked) {
    list.push({
      key: "papers",
      label: "وثائق مطابقة",
      detail: "البطاقة الرمادية ورقم الهيكل متحقّق منهم.",
      Icon: ClipboardCheck,
    });
  }

  if (v.technicalControl) {
    const tc = new Date(v.technicalControl);
    if (!Number.isNaN(tc.getTime()) && tc.getTime() > Date.now()) {
      list.push({
        key: "technical-control",
        label: "الفحص التقني ساري",
        detail: `صالح حتى ${formatMonthYear(v.technicalControl)}.`,
        Icon: ClipboardCheck,
      });
    }
  }

  if (v.equipment.length >= 8) {
    list.push({
      key: "equipment",
      label: "تجهيزات غنية",
      detail: `${v.equipment.length} تجهيزة إضافية.`,
      Icon: Sparkle,
    });
  }

  if (v.seller?.idVerified) {
    list.push({
      key: "seller",
      label: "بائع موثّق",
      detail: "الهوية متحقّق منها من فريق طريق.",
      Icon: ShieldCheck,
    });
  }

  if (v.negotiable) {
    list.push({
      key: "negotiable",
      label: "الثمن قابل للتفاوض",
      detail: "البائع مفتوح على نقاش الثمن.",
      Icon: Check,
    });
  }

  return list.slice(0, 6);
}
