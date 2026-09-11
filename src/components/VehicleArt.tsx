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
 * الصورة Sprite وحدة باش نحافظو على تحميل خفيف وسريع فالموبايل.
 * ترتيب الخانات: Citadine · Berline · SUV / Break · Utilitaire · Cabriolet.
 */
const BODY_SPRITES: Partial<Record<ArtShape, string>> = {
  citadine: "0% 0%",
  berline: "50% 0%",
  suv: "100% 0%",
  break: "0% 100%",
  utilitaire: "50% 100%",
  cabriolet: "100% 100%",
};

const SPRITE_URL = "/vehicle-bodies/neon-sprite.webp";

function spritePosition(shape: ArtShape, kind: VehicleKind) {
  if (kind !== "car") return null;
  return BODY_SPRITES[shape] ?? null;
}

function NeonVehicle({
  position,
  className,
  style,
  label,
  variant = 0,
}: {
  position: string;
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
          "radial-gradient(circle at 50% 46%, rgba(31,95,224,.16), transparent 52%), linear-gradient(145deg, #071225 0%, #0a1930 52%, #07111f 100%)",
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
          width: "94%",
          aspectRatio: "1 / 1",
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
          backgroundImage: `url(${SPRITE_URL})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "300% 200%",
          backgroundPosition: position,
          filter: "drop-shadow(0 8px 18px rgba(31,95,224,.18))",
        }}
      />
    </span>
  );
}

export function VehicleArt(props: VehicleArtProps) {
  const position = spritePosition(props.body, props.kind);
  if (!position) return <LegacyVehicleArt {...props} />;

  return (
    <NeonVehicle
      position={position}
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
  const position = spritePosition(shape, kind);
  if (!position) {
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
        width: size * 1.7,
        height: size,
        flexShrink: 0,
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
          transform: "translate(-50%, -50%)",
          backgroundImage: `url(${SPRITE_URL})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "300% 200%",
          backgroundPosition: position,
        }}
      />
    </span>
  );
}
