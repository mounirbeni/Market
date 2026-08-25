import type { SVGProps } from "react";

/* ============================================================
   نظام الأيقونات — خطية، 24×24، تتبع لون النص (currentColor)
   لا تُستعمل الرموز التعبيرية في أي مكان بالواجهة
   ============================================================ */

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "size"> {
  size?: number | string;
  strokeWidth?: number;
}

function base({ size = 20, strokeWidth = 1.75, ...rest }: IconProps) {
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
export const External = (p: P) => (
  <svg {...base(p)}><path d="M14 4h6v6M20 4l-8 8" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
);

/* ---------- إجراءات ---------- */
export const Heart = ({ filled, ...p }: P & { filled?: boolean }) => (
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
export const Bell = (p: P) => (
  <svg {...base(p)}>
    <path d="M6.5 9a5.5 5.5 0 0 1 11 0c0 6 2 7.5 2 7.5h-15S6.5 15 6.5 9" />
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
export const Door = (p: P) => (
  <svg {...base(p)}><path d="M5 21V4a1 1 0 0 1 .8-1l10-2A1 1 0 0 1 17 2v19" /><path d="M3 21h18" /><circle cx="13.5" cy="12" r="1" /></svg>
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
export const Star = ({ filled, ...p }: P & { filled?: boolean }) => (
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
export const Crash = (p: P) => (
  <svg {...base(p)}><path d="m13 2-3.5 8h5L11 22" /><path d="M3.5 7 6 9M20.5 7 18 9M3 15h3M18 15h3" /></svg>
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

/* ---------- خريطة الأسماء للاستعمال الديناميكي ---------- */
export const FUEL_ICONS = { diesel: Droplet, essence: Fuel, hybride: Leaf, electrique: Bolt } as const;
export const BODY_ICONS = {
  citadine: Hatchback, berline: Car, suv: Suv, break: Wagon, utilitaire: Van,
  cabriolet: Convertible, scooter: Scooter, roadster: Moto, trail: MotoTrail,
  sportive: MotoSport, custom: MotoCustom,
} as const;
