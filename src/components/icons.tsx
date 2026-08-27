import type { SVGProps } from "react";

/* ============================================================
   نظام الأيقونات — خطية، 24×24، تتبع لون النص (currentColor)
   لا تُستعمل الرموز التعبيرية في أي مكان بالواجهة

   أغلب الأيقونات مرسومة خصيصاً لهاد المشروع. الأيقونات المعلَّمة
   بـ «مصدرها Tabler Icons (MIT)» مأخوذة من مجموعة Tabler ومعدَّلة
   لتوافق سمك الخط ديالنا. شوف THIRD-PARTY-NOTICES.md.
   ============================================================ */

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "size"> {
  size?: number | string;
  strokeWidth?: number;
  /**
   * تعمير الأيقونة. غير Heart و Star كيستعملوها، ولكن كل الأيقونات
   * كتقبلها: القوائم كتمرّر نفس الخصائص لأيقونات مختلفة، وبلا ما
   * تكون معروفة هنا كتسيل لـ<svg> كخاصية DOM ماشي صالحة.
   */
  filled?: boolean;
}

function base({ size = 20, strokeWidth = 1.75, filled: _filled, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...rest,
  };
}

type P = IconProps;

/* ---------- تنقل وواجهة ---------- */
export const Search = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const Close = (p: P) => (
  <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const Menu = (p: P) => (
  <svg {...base(p)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
export const ChevronDown = (p: P) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const ChevronUp = (p: P) => (
  <svg {...base(p)}><path d="m18 15-6-6-6 6" /></svg>
);
export const ChevronLeft = (p: P) => (
  <svg {...base(p)}><path d="m15 18-6-6 6-6" /></svg>
);
export const ChevronRight = (p: P) => (
  <svg {...base(p)}><path d="m9 18 6-6-6-6" /></svg>
);
export const ArrowLeft = (p: P) => (
  <svg {...base(p)}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
);
export const ArrowRight = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowUpDown = (p: P) => (
  <svg {...base(p)}><path d="M7 3v18M3 7l4-4 4 4M17 21V3M13 17l4 4 4-4" /></svg>
);
export const Filter = (p: P) => (
  <svg {...base(p)}><path d="M3 5h18M6 12h12M10 19h4" /></svg>
);
export const Sliders = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2" />
    <circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="16" cy="18" r="2" />
  </svg>
);
export const Grid = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);
export const Rows = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" />
  </svg>
);
export const Plus = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const Minus = (p: P) => (<svg {...base(p)}><path d="M5 12h14" /></svg>);
export const Check = (p: P) => (<svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7" /></svg>);
export const Reset = (p: P) => (
  <svg {...base(p)}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
);
export const WifiOff = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 8.5a17 17 0 0 1 5.3-3.4M22 8.5a17 17 0 0 0-8.4-4.3M6 12.5a11.4 11.4 0 0 1 3.4-2M18 12.5a11.4 11.4 0 0 0-2.8-1.9" />
    <path d="M9 16.3a6 6 0 0 1 6 0" />
    <circle cx="12" cy="19.5" r="1.1" fill="currentColor" stroke="none" />
    <path d="M3 3l18 18" />
  </svg>
);
export const External = (p: P) => (
  <svg {...base(p)}><path d="M14 4h6v6M20 4l-8 8" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
);

/* ---------- إجراءات ---------- */
export const Heart = ({ filled, ...p }: P) => (
  <svg {...base(p)} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20.5 4.4 13a5 5 0 0 1 7.1-7l.5.5.5-.5a5 5 0 0 1 7.1 7z" />
  </svg>
);
export const Scale = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5v17M8 20.5h8" />
    <path d="M4.5 7.5h15" />
    <path d="M4.5 7.5 2 14h5zM19.5 7.5 17 14h5z" />
  </svg>
);
export const Phone = (p: P) => (
  <svg {...base(p)}>
    <path d="M15.5 21A12.5 12.5 0 0 1 3 8.5 3.5 3.5 0 0 1 6.5 5h1.2a1 1 0 0 1 1 .8l.7 3a1 1 0 0 1-.3 1l-1.4 1.3a11 11 0 0 0 5.2 5.2l1.3-1.4a1 1 0 0 1 1-.3l3 .7a1 1 0 0 1 .8 1v1.2A3.5 3.5 0 0 1 15.5 21" />
  </svg>
);
export const Message = (p: P) => (
  <svg {...base(p)}><path d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-5.3A8 8 0 1 1 21 11.5" /></svg>
);
/* filled = كاينين إشعارات ماتقراوش — الجرس معمّر باش يبان من بعيد */
export const Bell = ({ filled, ...p }: P) => (
  <svg {...base(p)}>
    <path
      d="M6.5 9a5.5 5.5 0 0 1 11 0c0 6 2 7.5 2 7.5h-15S6.5 15 6.5 9"
      fill={filled ? "currentColor" : "none"}
    />
    <path d="M10.2 20a2 2 0 0 0 3.6 0" />
  </svg>
);
export const Share = (p: P) => (
  <svg {...base(p)}>
    <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" />
    <path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" />
  </svg>
);
export const Trash = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" /></svg>
);
export const Eye = (p: P) => (
  <svg {...base(p)}><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12" /><circle cx="12" cy="12" r="2.8" /></svg>
);
export const Bookmark = (p: P) => (
  <svg {...base(p)}><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z" /></svg>
);

/* ---------- المركبات ---------- */
export const Car = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 16.8v-3.3l1.6-3.6h14.8L21 13.5v3.3" />
    <path d="M3 13.5h18" />
    <path d="M6.8 9.9 8.6 6.8A1.6 1.6 0 0 1 10 6h4a1.6 1.6 0 0 1 1.4.8l1.8 3.1" />
    <circle cx="7" cy="16.8" r="1.9" /><circle cx="17" cy="16.8" r="1.9" />
  </svg>
);
export const Hatchback = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.4 16.8v-3.3L5 9.9h14.4L21 13.5v3.3" />
    <path d="M3.4 13.5h17.6" />
    <path d="M5 9.9 5.7 7.1A1.5 1.5 0 0 1 7.2 6h6.6a1.6 1.6 0 0 1 1.4.8l1.8 3.1" />
    <circle cx="7.4" cy="16.8" r="1.9" /><circle cx="16.8" cy="16.8" r="1.9" />
  </svg>
);
export const Moto = (p: P) => (
  <svg {...base(p)}>
    <circle cx="5" cy="16.6" r="3.4" /><circle cx="19" cy="16.6" r="3.4" />
    <path d="M5 16.6h3.4l2.8-5.4h4.6" /><path d="m11.2 11.2-2-3H7" />
    <path d="M15.8 11.2 19 16.6" /><path d="M14.4 7.6h3.2" />
  </svg>
);
export const MotoTrail = (p: P) => (
  <svg {...base(p)}>
    <circle cx="5" cy="17.2" r="3" /><circle cx="19" cy="17.2" r="3" />
    <path d="M5 17.2h3.6L11.2 11h4.4" /><path d="m11.2 11-2-2.8H7.2" />
    <path d="M15.6 11 19 17.2" /><path d="M13.8 6.6h3.4" /><path d="m17.4 5.2 3.4-1.1" />
  </svg>
);
export const MotoSport = (p: P) => (
  <svg {...base(p)}>
    <circle cx="5" cy="17.2" r="3" /><circle cx="19" cy="17.2" r="3" />
    <path d="M5 17.2h3.2l2.2-5 5.2-1.4" /><path d="M10.4 12.2 8.8 9.6l-2.2.5" />
    <path d="M15.6 10.8c2.1.4 3.4 1.8 3.6 3.9" /><path d="M13.2 8.4h3" />
  </svg>
);
export const MotoCustom = (p: P) => (
  <svg {...base(p)}>
    <circle cx="4.6" cy="16.8" r="3" /><circle cx="19.4" cy="16.8" r="3" />
    <path d="M4.6 16.8h4l2.6-4.6h4.2" /><path d="m11.2 12.2-1.6-2.6H7.4" />
    <path d="M15 12.2l4.4 4.6" /><path d="m15.4 7.8 3.6-1.4" /><path d="M13.4 7.8h2" />
  </svg>
);
export const Scooter = (p: P) => (
  <svg {...base(p)}>
    <circle cx="5.5" cy="17" r="3" /><circle cx="18.5" cy="17" r="3" />
    <path d="M5.5 17h7l1.5-8h2" /><path d="M15 9V6.5h2.5" /><path d="M16.5 9.5 18.5 17" />
    <path d="M8 13h4.5" />
  </svg>
);
export const Suv = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 17v-4.5l1.8-5A2 2 0 0 1 6.7 6h10.6a2 2 0 0 1 1.9 1.5l1.8 5V17" />
    <path d="M3 12.5h18M9 6.5v6M2 17h20" />
    <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
  </svg>
);
export const Pickup = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 17v-6h9V7.5A1.5 1.5 0 0 1 12.5 6h3.2a2 2 0 0 1 1.7 1l2.6 4H22v6" />
    <path d="M2 11h9M11 11V6" /><path d="M1.5 17h21" />
    <circle cx="6" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
  </svg>
);
export const Van = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 17V7.5A1.5 1.5 0 0 1 4 6h9.5a2 2 0 0 1 1.6.8l3.6 4.7H21a1 1 0 0 1 1 1V17" />
    <path d="M2 17h20M13.5 6v11" /><path d="M15.5 8.5h2.2l1.6 2.2h-3.8z" />
    <circle cx="6.5" cy="17" r="2" /><circle cx="17.5" cy="17" r="2" />
  </svg>
);
export const Wagon = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 17v-5l1.5-4.3A2 2 0 0 1 5.9 6.3h11a2 2 0 0 1 1.8 1.2L21 12.5V17" />
    <path d="M2.5 12h18.5M8 6.3V12M14 6.3V12M2 17h20" />
    <circle cx="6.5" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
  </svg>
);
export const Convertible = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 17v-4l1.8-2.4A2 2 0 0 1 6.4 9.8h11.2a2 2 0 0 1 1.7.9L21 13v4" />
    <path d="M3 13h18M2 17h20M8 9.8 10.5 7h4L17 9.8" />
    <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
  </svg>
);

/* ---------- مواصفات ---------- */
export const Fuel = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16" /><path d="M3 21h11" /><path d="M4.5 9h8" />
    <path d="M13 12h2a1.5 1.5 0 0 1 1.5 1.5V16a1.7 1.7 0 0 0 3.4 0V9.4a2 2 0 0 0-.6-1.4L17 5.5" />
  </svg>
);
export const Droplet = (p: P) => (
  <svg {...base(p)}><path d="M12 3s6 6.2 6 10.2A6 6 0 0 1 6 13.2C6 9.2 12 3 12 3" /></svg>
);
export const Leaf = (p: P) => (
  <svg {...base(p)}><path d="M4 20c9 1 16-4 16-14-9-1-16 3-16 10 0 1.4.3 2.8 1 4" /><path d="M4 20c2-5 5-8 10-10" /></svg>
);
export const Bolt = (p: P) => (
  <svg {...base(p)}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
);
export const Gauge = (p: P) => (
  <svg {...base(p)}><path d="M3.6 18a9 9 0 1 1 16.8 0" /><path d="m12 13 4-3.5" /><circle cx="12" cy="14" r="1.3" /></svg>
);
export const Gearbox = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6v12M12 6v12M18 6v12M6 6h12M6 12h12" />
    <circle cx="6" cy="5" r="1.4" /><circle cx="12" cy="5" r="1.4" /><circle cx="18" cy="5" r="1.4" />
  </svg>
);
export const Calendar = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
export const Engine = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 10h2V8h4l2 2h3a2 2 0 0 1 2 2v1h2v4h-2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1z" />
    <path d="M9 5h4" />
  </svg>
);
/** مصدرها Tabler Icons (MIT) — car-door */
export const Door = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 14h2" />
    <path d="M19 10h-16" />
    <path d="M6.7 3.45l-3.7 5.55v3.08a1 1 0 0 0 .85 1a6 6 0 0 1 5.15 5.92v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1 -1v-16a1 1 0 0 0 -1 -1h-10.46a1 1 0 0 0 -.84 .45" />
  </svg>
);
export const Palette = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3a9 9 0 1 0 0 18c1 0 1.6-.7 1.6-1.5 0-.4-.2-.8-.5-1.1-.3-.3-.4-.6-.4-1 0-.8.7-1.4 1.5-1.4H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8" />
    <circle cx="7.5" cy="12" r="1.1" /><circle cx="9.5" cy="8" r="1.1" /><circle cx="14" cy="7.5" r="1.1" /><circle cx="17" cy="10.5" r="1.1" />
  </svg>
);
export const Users = (p: P) => (
  <svg {...base(p)}>
    <path d="M15 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-4A3.5 3.5 0 0 0 4 18.5V20" />
    <circle cx="9.5" cy="8" r="3.5" />
    <path d="M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 4.6a3.5 3.5 0 0 1 0 6.8" />
  </svg>
);
export const Road = (p: P) => (
  <svg {...base(p)}><path d="M6 3 3 21M18 3l3 18M12 4v3M12 10.5v3M12 17v3" /></svg>
);
export const Weight = (p: P) => (
  <svg {...base(p)}><path d="M6.5 8h11l1.8 12H4.7z" /><circle cx="12" cy="5" r="2.5" /></svg>
);

/* ---------- الثقة والوثائق ---------- */
export const Shield = (p: P) => (
  <svg {...base(p)}><path d="M12 21.5S4 18.5 4 12V5.5l8-3 8 3V12c0 6.5-8 9.5-8 9.5" /></svg>
);
export const ShieldCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21.5S4 18.5 4 12V5.5l8-3 8 3V12c0 6.5-8 9.5-8 9.5" /><path d="m8.8 11.8 2.2 2.2 4.2-4.4" />
  </svg>
);
export const ShieldAlert = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21.5S4 18.5 4 12V5.5l8-3 8 3V12c0 6.5-8 9.5-8 9.5" /><path d="M12 8v4" /><path d="M12 15.5h.01" />
  </svg>
);
export const BadgeCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.5 14.3 5l3.4-.2.2 3.4 2.6 2.2-2 2.8.8 3.3-3.3.9-1.4 3.1-3.1-1.4-3.1 1.4-1.4-3.1-3.3-.9.8-3.3-2-2.8L4.1 8.2l.2-3.4L7.7 5z" />
    <path d="m9 12 2.1 2.1L15.3 10" />
  </svg>
);
export const IdCard = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" /><circle cx="8.5" cy="11" r="2" />
    <path d="M5.5 16a3.2 3.2 0 0 1 6 0M14.5 10h4M14.5 14h4" />
  </svg>
);
export const Scan = (p: P) => (
  <svg {...base(p)}><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16" /></svg>
);
export const FileText = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);
export const ClipboardCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="2.5" width="6" height="3.5" rx="1" /><path d="m9.5 13.5 2 2 4-4" />
  </svg>
);
export const Wrench = (p: P) => (
  <svg {...base(p)}>
    <path d="M15.6 5.4a4.5 4.5 0 0 0 5.6 5.9L12 20.5a2.4 2.4 0 0 1-3.4-3.4l9.2-9.2a4.5 4.5 0 0 0-2.2-2.5" />
    <path d="M20.8 4.2 17.6 7.4" />
  </svg>
);
export const Lock = (p: P) => (
  <svg {...base(p)}><rect x="4.5" y="10" width="15" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
);
export const Key = (p: P) => (
  <svg {...base(p)}><circle cx="8" cy="8" r="4.5" /><path d="m11.2 11.2 8.3 8.3M17 17l2-2M14.5 14.5l2-2" /></svg>
);

/* ---------- بيانات ومال ---------- */
export const TrendingDown = (p: P) => (
  <svg {...base(p)}><path d="M3 7l6.5 6.5 4-4L21 17" /><path d="M21 12v5h-5" /></svg>
);
export const TrendingUp = (p: P) => (
  <svg {...base(p)}><path d="M3 17l6.5-6.5 4 4L21 7" /><path d="M21 12V7h-5" /></svg>
);
export const Equal = (p: P) => (<svg {...base(p)}><path d="M5 9h14M5 15h14" /></svg>);
export const Calculator = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="2.5" width="16" height="19" rx="2" /><path d="M8 6.5h8" />
    <path d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h3.01" />
  </svg>
);
export const Coins = (p: P) => (
  <svg {...base(p)}>
    <ellipse cx="9" cy="6.5" rx="6" ry="3" /><path d="M3 6.5v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" />
    <path d="M15 11.2c3.1.2 6 1.4 6 3v4c0 1.7-2.7 3-6 3s-6-1.3-6-3v-4" />
  </svg>
);
export const Wallet = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 0 1 1 1v2" />
    <path d="M3 7.5V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a1 1 0 0 0-1-1H5.5A2.5 2.5 0 0 1 3 7.5" />
    <circle cx="16.5" cy="14.5" r="1.2" />
  </svg>
);
export const Percent = (p: P) => (
  <svg {...base(p)}><path d="M19 5 5 19" /><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></svg>
);
export const Chart = (p: P) => (
  <svg {...base(p)}><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12.5 16V7M17 16v-6" /></svg>
);
export const Clock = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 2" /></svg>
);
export const Timer = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="13.5" r="7.5" /><path d="M12 10v3.5M9.5 2.5h5M19 6l-1.6 1.6" /></svg>
);

/* ---------- حالات ---------- */
export const AlertTriangle = (p: P) => (
  <svg {...base(p)}>
    <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0" />
    <path d="M12 9v4.2M12 16.8h.01" />
  </svg>
);
export const Info = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const Help = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.8-.9 1.4v.4M12 17h.01" /></svg>
);
export const Star = ({ filled, ...p }: P) => (
  <svg {...base(p)} fill={filled ? "currentColor" : "none"}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" />
  </svg>
);
export const Sparkle = (p: P) => (
  <svg {...base(p)}><path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 16.5 19.7 18.3 21.5 19 19.7 19.7 19 21.5 18.3 19.7 16.5 19 18.3 18.3z" /></svg>
);
export const Award = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="9" r="5.5" /><path d="m8.5 13.8-1 7.2 4.5-2.4 4.5 2.4-1-7.2" /></svg>
);
export const CircleDot = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" /></svg>
);
export const Flag = (p: P) => (
  <svg {...base(p)}><path d="M5 21V4M5 4.5h11l-1.8 3.5L16 11.5H5" /></svg>
);
/** مصدرها Tabler Icons (MIT) — car-crash */
export const Crash = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M7 6l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-5m0 -6h8m-6 0v-5m2 0h-4" />
    <path d="M14 8v-2" />
    <path d="M19 12h2" />
    <path d="M17.5 15.5l1.5 1.5" />
    <path d="M17.5 8.5l1.5 -1.5" />
  </svg>
);

/* ---------- وسائط ---------- */
export const Camera = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.2-2h8.2l1.2 2h2.2A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
    <circle cx="12" cy="12.5" r="3.4" />
  </svg>
);
export const Video = (p: P) => (
  <svg {...base(p)}><rect x="2.5" y="6" width="13" height="12" rx="2" /><path d="m15.5 11 6-3.2v8.4l-6-3.2z" /></svg>
);
export const Play = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5z" /></svg>
);
export const MapPin = (p: P) => (
  <svg {...base(p)}><path d="M12 21.5s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11" /><circle cx="12" cy="10.2" r="2.6" /></svg>
);
export const Sun = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
  </svg>
);
export const Moon = (p: P) => (
  <svg {...base(p)}><path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8" /></svg>
);


/* ---------- أيقونات المركبات التفصيلية ---------- */
export const Transmission = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="5.5" r="1.8" /><circle cx="12" cy="5.5" r="1.8" /><circle cx="18" cy="5.5" r="1.8" />
    <circle cx="6" cy="18.5" r="1.8" /><circle cx="18" cy="18.5" r="1.8" />
    <path d="M6 7.3v9.4M18 7.3v9.4M6 12h12M12 7.3V12" />
  </svg>
);
/** مصدرها Tabler Icons (MIT) — automatic-gearbox */
export const AutoGear = (p: P) => (
  <svg {...base(p)}>
    <path d="M17 17v4h1a2 2 0 1 0 0 -4h-1" />
    <path d="M17 11h1.5a1.5 1.5 0 0 0 0 -3h-1.5v5" />
    <path d="M3 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M5 7v3a1 1 0 0 0 1 1h3v7a1 1 0 0 0 1 1h3" />
    <path d="M9 11h4" />
  </svg>
);
export const Horsepower = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 18.5a8 8 0 1 1 16 0" />
    <path d="m12 13.5 3.5-4" />
    <path d="M12.5 4.2 11 7.2l3 .6-1.5 2.9" />
  </svg>
);
export const Seat = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 4.5a1.5 1.5 0 0 1 3 0V12h4a2 2 0 0 1 2 2v.5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" />
    <path d="M16 16.5v3M6 19.5h12" />
  </svg>
);
export const Drivetrain = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="6.5" r="2.6" /><circle cx="18" cy="6.5" r="2.6" />
    <circle cx="6" cy="17.5" r="2.6" /><circle cx="18" cy="17.5" r="2.6" />
    <path d="M8.6 6.5h6.8M8.6 17.5h6.8M12 6.5v11" />
  </svg>
);
export const Odometer = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 18a9 9 0 1 1 17 0" />
    <path d="m12 12.5 3.8-3.4" />
    <path d="M6.4 15h.01M7.7 10.6h.01M12 8.9h.01M16.3 10.6h.01M17.6 15h.01" />
  </svg>
);
export const Wheel = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.2" />
    <path d="M12 3v5.8M12 15.2V21M3 12h5.8M15.2 12H21" />
  </svg>
);
export const BrakeDisc = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
  </svg>
);
export const Airbag = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 19.5v-3a3 3 0 0 1 3-3h1.5" />
    <circle cx="14.5" cy="10" r="5.5" />
    <path d="M4 19.5h5" />
  </svg>
);
/** مصدرها Tabler Icons (MIT) — car-fan */
export const AirCon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 12v-9l4.912 1.914a1.7 1.7 0 0 1 .428 2.925l-5.34 4.161" />
    <path d="M12 12h9l-1.914 4.912a1.7 1.7 0 0 1 -2.925 .428l-4.161 -5.34" />
    <path d="M12 12h-9l1.914 -4.912a1.7 1.7 0 0 1 2.925 -.428l4.161 5.34" />
    <path d="M12 12v9l-4.912 -1.914a1.7 1.7 0 0 1 -.428 -2.925l5.34 -4.161" />
  </svg>
);
export const Steering = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.6" />
    <path d="M3.2 11h17.6M12 14.6V21" />
  </svg>
);
/** مصدرها Tabler Icons (MIT) — battery-automotive */
export const Battery = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -10" />
    <path d="M6 5v-2" />
    <path d="M18 3v2" />
    <path d="M6.5 12h3" />
    <path d="M14.5 12h3" />
    <path d="M16 10.5v3" />
  </svg>
);
export const Radar = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20a8 8 0 1 1 8-8" />
    <path d="M12 16.5a4.5 4.5 0 0 1 4.5-4.5" />
    <circle cx="12" cy="20" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
export const Headlight = (p: P) => (
  <svg {...base(p)}>
    <path d="M11 5.5a6.5 6.5 0 0 0 0 13H8a6.5 6.5 0 0 1 0-13z" />
    <path d="M14.5 8h5M14.5 12h6.5M14.5 16h5" />
  </svg>
);
export const Sunroof = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <rect x="6.5" y="8" width="11" height="5" rx="1" />
    <path d="M6.5 16h11" />
  </svg>
);
export const Screen = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.5" y="4.5" width="19" height="13" rx="2" />
    <path d="M8 21h8M12 17.5V21" />
    <path d="M6.5 8.5h5M6.5 12h3" />
  </svg>
);
export const Navigation = (p: P) => (
  <svg {...base(p)}>
    <path d="M20.5 3.5 3.5 10.2l7.4 2.9 2.9 7.4z" />
  </svg>
);
export const Cruise = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 17.5a9 9 0 1 1 17 0" />
    <path d="M12 12.5h5" /><circle cx="12" cy="12.5" r="1.4" />
    <path d="M7.5 20.5h9" />
  </svg>
);
export const Lock2 = (p: P) => (
  <svg {...base(p)}>
    <rect x="4.5" y="10.5" width="15" height="10.5" rx="2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    <path d="M12 14.5v2.5" />
  </svg>
);
export const Window = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <path d="M3 12h18M9.5 4.5v15" />
  </svg>
);

/* ============================================================
   الميكانيك — قطع ومنظومات المركبة
   مرسومة يدوياً بنفس الشبكة (24×24) وسمك الخط ديال باقي المجموعة
   ============================================================ */

/** بيستون بذراع التوصيل ومحور الكرنك */
export const Piston = (p: P) => (
  <svg {...base(p)}>
    <rect x="6.6" y="2.6" width="10.8" height="7.4" rx="1.4" />
    <path d="M6.6 6.1h10.8M6.6 8.2h10.8" />
    <path d="M10.7 10v3.4M13.3 10v3.4" />
    <circle cx="12" cy="17.4" r="3.9" />
    <circle cx="12" cy="17.4" r="1.1" />
  </svg>
);

/** كتلة المحرك مع رأس الأسطوانات */
export const EngineBlock = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12.5h2V9.5h3l1.6-2h6.2a1.8 1.8 0 0 1 1.8 1.8v2.2h2.4v4.4h-2.4v1.3a1.8 1.8 0 0 1-1.8 1.8H7.8A1.8 1.8 0 0 1 6 17.2v-1.4H4z" />
    <path d="M9 7.5V5.2h6V7.5" />
    <path d="M10.6 5.2v-1.8M13.4 5.2v-1.8" />
  </svg>
);

/** تيربو — بيت حلزوني وعجلة ضاغطة */
/** مصدرها Tabler Icons (MIT) — car-turbine */
export const Turbo = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 13a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M18.86 11c.088 .66 .14 1.512 .14 2a8 8 0 1 1 -8 -8h6" />
    <path d="M11 9c2.489 .108 4.489 .108 6 0" />
    <path d="M17 4a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -6" />
    <path d="M11 13l-3.5 -1.5" />
    <path d="M11 13l2.5 3" />
    <path d="M8.5 16l2.5 -3" />
    <path d="M11 13l3.5 -1.5" />
    <path d="M11 9v4" />
  </svg>
);

/** شمعة الإشعال (البوجي) */
export const SparkPlug = (p: P) => (
  <svg {...base(p)}>
    <path d="M10.4 2.6h3.2v3.1h-3.2z" />
    <path d="M9.6 5.7h4.8v4.1H9.6z" />
    <path d="M8.7 9.8h6.6l-.9 2.9H9.6z" />
    <path d="M10.2 12.7h3.6v4.5h-3.6z" />
    <path d="M10.4 17.2v3.2h2.6" />
  </svg>
);

/** علبة الزيت مع نقطة سائلة */
export const OilCan = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 16.4h11.4a3.6 3.6 0 0 0 3.6-3.6v-1.6h-4.2l-2.3-2.1H6.6A3.6 3.6 0 0 0 3 12.7z" />
    <path d="M18 11.2 21 8.2" />
    <path d="M7.4 8.9V7.2h3.4" />
    <path d="M8.6 18.4s1.4 1.8 1.4 2.6a1.4 1.4 0 0 1-2.8 0c0-.8 1.4-2.6 1.4-2.6z" />
  </svg>
);

/** فيلتر الزيت — أسطوانة لولبية */
export const OilFilter = (p: P) => (
  <svg {...base(p)}>
    <rect x="7" y="2.8" width="10" height="14.6" rx="1.6" />
    <path d="M7 6.4h10M7 13.8h10" />
    <path d="M9.2 17.4v3.2h5.6v-3.2" />
  </svg>
);

/** فيلتر الهواء — لوحة مطويّة */
export const AirFilter = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.8" y="6" width="18.4" height="12" rx="2" />
    <path d="m6.4 6.4-1.8 11.2M10 6.4 8.2 17.6M13.6 6.4l-1.8 11.2M17.2 6.4l-1.8 11.2" />
  </svg>
);

/** الرادياتور — زعانف تبريد وبخار */
export const Radiator = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="7.8" width="18" height="11.4" rx="2" />
    <path d="M7.5 7.8v11.4M12 7.8v11.4M16.5 7.8v11.4" />
    <path d="M8.6 5.4c0-1.2 1.6-1.2 1.6-2.4M13.8 5.4c0-1.2 1.6-1.2 1.6-2.4" />
  </svg>
);

/** سائل التبريد — حرارة المحرك */
export const Coolant = (p: P) => (
  <svg {...base(p)}>
    <path d="M10.2 4a1.8 1.8 0 0 1 3.6 0v7.7a3.4 3.4 0 1 1-3.6 0z" />
    <circle cx="12" cy="14.8" r="1.3" fill="currentColor" stroke="none" />
    <path d="M2.6 19.4c1.3 0 1.3-1.3 2.6-1.3s1.3 1.3 2.6 1.3M16.2 19.4c1.3 0 1.3-1.3 2.6-1.3s1.3 1.3 2.6 1.3" />
  </svg>
);

/** كورّية وبكرات التوزيع */
export const Belt = (p: P) => (
  <svg {...base(p)}>
    <circle cx="7.2" cy="12" r="4.6" /><circle cx="16.8" cy="12" r="4.6" />
    <path d="M7.2 7.4h9.6M7.2 16.6h9.6" />
    <circle cx="7.2" cy="12" r="1.2" /><circle cx="16.8" cy="12" r="1.2" />
  </svg>
);

/** طارة السلسلة (خاصة بالدراجات) */
export const Sprocket = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="6.4" /><circle cx="12" cy="12" r="2.1" />
    <path d="M12 2.8v2.8M12 18.4v2.8M2.8 12h2.8M18.4 12h2.8" />
    <path d="m5.5 5.5 2 2M16.5 16.5l2 2M18.5 5.5l-2 2M7.5 16.5l-2 2" />
  </svg>
);

/** قرص الفرامل مع الملقط */
export const BrakeRotor = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.8" cy="12" r="8" />
    <circle cx="10.8" cy="12" r="2.6" />
    <path d="M10.8 6.6h.01M14.6 9.4h.01M14.6 14.6h.01M10.8 17.4h.01M7 14.6h.01M7 9.4h.01" />
    <path d="M17.4 8.2h2.1a1.6 1.6 0 0 1 1.6 1.6v4.4a1.6 1.6 0 0 1-1.6 1.6h-2.1" />
  </svg>
);

/** تيل الفرامل */
export const BrakePad = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.2" y="6.2" width="3.8" height="11.6" rx="1.2" />
    <path d="M7 7.4h2.8a1.6 1.6 0 0 1 1.6 1.6v6a1.6 1.6 0 0 1-1.6 1.6H7z" />
    <path d="M15.4 4.4a9.8 9.8 0 0 1 0 15.2" />
    <path d="M12.4 12h1.8" />
  </svg>
);

/** ممتص الصدمات مع الروسور */
export const Shock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="3.4" r="1.9" />
    <path d="M12 5.3v1.5" />
    <path d="m8.4 7.2 7.2 2.2-7.2 2.2 7.2 2.2-7.2 2.2 7.2 2.1" />
    <path d="M12 18.1v1.1" />
    <circle cx="12" cy="20.6" r="1.9" />
  </svg>
);

/** العادم — الشكمان */
export const Exhaust = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.6 12.4h3.4" />
    <rect x="6" y="8.8" width="8.8" height="7.2" rx="1.6" />
    <path d="M9 8.8v7.2M11.9 8.8v7.2" />
    <path d="M14.8 12.4h2.4" />
    <ellipse cx="18.4" cy="12.4" rx="1.2" ry="2.1" />
    <path d="M19.8 8.6c0-1.5 1.7-1.5 1.7-3" />
  </svg>
);

/** عمود الدفع والفرق */
export const Driveshaft = (p: P) => (
  <svg {...base(p)}>
    <path d="M7.8 12h8.4" />
    <path d="M7.8 9.8v4.4M16.2 9.8v4.4" />
    <circle cx="5.2" cy="12" r="2.8" />
    <circle cx="18.8" cy="12" r="2.8" />
    <path d="m3.6 10.4 3.2 3.2M6.8 10.4l-3.2 3.2" />
    <path d="m17.2 10.4 3.2 3.2M20.4 10.4l-3.2 3.2" />
  </svg>
);

/** رولمان — محمل كروي */
export const Bearing = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.6" /><circle cx="12" cy="12" r="3.6" />
    <circle cx="12" cy="5.9" r="1.3" /><circle cx="12" cy="18.1" r="1.3" />
    <circle cx="5.9" cy="12" r="1.3" /><circle cx="18.1" cy="12" r="1.3" />
    <circle cx="7.7" cy="7.7" r="1.3" /><circle cx="16.3" cy="16.3" r="1.3" />
    <circle cx="16.3" cy="7.7" r="1.3" /><circle cx="7.7" cy="16.3" r="1.3" />
  </svg>
);

/** الإطار — مداس البنو */
export const Tire = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="6.8" strokeDasharray="1.9 2.4" />
    <circle cx="12" cy="12" r="4.3" />
  </svg>
);

/** ضغط الإطارات */
export const TirePressure = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 20V9.6C5 6 8.1 3.4 12 3.4s7 2.6 7 6.2V20" />
    <path d="M3.2 20h17.6" />
    <path d="m5 20 1.7-2.2M19 20l-1.7-2.2" />
    <path d="M12 8.2v4.6M12 16h.01" />
  </svg>
);

/** مساحات الزجاج */
/** مصدرها Tabler Icons (MIT) — wiper */
export const Wiper = (p: P) => (
  <svg {...base(p)}>
    <path d="M11 18a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M3 9l5.5 5.5a5 5 0 0 1 7 0l5.5 -5.5a12 12 0 0 0 -18 0" />
    <path d="M12 18l-2.2 -12.8" />
  </svg>
);

/** جهاز التشخيص OBD */
export const Diagnostic = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.4 4.4h11.2a1.8 1.8 0 0 1 1.8 1.8v5.4a4 4 0 0 1-4 4H8.6a4 4 0 0 1-4-4V6.2a1.8 1.8 0 0 1 1.8-1.8z" />
    <path d="M8.6 7.6v2.2M12 7.6v2.2M15.4 7.6v2.2" />
    <path d="M12 15.6v2.4" />
    <path d="M8.8 20.8h6.4" />
    <path d="M12 18h-1.6l1.6 2.8" />
  </svg>
);

/** صندوق الأدوات */
export const Toolbox = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.6" y="8.4" width="18.8" height="11" rx="2" />
    <path d="M8.6 8.4V6.2a1.6 1.6 0 0 1 1.6-1.6h3.6a1.6 1.6 0 0 1 1.6 1.6v2.2" />
    <path d="M2.6 13.2h18.8" />
    <path d="M9.8 11.6h4.4v3.4H9.8z" />
  </svg>
);

/** الكريك — رافعة المركبة */
/** مصدرها Tabler Icons (MIT) — car-lifter */
export const Jack = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 21l10 -7l-10 -7" />
    <path d="M17 7l-10 7l10 7" />
    <path d="M20 7h-16a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1" />
    <path d="M3 21h18" />
  </svg>
);

/** ضبط زوايا العجلات — البارالاج */
export const Alignment = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.8" y="6" width="4.2" height="12" rx="1.6" transform="rotate(-10 4.9 12)" />
    <rect x="17" y="6" width="4.2" height="12" rx="1.6" transform="rotate(10 19.1 12)" />
    <path d="M12 3.6v14.8" />
    <path d="M9.4 20.6h5.2" />
    <path d="m10.2 6.2 1.8-2.6 1.8 2.6" />
  </svg>
);

/** المحوّل الحفّاز */
export const Catalyst = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.6 12.4h3.2" />
    <path d="M5.8 9.4h12.4v6H5.8z" />
    <path d="M8.6 9.4v6M11.4 9.4v6M14.2 9.4v6" />
    <path d="M18.2 12.4h3.2" />
    <path d="M12 9.4V6.6M9.8 6.6h4.4" />
  </svg>
);

/** صمّام المحرك */
export const Valve = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.8v11.4" />
    <path d="M9.2 4.4h5.6" />
    <path d="m8.8 6.6 6.4 1.5-6.4 1.5 6.4 1.5" />
    <path d="M6.4 14.2h11.2l-2.4 4.2a1.6 1.6 0 0 1-1.4.8h-3.6a1.6 1.6 0 0 1-1.4-.8z" />
  </svg>
);

/** مفتاح التشغيل */
export const Ignition = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 5.6v4" />
    <circle cx="12" cy="12" r="2.4" />
    <path d="M12 14.4v4.6M10.4 17.4h3.2" />
  </svg>
);

/** ضغط التيربو / مؤشر الضغط */
export const BoostGauge = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="m12 12 4-3.4" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <path d="M6.4 15.4h.01M6.2 10.4h.01M9.6 6.9h.01M14.4 6.9h.01M17.8 10.4h.01" />
  </svg>
);

/** خريطة التجهيزات إلى أيقونات */
export const EQUIPMENT_ICONS: Record<string, (p: P) => React.JSX.Element> = {
  "مكيف الهواء": AirCon,
  "تكييف أوتوماتيكي": AirCon,
  "نظام ABS": BrakeDisc,
  "وسائد هوائية": Airbag,
  "قفل مركزي": Lock2,
  "زجاج كهربائي": Window,
  "راديو Bluetooth": Screen,
  "شاشة تعمل باللمس": Screen,
  "كاميرا الرجوع للخلف": Camera,
  "حساسات ركن": Radar,
  "مثبت السرعة": Cruise,
  "جنطات ألومنيوم": Wheel,
  GPS: Navigation,
  "فتحة سقف": Sunroof,
  "مقاعد جلدية": Seat,
  "أضواء LED": Headlight,
  "مقود متعدد الوظائف": Steering,
  "نظام ESP": Drivetrain,
  "لوحة عدادات رقمية": Odometer,
  "مقبض مسخّن": Steering,
  "حقائب جانبية": Seat,
  "درع واقي للمحرك": EngineBlock,
  "عادم رياضي": Exhaust,
  "إطارات جديدة": Tire,
  "شاحن USB": Battery,
  "زجاج أمامي عالٍ": Window,
  "نظام تحكم في الجر": Drivetrain,
  "وضعيات قيادة متعددة": AutoGear,
};

/** إيميل — ظرف */
export const Mail = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.6" y="5" width="18.8" height="14" rx="2.2" />
    <path d="m3.4 6.8 7.5 5.3a2 2 0 0 0 2.2 0l7.5-5.3" />
  </svg>
);

/** إرسال — طائرة ورقية */
export const Send = (p: P) => (
  <svg {...base(p)}>
    <path d="M21.4 2.6 10.6 13.4" />
    <path d="M21.4 2.6 14.6 21.4l-4-8-8-4z" />
  </svg>
);

/** واتساب — سماعة داخل فقاعة محادثة */
export const Whatsapp = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.2 20.8 4.6 16.6a8.6 8.6 0 1 1 3.2 3.1z" />
    <path d="M9 9.4c0 3.2 2.4 5.6 5.6 5.6l1-1.4-2-1-.9 1a5.6 5.6 0 0 1-2.3-2.3l1-.9-1-2z" />
  </svg>
);

/** أيقونات الأدلة — مفاتيحها مخزنة مع بيانات الدليل */
export const GUIDE_ICONS = {
  ClipboardCheck, Diagnostic, Odometer, FileText, OilCan, Moto, Piston, BrakeRotor,
} as const;

/* ---------- خريطة الأسماء للاستعمال الديناميكي ---------- */
export const FUEL_ICONS = { diesel: Droplet, essence: Fuel, hybride: Leaf, electrique: Bolt } as const;
export const BODY_ICONS = {
  citadine: Hatchback, berline: Car, suv: Suv, break: Wagon, utilitaire: Van,
  cabriolet: Convertible, scooter: Scooter, roadster: Moto, trail: MotoTrail,
  sportive: MotoSport, custom: MotoCustom,
} as const;
