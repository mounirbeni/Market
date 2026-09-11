import type { CSSProperties } from "react";
import type { VehicleKind } from "@/lib/types";
import {
  VehicleArt as LegacyVehicleArt,
  VehicleGlyph as LegacyVehicleGlyph,
} from "./VehicleArtLegacy";
import type { ArtShape, VehicleArtProps } from "./VehicleArtLegacy";

export type { ArtShape, VehicleArtProps } from "./VehicleArtLegacy";

/**
 * مجسمات carrosserie ديال Tarique.
 * كل نوع عندو SVG مستقل باش يبان بثبات على Safari / iPhone / PWA.
 * ما بقيناش كنستعملو sprite ولا background-position ولا clipping.
 */
const BODY_IMAGES: Partial<Record<ArtShape, string>> = {
  citadine: "/vehicle-bodies/citadine.svg",
  berline: "/vehicle-bodies/berline.svg",
  suv: "/vehicle-bodies/suv.svg",
  break: "/vehicle-bodies/break.svg",
  utilitaire: "/vehicle-bodies/utilitaire.svg",
  cabriolet: "/vehicle-bodies/cabriolet.svg",
};

function bodyImage(shape: ArtShape, kind: VehicleKind) {
  if (kind !== "car") return null;
  return BODY_IMAGES[shape] ?? null;
}

function NeonVehicle({
  src,
  className,
  label,
  variant = 0,
}: {
  src: string;
  className?: string;
  label?: string;
  variant?: number;
}) {
  const scale = variant === 0 ? 1 : 1.01 + (variant % 3) * 0.01;

  return (
    <span
      className={`relative block overflow-hidden ${className ?? ""}`}
      style={{
        background:
          "radial-gradient(circle at 50% 46%, rgba(31,95,224,.18), transparent 58%), linear-gradient(145deg, #071225 0%, #0a1930 52%, #07111f 100%)",
      }}
      role="img"
      aria-label={label ?? "مجسم المركبة"}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        loading="eager"
        decoding="async"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          padding: "3%",
          transform: `scale(${scale})`,
          transformOrigin: "center",
          filter: "drop-shadow(0 7px 16px rgba(31,95,224,.28))",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </span>
  );
}

export function VehicleArt(props: VehicleArtProps) {
  const src = bodyImage(props.body, props.kind);
  if (!src) return <LegacyVehicleArt {...props} />;

  return (
    <NeonVehicle
      src={src}
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
  const src = bodyImage(shape, kind);
  if (!src) {
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
    <img
      src={src}
      alt=""
      draggable={false}
      loading="eager"
      decoding="async"
      className={className}
      width={Math.round(size * 2.55)}
      height={Math.round(size * 1.5)}
      aria-hidden="true"
      style={{
        width: size * 2.55,
        height: size * 1.5,
        display: "inline-block",
        objectFit: "contain",
        verticalAlign: "middle",
        flexShrink: 0,
        filter: "drop-shadow(0 3px 8px rgba(31,95,224,.34))",
        ...style,
      }}
    />
  );
}
