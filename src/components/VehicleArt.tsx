import type { Body, VehicleKind } from "@/lib/types";

/** شكل العرض: أنواع الهياكل + البيك أب كشكل مستقل */
export type ArtShape = Body | "pickup";
import { hashCode } from "@/lib/rng";

/* ============================================================
   رسوم المركبات — مولّدة بالكامل كـ SVG (بدون صور خارجية)
   إطار العمل: 400×250، الأرض عند y=205، المركبة متجهة نحو اليمين
   ============================================================ */

/** خلفية استوديو موحّدة — تنويع محدود في درجة اللون فقط */
/** خلفية استوديو فاتحة: [أعلى، أسفل، لون التمييز] */
const BACKDROPS: [string, string, string][] = [
  ["#eaf2fd", "#d2e0f3", "#1f5fe0"],
  ["#edf3fa", "#d6e2f0", "#14386e"],
  ["#e8f0fd", "#cfdef4", "#1550cc"],
  ["#eef3f9", "#d9e3ee", "#4a5c78"],
  ["#e9f3fb", "#d1e3f1", "#0d9488"],
];

/** ألوان الطلاء الحقيقية حسب اللون المعلن */
const PAINTS: Record<string, [string, string, string]> = {
  "أبيض": ["#ffffff", "#e6ecf5", "#a9b6c8"],
  "أسود": ["#414958", "#262d3a", "#12161e"],
  "أسود مطفي": ["#333a45", "#212730", "#12161e"],
  "رمادي": ["#a8b2c1", "#78838f", "#4a535f"],
  "فضي": ["#dbe1ea", "#adb6c4", "#767f8d"],
  "أزرق ليلي": ["#4570b4", "#2a4a86", "#172a53"],
  "أزرق": ["#4c83d0", "#2f5da4", "#1c3a6d"],
  "أحمر": ["#e2564a", "#b8342b", "#7c1c17"],
  "بيج": ["#ece0c9", "#cdb995", "#96835f"],
  "بني": ["#9a6f4d", "#6f4c31", "#43301f"],
  "برتقالي": ["#f5923f", "#d2681d", "#8f4512"],
};

const PAINT_FALLBACK: [string, string, string] = ["#dbe1ea", "#a9b3c2", "#6e7889"];

/* ---------------- السيارات ---------------- */

interface CarSpec {
  tailX: number;
  noseX: number;
  /** خط الحزام: أعلى الجسم السفلي (أسفل الزجاج) */
  beltY: number;
  roofY: number;
  /** المقدمة على اليمين: مؤخرة السقف = x صغير */
  roofRearX: number;
  roofFrontX: number;
  /** أسفل الزجاج الخلفي على غطاء الصندوق */
  rearGlassX: number;
  /** أسفل الزجاج الأمامي على الحزام */
  windshieldX: number;
  rear: "notch" | "hatch" | "wagon" | "van" | "pickup" | "open";
  trunkTopY?: number;
  bedY?: number;
  cabRearX?: number;
  axleY: number;
  wheelR: number;
  rearWheelX: number;
  frontWheelX: number;
}

const GROUND = 205;

const CAR_SPECS: Record<string, CarSpec> = {
  berline: {
    tailX: 26, noseX: 380, beltY: 150, roofY: 104,
    roofRearX: 160, roofFrontX: 252, rearGlassX: 116, windshieldX: 302,
    rear: "notch", trunkTopY: 140,
    axleY: 175, wheelR: 30, rearWheelX: 100, frontWheelX: 308,
  },
  citadine: {
    tailX: 42, noseX: 372, beltY: 150, roofY: 102,
    roofRearX: 96, roofFrontX: 244, rearGlassX: 48, windshieldX: 294,
    rear: "hatch",
    axleY: 175, wheelR: 30, rearWheelX: 110, frontWheelX: 302,
  },
  break: {
    tailX: 26, noseX: 380, beltY: 148, roofY: 100,
    roofRearX: 50, roofFrontX: 250, rearGlassX: 34, windshieldX: 300,
    rear: "wagon",
    axleY: 175, wheelR: 30, rearWheelX: 100, frontWheelX: 308,
  },
  suv: {
    tailX: 30, noseX: 378, beltY: 136, roofY: 80,
    roofRearX: 56, roofFrontX: 250, rearGlassX: 38, windshieldX: 300,
    rear: "wagon",
    axleY: 169, wheelR: 36, rearWheelX: 104, frontWheelX: 306,
  },
  utilitaire: {
    tailX: 26, noseX: 374, beltY: 140, roofY: 64,
    roofRearX: 46, roofFrontX: 234, rearGlassX: 34, windshieldX: 288,
    rear: "van",
    axleY: 175, wheelR: 30, rearWheelX: 96, frontWheelX: 306,
  },
  pickup: {
    tailX: 26, noseX: 378, beltY: 142, roofY: 84,
    roofRearX: 226, roofFrontX: 274, rearGlassX: 214, windshieldX: 310,
    rear: "pickup", bedY: 152, cabRearX: 214,
    axleY: 171, wheelR: 34, rearWheelX: 98, frontWheelX: 312,
  },
  cabriolet: {
    tailX: 30, noseX: 378, beltY: 150, roofY: 122,
    roofRearX: 236, roofFrontX: 274, rearGlassX: 150, windshieldX: 300,
    rear: "open",
    axleY: 175, wheelR: 30, rearWheelX: 104, frontWheelX: 308,
  },
};

function carPath(s: CarSpec): string {
  const p: string[] = [`M${s.tailX} ${GROUND}`];

  switch (s.rear) {
    case "notch":
      // صندوق خلفي ثم زجاج مائل
      p.push(`L${s.tailX} ${s.trunkTopY! + 6}`);
      p.push(`Q${s.tailX} ${s.trunkTopY!} ${s.tailX + 16} ${s.trunkTopY!}`);
      p.push(`L${s.rearGlassX + 8} ${s.trunkTopY! - 2}`);
      p.push(`L${s.roofRearX} ${s.roofY}`);
      break;
    case "hatch":
      p.push(`L${s.tailX} ${s.beltY - 10}`);
      p.push(`Q${s.tailX - 4} ${s.beltY - 26} ${s.roofRearX - 14} ${s.roofY + 10}`);
      p.push(`L${s.roofRearX} ${s.roofY}`);
      break;
    case "wagon":
      p.push(`L${s.tailX} ${s.roofY + 24}`);
      p.push(`Q${s.tailX} ${s.roofY + 2} ${s.roofRearX} ${s.roofY}`);
      break;
    case "van":
      p.push(`L${s.tailX} ${s.roofY + 14}`);
      p.push(`Q${s.tailX} ${s.roofY} ${s.roofRearX} ${s.roofY}`);
      break;
    case "pickup":
      p.push(`L${s.tailX} ${s.bedY!}`);
      p.push(`L${s.cabRearX!} ${s.bedY!}`);
      p.push(`L${s.cabRearX!} ${s.roofY + 8}`);
      p.push(`Q${s.cabRearX!} ${s.roofY} ${s.roofRearX} ${s.roofY}`);
      break;
    case "open":
      p.push(`L${s.tailX} ${s.beltY - 12}`);
      p.push(`Q${s.tailX + 8} ${s.beltY - 22} ${s.tailX + 46} ${s.beltY - 22}`);
      p.push(`L${s.roofRearX} ${s.beltY - 20}`);
      p.push(`L${s.roofFrontX} ${s.roofY}`);
      break;
  }

  if (s.rear !== "open") {
    p.push(`L${s.roofFrontX} ${s.roofY}`);
  }
  p.push(`L${s.windshieldX} ${s.beltY}`);
  p.push(`L${s.noseX - 26} ${s.beltY + 5}`);
  p.push(`Q${s.noseX} ${s.beltY + 9} ${s.noseX} ${s.beltY + 28}`);
  p.push(`L${s.noseX} ${GROUND}`);
  p.push("Z");
  return p.join(" ");
}

function carWindows(s: CarSpec): string[] {
  const top = s.roofY + 10;
  const bottom = s.beltY - 7;

  if (s.rear === "open") {
    return [
      `M${s.windshieldX - 8} ${bottom} L${s.roofFrontX + 4} ${s.roofY + 8} L${s.roofFrontX - 16} ${s.roofY + 8} L${s.windshieldX - 34} ${bottom} Z`,
    ];
  }

  const mid = (s.roofFrontX + s.roofRearX) / 2;
  // الزجاج الأمامي والباب الأمامي
  const front = `M${s.windshieldX - 12} ${bottom} L${s.roofFrontX - 6} ${top} L${mid + 6} ${top} L${mid + 6} ${bottom} Z`;
  if (s.rear === "van" || s.rear === "pickup") return [front];

  const rearTopX = s.rear === "notch" ? s.roofRearX + 10 : s.roofRearX + 12;
  const rearBottomX = s.rear === "notch" ? s.rearGlassX + 20 : s.tailX + 16;
  const rear = `M${mid - 4} ${bottom} L${mid - 4} ${top} L${rearTopX} ${top} L${rearBottomX} ${bottom} Z`;
  return [front, rear];
}

function carKey(body: ArtShape, kind: VehicleKind): string {
  if (kind === "moto") return "berline";
  if (body in CAR_SPECS) return body;
  return "berline";
}

/* ---------------- الدراجات ---------------- */

interface MotoArt {
  rearWheel: [number, number, number];
  frontWheel: [number, number, number];
  /** أعلى الشوكة الأمامية */
  fork: [number, number];
  bars: string;
  swingarmTo: [number, number];
  /** الهيكل الظاهر: الخزان + المقعد + الذيل كقطعة واحدة */
  bodywork: string;
  engine?: string;
  exhaust?: string;
  extras?: { d: string; fill: "paint" | "dark" | "accent" }[];
  headlight: [number, number, number];
}

function motoArt(body: ArtShape): MotoArt {
  switch (body) {
    case "scooter":
      return {
        rearWheel: [118, 179, 26],
        frontWheel: [292, 179, 26],
        fork: [278, 124],
        bars: "M262 112 L292 104",
        swingarmTo: [186, 168],
        headlight: [292, 122, 10],
        bodywork:
          "M124 170 Q110 134 148 128 L212 120 Q230 118 232 134 L240 168 Z",
        extras: [
          // الدرع الأمامي
          { d: "M258 176 Q248 132 270 112 L286 100 Q300 104 294 120 L278 136 Q272 154 276 176 Z", fill: "paint" },
          // الأرضية
          { d: "M154 164 L260 158 L262 176 L154 180 Z", fill: "dark" },
          // المقعد
          { d: "M136 132 Q128 120 148 118 L206 112 Q220 114 216 130 L144 138 Z", fill: "dark" },
        ],
      };
    case "trail":
      return {
        rearWheel: [100, 166, 39],
        frontWheel: [300, 166, 39],
        fork: [272, 88],
        bars: "M254 80 L288 72",
        swingarmTo: [186, 156],
        headlight: [288, 96, 11],
        bodywork:
          "M116 112 Q110 100 126 98 L192 96 Q204 78 238 82 Q268 88 272 106 Q274 120 256 120 L196 116 L130 122 Q118 122 116 112 Z",
        engine: "M188 120 L244 116 Q252 116 252 124 L250 156 Q248 164 238 164 L198 162 Q188 160 188 148 Z",
        exhaust: "M192 158 L126 148 Q114 147 114 155 Q114 163 126 163 L194 168 Z",
        extras: [
          { d: "M258 74 Q286 64 302 78 L280 88 Z", fill: "paint" },
          { d: "M244 76 Q262 46 286 50 L280 66 Q264 66 256 82 Z", fill: "dark" },
        ],
      };
    case "sportive":
      return {
        rearWheel: [108, 169, 36],
        frontWheel: [300, 169, 36],
        fork: [276, 112],
        bars: "M258 106 L282 98",
        headlight: [300, 118, 9],
        swingarmTo: [190, 160],
        bodywork:
          "M116 116 Q108 104 124 100 L192 104 Q206 92 236 96 Q264 102 268 122 Q270 138 252 138 L200 132 L132 130 Q118 128 116 116 Z",
        engine: "M192 132 L248 128 Q256 128 256 136 L254 168 Q252 176 242 176 L202 174 Q192 172 192 160 Z",
        exhaust: "M196 170 L132 160 Q120 159 120 167 Q120 175 132 175 L198 180 Z",
        extras: [
          // الحاضنة الأمامية
          { d: "M252 108 Q288 94 308 116 Q314 142 298 162 L268 162 Q248 140 252 108 Z", fill: "paint" },
          // الذيل المرتفع
          { d: "M104 104 L150 96 L158 116 L112 124 Z", fill: "paint" },
        ],
      };
    case "custom":
      return {
        rearWheel: [88, 169, 36],
        frontWheel: [318, 169, 36],
        fork: [276, 92],
        bars: "M256 84 L294 74",
        swingarmTo: [176, 162],
        headlight: [292, 104, 12],
        bodywork:
          "M112 136 Q104 124 122 120 L186 116 Q200 96 232 100 Q262 106 266 126 Q268 140 250 140 L196 136 L128 146 Q114 146 112 136 Z",
        engine: "M180 138 L238 134 Q246 134 246 142 L244 172 Q242 180 232 180 L190 178 Q180 176 180 164 Z",
        exhaust: "M184 172 L104 162 Q92 161 92 169 Q92 177 104 177 L186 182 Z",
        extras: [
          // رفراف خلفي عريض
          { d: "M46 156 Q88 116 134 152 L124 164 Q88 136 56 168 Z", fill: "paint" },
        ],
      };
    default: // roadster
      return {
        rearWheel: [104, 169, 36],
        frontWheel: [300, 169, 36],
        fork: [272, 106],
        bars: "M254 98 L286 90",
        swingarmTo: [190, 160],
        headlight: [288, 112, 13],
        bodywork:
          "M120 128 Q112 116 130 112 L196 110 Q210 92 242 96 Q272 102 276 122 Q278 136 258 136 L204 132 L138 138 Q122 138 120 128 Z",
        engine: "M194 136 L250 132 Q258 132 258 140 L256 170 Q254 178 244 178 L204 176 Q194 174 194 162 Z",
        exhaust: "M198 172 L132 162 Q120 161 120 169 Q120 177 132 177 L200 182 Z",
      };
  }
}

/* ---------------- المكوّن ---------------- */

export interface VehicleArtProps {
  id: string;
  kind: VehicleKind;
  body: ArtShape;
  /** لون الطلاء المعلن — يُرسم كما هو */
  color?: string;
  /** رقم الصورة داخل المعرض — يغيّر الزاوية والإضاءة */
  variant?: number;
  className?: string;
  label?: string;
}

export function VehicleArt({ id, kind, body, color, variant = 0, className, label }: VehicleArtProps) {
  const h = hashCode(id);
  const [bg1, bg2, tint] = BACKDROPS[h % BACKDROPS.length];
  const [p1, p2, p3] = (color && PAINTS[color]) || PAINT_FALLBACK;
  const isDarkPaint = p3 === "#12161e" || p3 === "#43301f";
  const uid = `${id}-${variant}`;
  const isMoto = kind === "moto";

  // الصورة الأولى لقطة نظيفة مركزية، والباقي بزوايا مختلفة
  const zoom = variant === 0 ? 0.95 : 0.95 + (variant % 3) * 0.08;
  const shiftX = variant === 0 ? 0 : ((variant % 4) - 1.5) * 12;

  const spec = CAR_SPECS[carKey(body, kind)];
  const moto = motoArt(body);

  const fillOf = (f: "paint" | "dark" | "accent") =>
    f === "paint" ? `url(#paint-${uid})` : f === "dark" ? "#3a5170" : "#e9b44c";

  return (
    <svg
      viewBox="0 0 400 250"
      className={className}
      role="img"
      aria-label={label ?? "رسم المركبة"}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bg1} />
          <stop offset="62%" stopColor={bg2} />
          <stop offset="100%" stopColor={bg1} />
        </linearGradient>
        <radialGradient id={`spot-${uid}`} cx="50%" cy="6%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor={tint} stopOpacity="0.07" />
        </radialGradient>
        <linearGradient id={`floor-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1e3d" stopOpacity="0" />
          <stop offset="100%" stopColor="#0a1e3d" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={`paint-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p1} />
          <stop offset="18%" stopColor={p1} />
          <stop offset="52%" stopColor={p2} />
          <stop offset="100%" stopColor={p3} />
        </linearGradient>
        <linearGradient id={`gl-${uid}`} x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#33517c" />
          <stop offset="55%" stopColor="#1a2f4d" />
          <stop offset="100%" stopColor="#13233a" />
        </linearGradient>
        <pattern id={`zell-${uid}`} width="28" height="28" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={tint} strokeOpacity="0.055" strokeWidth="0.6">
            <path d="M14 0 L28 14 L14 28 L0 14 Z" />
            <path d="M14 5.5 L22.5 14 L14 22.5 L5.5 14 Z" />
            <circle cx="14" cy="14" r="2" />
          </g>
        </pattern>
      </defs>

      <rect width="400" height="250" fill={`url(#bg-${uid})`} />
      <rect width="400" height="250" fill={`url(#zell-${uid})`} />
      <rect width="400" height="250" fill={`url(#spot-${uid})`} />
      {/* أرضية الاستوديو */}
      <rect y="196" width="400" height="54" fill={`url(#floor-${uid})`} />
      <line x1="0" y1="196" x2="400" y2="196" stroke={tint} strokeOpacity="0.18" strokeWidth="1" />

      <g
        transform={`translate(${shiftX} 0) scale(${zoom}) translate(${(1 - zoom) * 200} ${(1 - zoom) * 150})`}
      >
        <ellipse cx="204" cy="207" rx="168" ry="10" fill="#0a1e3d" opacity="0.26" />

        {isMoto ? (
          <>
            {/* الذراع الخلفي والشوكة */}
            <path
              d={`M${moto.rearWheel[0]} ${moto.rearWheel[1]} L${moto.swingarmTo[0]} ${moto.swingarmTo[1]}`}
              stroke="#44597a" strokeWidth="11" strokeLinecap="round" fill="none"
            />
            <path
              d={`M${moto.frontWheel[0]} ${moto.frontWheel[1]} L${moto.fork[0]} ${moto.fork[1]}`}
              stroke="#8399b6" strokeWidth="9" strokeLinecap="round" fill="none"
            />
            <path d={moto.bars} stroke="#3a5170" strokeWidth="6" strokeLinecap="round" fill="none" />

            {moto.engine && (
              <path d={moto.engine} fill="#41597a" stroke="#0a1e3d" strokeWidth="2.2" strokeLinejoin="round" />
            )}
            {moto.exhaust && (
              <path d={moto.exhaust} fill="#6b809f" stroke="#0a1e3d" strokeWidth="2" strokeLinejoin="round" />
            )}
            {moto.extras?.map((e, i) => (
              <path key={i} d={e.d} fill={fillOf(e.fill)} stroke="#0a1e3d" strokeWidth="2.2" strokeLinejoin="round" />
            ))}
            <path
              d={moto.bodywork}
              fill={`url(#paint-${uid})`}
              stroke="#0a1e3d"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />

            <circle
              cx={moto.headlight[0]} cy={moto.headlight[1]} r={moto.headlight[2]}
              fill="#f5b93f" stroke="#0a1e3d" strokeWidth="2"
            />

            {/* العجلات */}
            {[moto.rearWheel, moto.frontWheel].map(([cx, cy, r], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r={r} fill="#0a1e3d" />
                <circle cx={cx} cy={cy} r={r - 6} fill="none" stroke="#93a7c1" strokeWidth="3" />
                <circle cx={cx} cy={cy} r={r - 14} fill="none" stroke="#6d84a4" strokeWidth="2" />
                <circle cx={cx} cy={cy} r="5" fill="#93a7c1" />
              </g>
            ))}
          </>
        ) : (
          <>
            <path
              d={carPath(spec)}
              fill={`url(#paint-${uid})`}
              stroke={isDarkPaint ? "#6b809f" : "#0a1e3d"}
              strokeWidth={isDarkPaint ? 2 : 2.6}
              strokeLinejoin="round"
            />
            {carWindows(spec).map((d, i) => (
              <path key={i} d={d} fill={`url(#gl-${uid})`} stroke="#0a1e3d" strokeWidth="1.6" />
            ))}

            {/* أقواس العجلات */}
            <g fill="none" stroke="#0a1e3d" strokeWidth="2.4" opacity="0.5">
              <path d={`M${spec.rearWheelX - spec.wheelR - 5} ${GROUND} A${spec.wheelR + 5} ${spec.wheelR + 5} 0 0 1 ${spec.rearWheelX + spec.wheelR + 5} ${GROUND}`} />
              <path d={`M${spec.frontWheelX - spec.wheelR - 5} ${GROUND} A${spec.wheelR + 5} ${spec.wheelR + 5} 0 0 1 ${spec.frontWheelX + spec.wheelR + 5} ${GROUND}`} />
            </g>

            {/* الأضواء ومقبض الباب */}
            <rect x={spec.noseX - 22} y={spec.beltY + 13} width="18" height="8" rx="3"
              fill="#f5b93f" stroke="#0a1e3d" strokeWidth="1.5" />
            <rect x={spec.tailX + 3} y={spec.beltY + (spec.rear === "notch" ? -2 : 8)} width="13" height="9" rx="3"
              fill="#c75b39" stroke="#0a1e3d" strokeWidth="1.5" />
            <path d={`M${spec.windshieldX - 70} ${spec.beltY + 14} L${spec.windshieldX - 52} ${spec.beltY + 13}`}
              stroke="#0a1e3d" strokeWidth="3" strokeLinecap="round" opacity="0.45" />

            {/* العجلات */}
            {[spec.rearWheelX, spec.frontWheelX].map((x) => (
              <g key={x}>
                <circle cx={x} cy={spec.axleY} r={spec.wheelR} fill="#0a1e3d" />
                <circle cx={x} cy={spec.axleY} r={spec.wheelR - 8} fill="none" stroke="#93a7c1" strokeWidth="3" />
                <circle cx={x} cy={spec.axleY} r={spec.wheelR - 17} fill="#54698a" />
              </g>
            ))}
          </>
        )}
      </g>

      <text
        x="12"
        y="242"
        fill={tint}
        opacity="0.16"
        fontSize="7"
        fontFamily="monospace"
        letterSpacing="2.5"
        direction="ltr"
        textAnchor="start"
      >
        TRIQ
      </text>
    </svg>
  );
}

/* ============================================================
   ظلّ المركبة كأيقونة — يُستعمل في الفلاتر والتصنيفات
   ============================================================ */
export function VehicleGlyph({
  shape,
  kind,
  size = 28,
  strokeWidth = 13,
  className,
  style,
}: {
  shape: ArtShape;
  kind: VehicleKind;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isMoto = kind === "moto";
  const spec = CAR_SPECS[carKey(shape, kind)];
  const moto = motoArt(shape);

  return (
    <svg
      viewBox="0 0 400 250"
      width={size * 1.6}
      height={size}
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {isMoto ? (
        <>
          <circle cx={moto.rearWheel[0]} cy={moto.rearWheel[1]} r={moto.rearWheel[2]} />
          <circle cx={moto.frontWheel[0]} cy={moto.frontWheel[1]} r={moto.frontWheel[2]} />
          <path d={`M${moto.frontWheel[0]} ${moto.frontWheel[1]} L${moto.fork[0]} ${moto.fork[1]}`} />
          <path d={`M${moto.rearWheel[0]} ${moto.rearWheel[1]} L${moto.swingarmTo[0]} ${moto.swingarmTo[1]}`} />
          <path d={moto.bodywork} />
          {moto.engine && <path d={moto.engine} />}
        </>
      ) : (
        <>
          <path d={carPath(spec)} />
          <circle cx={spec.rearWheelX} cy={spec.axleY} r={spec.wheelR} />
          <circle cx={spec.frontWheelX} cy={spec.axleY} r={spec.wheelR} />
        </>
      )}
    </svg>
  );
}
