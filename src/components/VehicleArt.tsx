"use client";

import { useState, type CSSProperties } from "react";
import type { VehicleKind } from "@/lib/types";
import {
  VehicleArt as LegacyVehicleArt,
  VehicleGlyph as LegacyVehicleGlyph,
} from "./VehicleArtLegacy";
import type { ArtShape, VehicleArtProps } from "./VehicleArtLegacy";

export type { ArtShape, VehicleArtProps } from "./VehicleArtLegacy";

const BODY_IMAGE_VERSION = "20260911-6";
const BODY_IMAGES: Partial<Record<ArtShape, string>> = {
  berline: `/vehicle-bodies/berline.webp?v=${BODY_IMAGE_VERSION}`,
  break: `/vehicle-bodies/break.webp?v=${BODY_IMAGE_VERSION}`,
  utilitaire: `/vehicle-bodies/utilitaire.webp?v=${BODY_IMAGE_VERSION}`,
  cabriolet: `/vehicle-bodies/cabriolet.webp?v=${BODY_IMAGE_VERSION}`,
};

const SPRITE_SRC = `/vehicle-bodies/neon-sprite.webp?v=${BODY_IMAGE_VERSION}`;
const SPRITE_COLUMN: Partial<Record<ArtShape, number>> = {
  citadine: 0,
  suv: 2,
};

function bodyImage(shape: ArtShape, kind: VehicleKind) {
  if (kind !== "car") return null;
  return BODY_IMAGES[shape] ?? null;
}

function spriteColumn(shape: ArtShape, kind: VehicleKind) {
  if (kind !== "car") return null;
  return SPRITE_COLUMN[shape] ?? null;
}

function SpriteSvg({
  shape,
  className,
  style,
  label,
}: {
  shape: ArtShape;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  const col = SPRITE_COLUMN[shape];
  if (col === undefined) return null;

  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "inline-block", overflow: "hidden", ...style }}
    >
      <image
        href={SPRITE_SRC}
        x={-col * 512}
        y={0}
        width={1536}
        height={1024}
        preserveAspectRatio="none"
      />
    </svg>
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
  const col = spriteColumn(props.body, props.kind);

  if (col !== null) {
    return (
      <span
        className={`relative block overflow-hidden ${props.className ?? ""}`}
        style={{
          background:
            "radial-gradient(circle at 50% 46%, rgba(31,95,224,.18), transparent 58%), linear-gradient(145deg, #071225 0%, #0a1930 52%, #07111f 100%)",
        }}
        role="img"
        aria-label={props.label ?? "مجسم المركبة"}
      >
        <SpriteSvg
          shape={props.body}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </span>
    );
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
  const col = spriteColumn(shape, kind);

  if (col !== null) {
    return (
      <SpriteSvg
        shape={shape}
        className={className}
        style={{
          width: size * 2.55,
          height: size * 1.5,
          verticalAlign: "middle",
          flexShrink: 0,
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
