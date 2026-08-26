"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/blob";
import { useSession } from "@/store/session";
import { Camera, Check, Close, Star } from "@/components/icons";

export interface UploadedPhoto {
  url: string;
  kind: "photo" | "video";
  width?: number;
  height?: number;
}

interface Pending {
  id: string;
  preview: string;
  progress: number;
  error?: string;
}

/** كنقراو الأبعاد قبل الرفع باش نخزّنوهم مع الصورة */
function dimensionsOf(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    img.src = url;
  });
}

const prettyBytes = (n: number) => `${(n / (1024 * 1024)).toFixed(1)} ميغا`;

export function PhotoUploader({
  photos,
  onChange,
}: {
  photos: UploadedPhoto[];
  onChange: (next: UploadedPhoto[]) => void;
}) {
  const { user } = useSession();
  const [pending, setPending] = useState<Pending[]>([]);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/upload")
      .then((r) => r.json())
      .then((j) => alive && setEnabled(Boolean(j?.ok && j.data.enabled)))
      .catch(() => alive && setEnabled(false));
    return () => {
      alive = false;
    };
  }, []);

  const pick = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !user) return;
      const room = MAX_PHOTOS - photos.length;
      const chosen = Array.from(files).slice(0, Math.max(0, room));
      const added: UploadedPhoto[] = [];

      for (const file of chosen) {
        const id = `${file.name}-${Date.now()}-${Math.random()}`;
        const preview = URL.createObjectURL(file);

        if (file.size > MAX_PHOTO_BYTES) {
          setPending((p) => [
            ...p,
            { id, preview, progress: 0, error: `كبيرة بزاف (${prettyBytes(file.size)})` },
          ]);
          continue;
        }

        setPending((p) => [...p, { id, preview, progress: 0 }]);

        /* شبكة أمان: إلا وقف التقدّم دقيقتين، كنقطعو بدل ما نبقاو
           دايرين للأبد. شبكة التيليفون كتقطع بلا ما تعلن. */
        const ctrl = new AbortController();
        let stall: ReturnType<typeof setTimeout> | undefined;
        const bump = () => {
          clearTimeout(stall);
          stall = setTimeout(() => ctrl.abort(), 120_000);
        };
        bump();

        try {
          const dims = await dimensionsOf(file);
          // المسار خاصو يبدا بمجلّد المستخدم — الخادم كيرفض غير هادشي
          const blob = await upload(`listings/${user.id}/${file.name}`, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
            abortSignal: ctrl.signal,
            onUploadProgress: ({ percentage }) => {
              bump();
              setPending((p) => p.map((x) => (x.id === id ? { ...x, progress: percentage } : x)));
            },
          });
          added.push({ url: blob.url, kind: "photo", ...dims });
          setPending((p) => p.filter((x) => x.id !== id));
          URL.revokeObjectURL(preview);
        } catch (e) {
          const msg = ctrl.signal.aborted
            ? "الرفع وقف — الشبكة ضعيفة. عاود."
            : e instanceof Error
              ? e.message
              : "ماقدرناش نرفعوها";
          setPending((p) => p.map((x) => (x.id === id ? { ...x, error: msg } : x)));
        } finally {
          clearTimeout(stall);
        }
      }

      if (added.length > 0) onChange([...photos, ...added]);
      if (inputRef.current) inputRef.current.value = "";
    },
    [photos, onChange, user],
  );

  const remove = (url: string) => onChange(photos.filter((p) => p.url !== url));

  /** الصورة الأولى هي اللي كتبان فالبطاقة — كنخلّيو المستخدم يختارها */
  const makeCover = (url: string) => {
    const picked = photos.find((p) => p.url === url);
    if (!picked) return;
    onChange([picked, ...photos.filter((p) => p.url !== url)]);
  };

  if (!user) {
    return (
      <div
        className="rounded-lg p-3 text-[11.5px] leading-relaxed"
        style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
      >
        سجّل الدخول باش ترفع الصور — هي كتّربط بالحساب ديالك.
      </div>
    );
  }

  if (enabled === false) {
    return (
      <div
        className="rounded-lg p-3 text-[11.5px] leading-relaxed"
        style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
      >
        رفع الصور ماشي مضبوط فهاد النسخة (خاص <span className="num">BLOB_READ_WRITE_TOKEN</span>).
        تقدّر تكمّل الإعلان دابا وتزيد الصور من بعد.
      </div>
    );
  }

  return (
    <div>
      <label className="label">
        <Camera size={13} /> صور المركبة
        <span className="num mr-auto" style={{ color: "var(--brand)" }}>
          {photos.length}/{MAX_PHOTOS}
        </span>
      </label>

      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((p, i) => (
          <div
            key={p.url}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border"
            style={{ borderColor: "var(--line)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span
                className="tag absolute bottom-1 right-1"
                style={{ background: "var(--brand)", color: "#fff" }}
              >
                <Star size={10} /> الغلاف
              </span>
            )}
            <div className="absolute inset-x-0 top-0 flex justify-between p-1 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
              {i !== 0 ? (
                <button
                  type="button"
                  onClick={() => makeCover(p.url)}
                  aria-label="خلّيها صورة الغلاف"
                  className="grid h-6 w-6 place-items-center rounded-md"
                  style={{ background: "rgba(10,30,61,0.8)", color: "#fff" }}
                >
                  <Star size={12} />
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => remove(p.url)}
                aria-label="حيّد الصورة"
                className="grid h-6 w-6 place-items-center rounded-md"
                style={{ background: "var(--bad)", color: "#fff" }}
              >
                <Close size={12} />
              </button>
            </div>
          </div>
        ))}

        {pending.map((x) => (
          <div
            key={x.id}
            className="relative aspect-[4/3] overflow-hidden rounded-lg border"
            style={{ borderColor: x.error ? "var(--bad)" : "var(--line)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={x.preview} alt="" className="h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 grid place-items-center p-2 text-center">
              {x.error ? (
                <span className="text-[10px] font-bold leading-tight" style={{ color: "var(--bad)" }}>
                  {x.error}
                  <button
                    type="button"
                    onClick={() => setPending((p) => p.filter((y) => y.id !== x.id))}
                    className="mt-1 block w-full underline"
                  >
                    حيّد
                  </button>
                </span>
              ) : (
                <span className="num text-[11px] font-bold">{Math.round(x.progress)}%</span>
              )}
            </div>
          </div>
        ))}

        {photos.length + pending.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid aspect-[4/3] place-items-center rounded-lg border-2 border-dashed transition hover:border-[var(--brand)]"
            style={{ borderColor: "var(--line)", color: "var(--text-dim)" }}
          >
            <span className="flex flex-col items-center gap-1">
              <Camera size={18} />
              <span className="text-[10.5px] font-bold">زيد صور</span>
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_TYPES.join(",")}
        multiple
        className="sr-only"
        onChange={(e) => pick(e.target.files)}
      />

      <p className="mt-2 text-[11px]" style={{ color: "var(--text-dim)" }}>
        {photos.length >= 12 ? (
          <span style={{ color: "var(--good)" }}>
            <Check size={11} /> عدد الصور مزيان — هاد الإعلانات كتوصل ضعف الاتصالات.
          </span>
        ) : (
          <>
            الإعلانات ب<span className="num">12</span> صورة فما فوق كتوصل ضعف الاتصالات.
            أقصى حجم للصورة <span className="num">12</span> ميغا.
          </>
        )}
      </p>
    </div>
  );
}
