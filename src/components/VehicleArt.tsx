import type { CSSProperties } from "react";
import type { VehicleKind } from "@/lib/types";
import {
  VehicleArt as LegacyVehicleArt,
  VehicleGlyph as LegacyVehicleGlyph,
} from "./VehicleArtLegacy";
import type { ArtShape, VehicleArtProps } from "./VehicleArtLegacy";

export type { ArtShape, VehicleArtProps } from "./VehicleArtLegacy";

/**
 * مجسمات السيارات الجديدة ديال Tarique.
 * كنستعملو sprite واحد خفيف، ولكن كنرسموه كصورة حقيقية ونقصّو الخانة
 * المطلوبة بدل background-image. هاد الطريقة كتضمن الظهور خصوصاً فـ iOS/PWA.
 * ترتيب الخانات: Citadine · Berline · SUV / Break · Utilitaire · Cabriolet.
 */
type SpriteCell = readonly [column: 0 | 1 | 2, row: 0 | 1];

const BODY_SPRITES: Partial<Record<ArtShape, SpriteCell>> = {
  citadine: [0, 0],
  berline: [1, 0],
  suv: [2, 0],
  break: [0, 1],
  utilitaire: [1, 1],
  cabriolet: [2, 1],
};

const SPRITE_URL = "/vehicle-bodies/neon-sprite.webp";

function spriteCell(shape: ArtShape, kind: VehicleKind) {
  if (kind !== "car") return null;
  return BODY_SPRITES[shape] ?? null;
}

function CroppedSprite({ cell }: { cell: SpriteCell }) {
  const [column, row] = cell;

  return (
    <span
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, display: "block", overflow: "hidden" }}
    >
      <img
        src={SPRITE_URL}
        alt=""
        draggable={false}
        loading="eager"
        decoding="async"
        style={{
          position: "absolute",
          left: `${-column * 100}%`,
          top: `${-row * 100}%`,
          width: "300%",
          height: "200%",
          maxWidth: "none",
          display: "block",
          objectFit: "fill",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </span>
  );
}

function NeonVehicle({
  cell,
  className,
  style,
  label,
  variant = 0,
}: {
  cell: SpriteCell;
  className?: string;
  style?: CSSProperties;
  label?: string;
  variant?: number;
}) {
  const scale = variant === 0 ? 1 : 1.02 + (variant % 3) * 0.015;

  return (
    <span
      className={`relative block overflow-hidden ${className ?? ""}`}
      style={{
        background:
          "radial-gradient(circle at 50% 46%, rgba(31,95,224,.18), transparent 55%), linear-gradient(145deg, #071225 0%, #0a1930 52%, #07111f 100%)",
        ...style,
      }}
      role="img"
      aria-label={label ?? "مجسم المركبة"}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "96%",
          aspectRatio: "1 / 1",
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
          filter: "drop-shadow(0 7px 16px rgba(31,95,224,.24))",
        }}
      >
        <CroppedSprite cell={cell} />
      </span>
    </span>
  );
}

export function VehicleArt(props: VehicleArtProps) {
  const cell = spriteCell(props.body, props.kind);
  if (!cell) return <LegacyVehicleArt {...props} />;

  return (
    <NeonVehicle
      cell={cell}
      className={props.className}
      label={props.label}
      variant={props.variant}
    />
  );
}

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
  style?: CSSProperties;
}) {
  const cell = spriteCell(shape, kind);
  if (!cell) {
    return (
      <LegacyVehicleGlyph
        shape={shape}
        kind={kind}
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        style={style}
      />
    );
  }

  return (
    <span
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        width: size * 2.4,
        height: size * 1.45,
        overflow: "hidden",
        flexShrink: 0,
        filter: "drop-shadow(0 3px 8px rgba(31,95,224,.32))",
        ...style,
      }}
      aria-hidden="true"
    >
      <span
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "100%",
          aspectRatio: "1 / 1",
          transform: "translate(-50%, -50%) scale(1.08)",
        }}
      >
        <CroppedSprite cell={cell} />
      </span>
    </span>
  );
}
