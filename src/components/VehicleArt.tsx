import type { Body, VehicleKind } from "@/lib/types";
import { hashCode } from "@/lib/data/seed";

/* ---------- ظلال الخلفية: تدرّجات مستوحاة من ألوان المغرب ---------- */
const PALETTES: [string, string][] = [
  ["#0f2f3d", "#123a2f"], // أطلس
  ["#2a1a3d", "#3d1f33"], // مجوريل
  ["#33240f", "#3d2b12"], // صحراء
  ["#0e2a44", "#152c53"], // محيط
  ["#3a1717", "#2a1330"], // طين
  ["#12312b", "#1c3a1e"], // نخيل
];

/* ---------- ظلال السيارة ---------- */
const CAR_PATHS: Record<string, string> = {
  berline:
    "M26 152 L26 124 Q26 108 50 103 L128 96 L168 64 Q178 55 198 54 L256 54 Q276 55 288 66 L318 96 L364 103 Q384 107 384 126 L384 152 Z",
  citadine:
    "M42 152 L42 122 Q42 107 64 102 L132 95 L170 62 Q180 54 200 53 L252 53 Q272 54 282 66 L316 100 L352 104 Q370 108 370 126 L370 152 Z",
  suv:
    "M26 150 L26 116 Q26 100 50 96 L120 90 L156 56 Q166 48 188 47 L268 47 Q290 48 300 58 L332 92 L370 98 Q388 102 388 120 L388 150 Z",
  break:
    "M26 152 L26 122 Q26 107 50 102 L126 95 L166 60 Q176 52 196 51 L288 51 Q306 52 314 62 L330 96 L368 102 Q386 106 386 124 L386 152 Z",
  utilitaire:
    "M26 152 L26 116 Q26 100 48 96 L120 90 L150 54 Q158 46 178 46 L214 46 L214 90 L330 90 L330 46 L346 46 Q368 48 372 66 L380 118 L380 152 Z",
  cabriolet:
    "M30 152 L30 122 Q30 107 54 102 L134 94 L176 74 Q188 66 206 66 L262 66 Q282 68 292 78 L320 96 L364 103 Q382 107 382 126 L382 152 Z",
};

const CAR_WINDOWS: Record<string, string[]> = {
  berline: [
    "M146 94 L176 68 Q182 63 194 63 L214 63 L214 92 Z",
    "M224 63 L252 63 Q264 64 270 70 L292 94 L224 92 Z",
  ],
  citadine: [
    "M150 93 L178 66 Q184 61 196 61 L216 61 L216 91 Z",
    "M226 61 L250 61 Q262 62 268 68 L292 93 L226 91 Z",
  ],
  suv: [
    "M136 88 L164 60 Q170 55 184 55 L212 55 L212 87 Z",
    "M222 55 L262 55 Q276 56 282 62 L306 88 L222 87 Z",
  ],
  break: [
    "M144 92 L172 64 Q178 59 190 59 L212 59 L212 91 Z",
    "M222 59 L262 59 Q274 60 280 66 L302 92 L222 91 Z",
  ],
  utilitaire: ["M132 88 L158 58 Q164 52 178 52 L206 52 L206 87 Z"],
  cabriolet: ["M150 92 L180 76 Q188 71 200 71 L218 71 L218 90 Z"],
};

/* ---------- ظلال الدراجات ---------- */
const MOTO_PATHS: Record<string, { body: string; extra: string }> = {
  scooter: {
    body: "M96 148 Q96 118 128 112 L176 108 Q196 106 206 92 L222 74 Q228 66 242 66 L266 66 Q276 66 276 76 L276 96 Q276 108 262 112 L236 118 Q220 122 214 136 L206 150 Z",
    extra: "M232 70 L296 62 Q308 60 310 68 L296 74 L236 82 Z",
  },
  roadster: {
    body: "M92 146 Q104 116 138 112 L182 108 L206 84 Q214 76 228 76 L262 76 Q274 78 276 88 L280 108 Q282 120 268 124 L226 130 Q206 134 198 146 Z",
    extra: "M258 72 L300 64 Q312 62 314 70 L302 78 L266 86 Z",
  },
  trail: {
    body: "M88 142 Q100 108 136 104 L184 100 L204 74 Q212 64 228 64 L264 64 Q278 66 280 78 L286 104 Q288 116 272 120 L228 126 Q206 130 196 144 Z",
    extra: "M254 60 L302 50 Q316 48 318 58 L304 66 L262 76 Z",
  },
  sportive: {
    body: "M92 148 Q106 118 142 112 L190 104 L216 86 Q226 78 244 80 L276 86 Q288 90 286 102 L280 118 Q276 128 260 128 L220 132 Q202 136 196 148 Z",
    extra: "M262 78 L304 68 Q316 66 316 76 L300 84 L266 92 Z",
  },
  custom: {
    body: "M84 148 Q96 122 132 118 L186 112 L208 92 Q216 84 232 84 L268 84 Q282 86 284 98 L286 114 Q286 124 272 126 L222 132 Q202 136 194 148 Z",
    extra: "M256 80 L308 70 Q322 68 322 78 L306 86 L262 94 Z",
  },
};

function motoKey(body: Body): keyof typeof MOTO_PATHS {
  if (body === "scooter") return "scooter";
  if (body === "trail") return "trail";
  if (body === "sportive") return "sportive";
  if (body === "custom") return "custom";
  return "roadster";
}

function carKey(body: Body): string {
  if (body in CAR_PATHS) return body;
  return "berline";
}

export interface VehicleArtProps {
  id: string;
  kind: VehicleKind;
  body: Body;
  /** رقم الصورة داخل المعرض — يغيّر الزاوية والإضاءة */
  variant?: number;
  className?: string;
  label?: string;
}

export function VehicleArt({
  id,
  kind,
  body,
  variant = 0,
  className,
  label,
}: VehicleArtProps) {
  const h = hashCode(id + variant);
  const [c1, c2] = PALETTES[h % PALETTES.length];
  const uid = `${id}-${variant}`;
  const isMoto = kind === "moto";
  const zoom = 1 + (variant % 3) * 0.12;
  const shiftX = ((h >> 3) % 20) - 10 + (variant % 2) * 18;

  return (
    <svg
      viewBox="0 0 400 200"
      className={className}
      role="img"
      aria-label={label ?? "صورة المركبة"}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="15%" r="70%">
          <stop offset="0%" stopColor="#e9b44c" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#e9b44c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`paint-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3f5f9" />
          <stop offset="55%" stopColor="#cdd5e2" />
          <stop offset="100%" stopColor="#8e99ad" />
        </linearGradient>
        <pattern
          id={`zell-${uid}`}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke="#e9b44c" strokeOpacity="0.16" strokeWidth="0.8">
            <path d="M20 0 L40 20 L20 40 L0 20 Z" />
            <path d="M20 8 L32 20 L20 32 L8 20 Z" />
            <circle cx="20" cy="20" r="3" />
          </g>
        </pattern>
      </defs>

      <rect width="400" height="200" fill={`url(#bg-${uid})`} />
      <rect width="400" height="200" fill={`url(#zell-${uid})`} />
      <rect width="400" height="200" fill={`url(#glow-${uid})`} />

      <g transform={`translate(${shiftX} 6) scale(${zoom}) translate(${(1 - zoom) * 200} ${(1 - zoom) * 110})`}>
        {/* الظل الأرضي */}
        <ellipse cx="205" cy="164" rx="150" ry="11" fill="#000" opacity="0.35" />

        {isMoto ? (
          <>
            <g fill="none" stroke="#0b0f16" strokeWidth="7" opacity="0.9">
              <circle cx="118" cy="140" r="30" />
              <circle cx="286" cy="140" r="30" />
            </g>
            <g fill="none" stroke="#96a3b8" strokeWidth="2.5">
              <circle cx="118" cy="140" r="30" />
              <circle cx="286" cy="140" r="30" />
              <circle cx="118" cy="140" r="11" />
              <circle cx="286" cy="140" r="11" />
            </g>
            <path d={MOTO_PATHS[motoKey(body)].extra} fill="#4a556b" />
            <path
              d={MOTO_PATHS[motoKey(body)].body}
              fill={`url(#paint-${uid})`}
              stroke="#0b0f16"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M118 140 L200 122 L286 140"
              stroke="#2b3546"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="300" cy="92" r="9" fill="#f5c765" opacity="0.9" />
          </>
        ) : (
          <>
            <path
              d={CAR_PATHS[carKey(body)]}
              fill={`url(#paint-${uid})`}
              stroke="#0b0f16"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {CAR_WINDOWS[carKey(body)].map((d, i) => (
              <path key={i} d={d} fill="#1b2534" opacity="0.92" />
            ))}
            <path
              d="M30 148 L384 148"
              stroke="#0b0f16"
              strokeWidth="2"
              opacity="0.35"
            />
            <circle cx="372" cy="118" r="7" fill="#f5c765" opacity="0.85" />
            <circle cx="34" cy="120" r="5" fill="#c75b39" opacity="0.8" />
            <g stroke="#0b0f16" strokeWidth="8" fill="none">
              <circle cx="112" cy="152" r="28" />
              <circle cx="300" cy="152" r="28" />
            </g>
            <g stroke="#9aa6bb" strokeWidth="2.5" fill="#151b26">
              <circle cx="112" cy="152" r="28" />
              <circle cx="300" cy="152" r="28" />
            </g>
            <g fill="#6d7a92">
              <circle cx="112" cy="152" r="11" />
              <circle cx="300" cy="152" r="11" />
            </g>
          </>
        )}
      </g>

      <text
        x="16"
        y="188"
        fill="#e9b44c"
        opacity="0.5"
        fontSize="11"
        fontFamily="monospace"
        letterSpacing="3"
      >
        TRIQ
      </text>
    </svg>
  );
}
