"use client";

import { useState, type CSSProperties } from "react";
import type { VehicleKind } from "@/lib/types";
import {
  VehicleArt as LegacyVehicleArt,
  VehicleGlyph as LegacyVehicleGlyph,
} from "./VehicleArtLegacy";
import type { ArtShape, VehicleArtProps } from "./VehicleArtLegacy";

export type { ArtShape, VehicleArtProps } from "./VehicleArtLegacy";

const BODY_IMAGE_VERSION = "20260911-3";
const BODY_IMAGES: Partial<Record<ArtShape, string>> = {
  berline: `/vehicle-bodies/berline.webp?v=${BODY_IMAGE_VERSION}`,
  break: `/vehicle-bodies/break.webp?v=${BODY_IMAGE_VERSION}`,
  utilitaire: `/vehicle-bodies/utilitaire.webp?v=${BODY_IMAGE_VERSION}`,
  cabriolet: `/vehicle-bodies/cabriolet.webp?v=${BODY_IMAGE_VERSION}`,
};

const SPRITE_SRC = `/vehicle-bodies/neon-sprite.webp?v=${BODY_IMAGE_VERSION}`;
const SPRITE_POSITION: Partial<Record<ArtShape, string>> = {
  citadine: "0% 0%",
  suv: "100% 0%",
};

function bodyImage(shape: ArtShape, kind: VehicleKind) {
  if (kind !== "car") return null;
  return BODY_IMAGES[shape] ?? null;
}

function usesSprite(shape: ArtShape, kind: VehicleKind) {
  return kind === "car" && Boolean(SPRITE_POSITION[shape]);
}

function SpriteVehicle({
  shape,
  className,
  label,
}: {
  shape: ArtShape;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={`relative block overflow-hidden ${className ?? ""}`}
      role="img"
      aria-label={label ?? "مجسم المركبة"}
      style={{
        backgroundImage: `url(${SPRITE_SRC})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "300% 200%",
        backgroundPosition: SPRITE_POSITION[shape] ?? "0% 0%",
        backgroundColor: "#071225",
      }}
    />
  );
}

function NeonVehicle({
  src,
  className,
  label,
  variant = 0,
  onError,
}: {
  src: string;
  className?: string;
  label?: string;
  variant?: number;
  onError?: () => void;
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
        onError={onError}
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
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (usesSprite(props.body, props.kind)) {
    return <SpriteVehicle shape={props.body} className={props.className} label={props.label} />;
  }

  const src = bodyImage(props.body, props.kind);
  if (!src || failedSrc === src) return <LegacyVehicleArt {...props} />;

  return (
    <NeonVehicle
      src={src}
      className={props.className}
      label={props.label}
      variant={props.variant}
      onError={() => setFailedSrc(src)}
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
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (usesSprite(shape, kind)) {
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{
          width: size * 2.55,
          height: size * 1.5,
          display: "inline-block",
          flexShrink: 0,
          backgroundImage: `url(${SPRITE_SRC})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "300% 200%",
          backgroundPosition: SPRITE_POSITION[shape] ?? "0% 0%",
          filter: "drop-shadow(0 3px 8px rgba(31,95,224,.34))",
          ...style,
        }}
      />
    );
  }

  const src = bodyImage(shape, kind);
  if (!src || failedSrc === src) {
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
      onError={() => setFailedSrc(src)}
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
