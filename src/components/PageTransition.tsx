import { ViewTransition } from "react";
import type { ReactNode } from "react";

/**
 * غلاف الانتقال الاتجاهي بين الصفحات — كيولّي فعّال غير ملي `<Link>`
 * كيصيفط transitionTypes="nav-forward"/"nav-back". بلا نوع محدّد
 * (تنقّل المتصفح للخلف، Suspense reveals...) الحركة كتبقى معطّلة (none).
 *
 * لازم يتحط فكل page.tsx بذاتها ماشي فlayout — الـlayouts كتبقى
 * ثابتة عبر التنقّل، فـenter/exit ماكيصفروش تما.
 */
const DIRECTIONAL = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
} as const;

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={DIRECTIONAL} exit={DIRECTIONAL} default="none">
      {children}
    </ViewTransition>
  );
}
