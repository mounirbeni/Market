"use client";

import { useCallback } from "react";

/**
 * صورة كتعرف ملي كتفشل — حتى إلا فشلات قبل ما يوصل React.
 *
 * الصفحة كتوصل للمتصفح مرسومة من الخادم، والمتصفح كيبدا يحمّل
 * الصور دغيا. إلا فشلات صورة قبل ما يعلّق React المستمعين ديالو،
 * حدث `error` كيضيع ونبقاو بأيقونة مكسّرة. علاش كنفحصو زادي ملي
 * كيتعلّق العنصر: `complete` مع `naturalWidth === 0` معناها فشلات.
 */
export function SafeImg({
  src,
  alt,
  className,
  loading = "lazy",
  onBroken,
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  onBroken: (src: string) => void;
}) {
  const check = useCallback(
    (el: HTMLImageElement | null) => {
      if (el && el.complete && el.naturalWidth === 0) onBroken(src);
    },
    [src, onBroken],
  );

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      ref={check}
      src={src}
      alt={alt}
      className={`${className ?? ""} select-none`}
      loading={loading}
      decoding="async"
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      onContextMenu={(event) => event.preventDefault()}
      onError={() => onBroken(src)}
    />
  );
}
