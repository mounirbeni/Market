"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_PHOTOS, PHOTO_TYPES } from "@/lib/blob";
import { MAX_UPLOAD_BYTES, prepareImage } from "@/lib/image";
import { useSession } from "@/store/session";
import { useDict } from "@/lib/i18n/client";
import { Camera, Check, Close, Star } from "@/components/icons";

export interface UploadedPhoto {
  url: string;
  kind: "photo" | "video";
  /** نسخة صغيرة للبطاقات */
  thumbUrl?: string;
  width?: number;
  height?: number;
}

interface Pending {
  id: string;
  /** كنحتافظو بالملف باش «عاود» يخدم بلا ما يعاود المستخدم يختارو */
  file: File;
  preview: string;
  progress: number;
  stage: "prep" | "up";
  error?: string;
}

/** أكبر ملف نقبلو نحلّوه فالمتصفح — فوق هادشي التيليفون كيعلق */
const MAX_SOURCE_BYTES = 48 * 1024 * 1024;
/** الرفع خاصو يسالي فهاد المدة — 3 ميغا على شبكة ضعيفة كتاخد أقل */
const UPLOAD_TIMEOUT_MS = 90_000;

type Messages = {
  megaUnit: string; serverError: string; networkError: string;
  timeoutError: string; abortedError: string;
};

const prettyBytes = (n: number, unit: string) => `${(n / (1024 * 1024)).toFixed(1)} ${unit}`;

/** الرؤوس ديال HTTP كتقبل غير ASCII — اسم بالعربية كيرمي غلطة */
const asciiName = (name: string) => {
  const clean = name.replace(/[^\x20-\x7E]/g, "").replace(/[^\w.-]+/g, "-").slice(0, 80);
  return clean.replace(/^[-.]+/, "") || "photo.jpg";
};

/**
 * كنعلمو الخادم بالفشل باش نقدرو نشوفوه فالسجلات — بلا محتوى الملف
 */
function report(info: Record<string, unknown>) {
  try {
    const payload = JSON.stringify(info);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/upload/report", new Blob([payload], { type: "application/json" }));
      return;
    }
    void fetch("/api/upload/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* التقرير ماشي مهم بزاف باش يوقف الواجهة */
  }
}

/**
 * الرفع عبر XMLHttpRequest.
 *
 * علاش XHR ماشي fetch: `upload.onprogress` مدعوم فكل المتصفحات
 * وكيعطي النسبة الحقيقية ديال البايتات اللي خرجات. fetch باش
 * يعطي التقدّم خاصو streams فالطلب (`duplex: "half"`) — مدعوم
 * غير فChromium على الحاسوب، وفiPhone كيعلق فنص الجسم.
 *
 * وفيه حتى مؤقّت حقيقي: `xhr.timeout` كيقطع الاتصال بجدّ.
 */
function putPhoto(
  file: File,
  onProgress: (percentage: number) => void,
  signal: AbortSignal,
  messages: Messages,
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    xhr.responseType = "text";
    xhr.setRequestHeader("content-type", file.type || "image/jpeg");
    xhr.setRequestHeader("x-filename", asciiName(file.name));

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };

    xhr.onload = () => {
      type Reply = { ok?: boolean; data?: { url?: string }; error?: string };
      let parsed: Reply | null = null;
      try {
        parsed = JSON.parse(xhr.responseText) as Reply;
      } catch {
        /* رد ماشي JSON — كنعالجوه تحت */
      }
      if (xhr.status >= 200 && xhr.status < 300 && parsed?.ok && parsed.data?.url) {
        resolve({ url: parsed.data.url });
        return;
      }
      reject(new Error(parsed?.error ?? `${messages.serverError} ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error(messages.networkError));
    xhr.ontimeout = () => reject(new Error(messages.timeoutError));
    xhr.onabort = () => reject(new Error(messages.abortedError));

    signal.addEventListener("abort", () => xhr.abort(), { once: true });
    if (signal.aborted) {
      xhr.abort();
      return;
    }

    xhr.send(file);
  });
}

export function PhotoUploader({
  photos,
  onChange,
}: {
  photos: UploadedPhoto[];
  onChange: (next: UploadedPhoto[]) => void;
}) {
  const t = useDict();
  const p0 = t.photoUploader;
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

  /** رفع ملف واحد. كترجع الصورة إلا نجح، ولا null إلا طاح. */
  const runOne = useCallback(
    async (file: File, id: string, preview: string): Promise<UploadedPhoto | null> => {
      if (!user) return null;

      setPending((p) =>
        p.map((x) => (x.id === id ? { ...x, progress: 0, stage: "prep", error: undefined } : x)),
      );

      const ctrl = new AbortController();
      const started = Date.now();
      let percentage = 0;

      try {
        // كنصغّرو الصورة قبل الرفع — كتخفّ بزاف وكتبقى تحت حد الجسم
        const { file: ready, thumb, width, height } = await prepareImage(file);

        if (ready.size > MAX_UPLOAD_BYTES) {
          throw new Error(`${p0.tooLargeAfterCompress} (${prettyBytes(ready.size, p0.megaUnit)})`);
        }

        setPending((p) => p.map((x) => (x.id === id ? { ...x, stage: "up" } : x)));

        const { url } = await putPhoto(
          ready,
          (pct) => {
            percentage = pct;
            setPending((p) => p.map((x) => (x.id === id ? { ...x, progress: pct } : x)));
          },
          ctrl.signal,
          p0,
        );

        /* المصغّرة ثانوية: إلا فشلت كنكملو بالصورة الكاملة بدل ما
           نضيّعو رفع نجح. */
        let thumbUrl: string | undefined;
        if (thumb) {
          try {
            thumbUrl = (await putPhoto(thumb, () => {}, ctrl.signal, p0)).url;
          } catch {
            thumbUrl = undefined;
          }
        }

        setPending((p) => p.filter((x) => x.id !== id));
        URL.revokeObjectURL(preview);
        return { url, kind: "photo", thumbUrl, width, height };
      } catch (e) {
        const msg = e instanceof Error && e.message ? e.message : p0.genericError;
        setPending((p) => p.map((x) => (x.id === id ? { ...x, error: msg } : x)));
        report({
          message: msg,
          name: e instanceof Error ? e.name : "unknown",
          percentage,
          elapsedMs: Date.now() - started,
          size: file.size,
          type: file.type,
        });
        return null;
      }
    },
    [user, p0],
  );

  const pick = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !user) return;
      const room = MAX_PHOTOS - photos.length;
      const chosen = Array.from(files).slice(0, Math.max(0, room));
      const added: UploadedPhoto[] = [];

      for (const file of chosen) {
        const id = `${file.name}-${Date.now()}-${Math.random()}`;
        const preview = URL.createObjectURL(file);

        if (file.size > MAX_SOURCE_BYTES) {
          setPending((p) => [
            ...p,
            {
              id,
              file,
              preview,
              progress: 0,
              stage: "prep",
              error: `${p0.tooLarge} (${prettyBytes(file.size, p0.megaUnit)})`,
            },
          ]);
          continue;
        }

        setPending((p) => [...p, { id, file, preview, progress: 0, stage: "prep" }]);
        const photo = await runOne(file, id, preview);
        if (photo) added.push(photo);
      }

      if (added.length > 0) onChange([...photos, ...added]);
      if (inputRef.current) inputRef.current.value = "";
    },
    [photos, onChange, user, runOne, p0],
  );

  /** «عاود» على صورة طاحت — بلا ما يعاود المستخدم يختار من التيليفون */
  const retry = useCallback(
    async (id: string) => {
      const entry = pending.find((x) => x.id === id);
      if (!entry || entry.file.size > MAX_SOURCE_BYTES) return;
      const photo = await runOne(entry.file, id, entry.preview);
      if (photo) onChange([...photos, photo]);
    },
    [pending, photos, onChange, runOne],
  );

  /**
   * حذف صورة.
   * كنحيّدوها من الواجهة على طول، وكنمسحوها من الخزّان فالخلفية —
   * إلا فشل المسح ماكاين علاش نوقفو المستخدم، غير ملف يتيم.
   */
  const remove = (url: string) => {
    onChange(photos.filter((p) => p.url !== url));
    void fetch("/api/upload", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
      keepalive: true,
    }).catch(() => {});
  };

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
        {p0.loginRequired}
      </div>
    );
  }

  if (enabled === false) {
    return (
      <div
        className="rounded-lg p-3 text-[11.5px] leading-relaxed"
        style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
      >
        {p0.disabledA} <span className="num">BLOB_READ_WRITE_TOKEN</span>{p0.disabledB}
      </div>
    );
  }

  return (
    <div>
      <label className="label">
        <Camera size={13} /> {p0.label}
        <span className="num me-auto" style={{ color: "var(--brand)" }}>
          {photos.length}/{MAX_PHOTOS}
        </span>
      </label>
      <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
        {p0.watermarkNote}
      </p>

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
                className="tag absolute bottom-1 start-1"
                style={{ background: "var(--brand)", color: "#fff" }}
              >
                <Star size={10} /> {p0.cover}
              </span>
            )}
            {/* فالتيليفون ماكاينش hover — الأزرار خاصها تبان ديما.
                فالحاسوب كنخبّيوهم حتى يجي الفأر فوق الصورة. */}
            <div className="absolute inset-x-0 top-0 flex justify-between p-1 transition [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
              {i !== 0 ? (
                <button
                  type="button"
                  onClick={() => makeCover(p.url)}
                  aria-label={p0.makeCoverAria}
                  className="grid h-7 w-7 place-items-center rounded-md shadow-md"
                  style={{ background: "rgba(10,30,61,0.85)", color: "#fff" }}
                >
                  <Star size={13} />
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => remove(p.url)}
                aria-label={p0.removePhotoAria}
                title={p0.removePhotoAria}
                className="grid h-7 w-7 place-items-center rounded-md shadow-md"
                style={{ background: "var(--bad)", color: "#fff" }}
              >
                <Close size={13} />
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
                  <span className="mt-1 flex justify-center gap-2">
                    {x.file.size <= MAX_SOURCE_BYTES && (
                      <button type="button" onClick={() => void retry(x.id)} className="underline">
                        {p0.retry}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPending((p) => p.filter((y) => y.id !== x.id))}
                      className="underline"
                    >
                      {p0.remove}
                    </button>
                  </span>
                </span>
              ) : x.stage === "prep" ? (
                <span className="text-[10px] font-bold">{p0.preparing}</span>
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
              <span className="text-[10.5px] font-bold">{p0.addPhotos}</span>
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
            <Check size={11} /> {p0.goodCount}
          </span>
        ) : (
          <>
            {p0.tipA} <span className="num">12</span> {p0.tipB}
          </>
        )}
      </p>
    </div>
  );
}
