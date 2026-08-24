import type { Body, VehicleKind } from "@/lib/types";

/** شكل العرض: أنواع الهياكل + البيك أب كشكل مستقل */
export type ArtShape = Body | "pickup";
import { hashCode } from "@/lib/data/seed";

/* ============================================================
   رسوم المركبات — مولّدة بالكامل كـ SVG (بدون صور خارجية)
   إطار العمل: 400×250، الأرض عند y=205، المركبة متجهة نحو اليمين
   ============================================================ */

const PALETTES: [string, string][] = [
  ["#0f2f3d", "#123a2f"],
  ["#2a1a3d", "#3d1f33"],
  ["#33240f", "#3d2b12"],
  ["#0e2a44", "#152c53"],
  ["#3a1717", "#2a1330"],
  ["#12312b", "#1c3a1e"],
];

const PAINTS: [string, string, string][] = [
  ["#f4f6fa", "#ccd4e2", "#8b97ab"],
  ["#c9d3e4", "#93a1b8", "#5d6a80"],
  ["#e6dccb", "#c2b49c", "#877b66"],
  ["#cfd8d6", "#9fb0ad", "#68797a"],
];

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
  /** رقم الصورة داخل المعرض — يغيّر الزاوية والإضاءة */
  variant?: number;
  className?: string;
  label?: string;
}

export function VehicleArt({ id, kind, body, variant = 0, className, label }: VehicleArtProps) {
  const h = hashCode(id);
  const [c1, c2] = PALETTES[h % PALETTES.length];
  const [p1, p2, p3] = PAINTS[(h >>> 4) % PAINTS.length];
  const uid = `${id}-${variant}`;
  const isMoto = kind === "moto";

  const zoom = 1 + (variant % 3) * 0.08;
  const shiftX = ((variant % 4) - 1.5) * 14;

  const spec = CAR_SPECS[carKey(body, kind)];
  const moto = motoArt(body);

  const fillOf = (f: "paint" | "dark" | "accent") =>
    f === "paint" ? `url(#paint-${uid})` : f === "dark" ? "#2b3546" : "#e9b44c";

  return (
    <svg
      viewBox="0 0 400 250"
      className={className}
      role="img"
      aria-label={label ?? "رسم المركبة"}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="12%" r="72%">
          <stop offset="0%" stopColor="#e9b44c" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#e9b44c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`paint-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p1} />
          <stop offset="55%" stopColor={p2} />
          <stop offset="100%" stopColor={p3} />
        </linearGradient>
        <pattern id={`zell-${uid}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#e9b44c" strokeOpacity="0.15" strokeWidth="0.8">
            <path d="M20 0 L40 20 L20 40 L0 20 Z" />
            <path d="M20 8 L32 20 L20 32 L8 20 Z" />
            <circle cx="20" cy="20" r="3" />
          </g>
        </pattern>
      </defs>

      <rect width="400" height="250" fill={`url(#bg-${uid})`} />
      <rect width="400" height="250" fill={`url(#zell-${uid})`} />
      <rect width="400" height="250" fill={`url(#glow-${uid})`} />

      <g
        transform={`translate(${shiftX} 0) scale(${zoom}) translate(${(1 - zoom) * 200} ${(1 - zoom) * 150})`}
      >
        <ellipse cx="204" cy="212" rx="162" ry="12" fill="#000" opacity="0.34" />

        {isMoto ? (
          <>
            {/* الذراع الخلفي والشوكة */}
            <path
              d={`M${moto.rearWheel[0]} ${moto.rearWheel[1]} L${moto.swingarmTo[0]} ${moto.swingarmTo[1]}`}
              stroke="#3b465a" strokeWidth="11" strokeLinecap="round" fill="none"
            />
            <path
              d={`M${moto.frontWheel[0]} ${moto.frontWheel[1]} L${moto.fork[0]} ${moto.fork[1]}`}
              stroke="#7c8aa2" strokeWidth="9" strokeLinecap="round" fill="none"
            />
            <path d={moto.bars} stroke="#2b3546" strokeWidth="6" strokeLinecap="round" fill="none" />

            {moto.engine && (
              <path d={moto.engine} fill="#39445a" stroke="#0b0f16" strokeWidth="2.2" strokeLinejoin="round" />
            )}
            {moto.exhaust && (
              <path d={moto.exhaust} fill="#5d6a80" stroke="#0b0f16" strokeWidth="2" strokeLinejoin="round" />
            )}
            {moto.extras?.map((e, i) => (
              <path key={i} d={e.d} fill={fillOf(e.fill)} stroke="#0b0f16" strokeWidth="2.2" strokeLinejoin="round" />
            ))}
            <path
              d={moto.bodywork}
              fill={`url(#paint-${uid})`}
              stroke="#0b0f16"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />

            <circle
              cx={moto.headlight[0]} cy={moto.headlight[1]} r={moto.headlight[2]}
              fill="#f5c765" stroke="#0b0f16" strokeWidth="2"
            />

            {/* العجلات */}
            {[moto.rearWheel, moto.frontWheel].map(([cx, cy, r], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r={r} fill="#0b0f16" />
                <circle cx={cx} cy={cy} r={r - 6} fill="none" stroke="#8d99ad" strokeWidth="3" />
                <circle cx={cx} cy={cy} r={r - 14} fill="none" stroke="#5b6780" strokeWidth="2" />
                <circle cx={cx} cy={cy} r="5" fill="#8d99ad" />
              </g>
            ))}
          </>
        ) : (
          <>
            <path
              d={carPath(spec)}
              fill={`url(#paint-${uid})`}
              stroke="#0b0f16"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            {carWindows(spec).map((d, i) => (
              <path key={i} d={d} fill="#1b2534" stroke="#0b0f16" strokeWidth="1.6" />
            ))}

            {/* أقواس العجلات */}
            <g fill="none" stroke="#0b0f16" strokeWidth="2.4" opacity="0.5">
              <path d={`M${spec.rearWheelX - spec.wheelR - 5} ${GROUND} A${spec.wheelR + 5} ${spec.wheelR + 5} 0 0 1 ${spec.rearWheelX + spec.wheelR + 5} ${GROUND}`} />
              <path d={`M${spec.frontWheelX - spec.wheelR - 5} ${GROUND} A${spec.wheelR + 5} ${spec.wheelR + 5} 0 0 1 ${spec.frontWheelX + spec.wheelR + 5} ${GROUND}`} />
            </g>

            {/* الأضواء ومقبض الباب */}
            <rect x={spec.noseX - 22} y={spec.beltY + 13} width="18" height="8" rx="3"
              fill="#f5c765" stroke="#0b0f16" strokeWidth="1.5" />
            <rect x={spec.tailX + 3} y={spec.beltY + (spec.rear === "notch" ? -2 : 8)} width="13" height="9" rx="3"
              fill="#c75b39" stroke="#0b0f16" strokeWidth="1.5" />
            <path d={`M${spec.windshieldX - 70} ${spec.beltY + 14} L${spec.windshieldX - 52} ${spec.beltY + 13}`}
              stroke="#0b0f16" strokeWidth="3" strokeLinecap="round" opacity="0.45" />

            {/* العجلات */}
            {[spec.rearWheelX, spec.frontWheelX].map((x) => (
              <g key={x}>
                <circle cx={x} cy={spec.axleY} r={spec.wheelR} fill="#0b0f16" />
                <circle cx={x} cy={spec.axleY} r={spec.wheelR - 8} fill="none" stroke="#8d99ad" strokeWidth="3" />
                <circle cx={x} cy={spec.axleY} r={spec.wheelR - 17} fill="#4a556b" />
              </g>
            ))}
          </>
        )}
      </g>

      <text x="16" y="236" fill="#e9b44c" opacity="0.45" fontSize="11" fontFamily="monospace" letterSpacing="3">
        TRIQ
      </text>
    </svg>
  );
}
