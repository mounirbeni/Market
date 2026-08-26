"use client";

import { useCallback, useEffect, useRef, useState } from "react";
// خاصو يجي قبل @vercel/blob — داكشي كيربط globalThis.fetch ملي كيتحمّل
import { arm, disarm } from "@/lib/fetch-probe";
import { upload } from "@vercel/blob/client";
import { MAX_PHOTOS, MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/blob";
import { prepareImage } from "@/lib/image";
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
  /** كنحتافظو بالملف باش «عاود» يخدم بلا ما يعاود المستخدم يختارو */
  file: File;
  preview: string;
  progress: number;
  stage: "prep" | "up" | "up-blind";
  error?: string;
}

/** أكبر ملف نقبلو نحلّوه فالمتصفح — فوق هادشي التيليفون كيعلق */
const MAX_SOURCE_BYTES = 48 * 1024 * 1024;
/** المحاولة الأولى (بشريط التقدّم) — قصيرة، حيت إلا علقات ماغاديش تفيق */
const STREAM_DEADLINE_MS = 30_000;
/** المحاولة الثانية (بلا تقدّم) — الطريق العادي، كنعطيوه وقت كافي */
const PLAIN_DEADLINE_MS = 45_000;

class DeadlineError extends Error {
  constructor() {
    super("الرفع طوّل بزاف — الشبكة ضعيفة. عاود.");
    this.name = "DeadlineError";
  }
}

/**
 * حدّ زمني صارم.
 *
 * ماكافيش نصيفطو abort: مكتبة Blob كتعاود المحاولة 10 مرات مع
 * تأخير كيتضاعف (1، 2، 4، 8… ثانية)، والإشارة ماكتقطعش النوم
 * بيناتهم — يعني الخطأ كيوصل للمستخدم من بعد نصف ساعة. هنا
 * كنسابقو الوعد مع مؤقّت: إلا سبق المؤقّت، كنقطعو وكنعلنو الفشل
 * دغيا حتى إلا بقات المكتبة كتحاول فالخلفية.
 */
function withDeadline<T>(work: Promise<T>, ms: number, ctrl: AbortController): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      ctrl.abort();
      reject(new DeadlineError());
    }, ms);
    work.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

const prettyBytes = (n: number) => `${(n / (1024 * 1024)).toFixed(1)} ميغا`;

/**
 * واش نقدرو نطلبو شريط التقدّم من مكتبة Blob؟
 *
 * باش تعطي النسبة، المكتبة كتصيفط الملف كـstream فداخل fetch
 * (`duplex: "half"`). هادشي مدعوم غير فChromium على الحاسوب.
 * فWebKit — يعني كل المتصفحات فiPhone، حتى Chrome — الطلب كيعلق
 * فنص الجسم وعمرو ما كيكمّل: السجلات بيّنو ملف 750 كيلو واقف
 * ف٪50 بالضبط، نفس النسبة فكل محاولة.
 *
 * فهاد الحالات كنرفعو بلا تقدّم (fetch عادي) — كيخدم فكل مكان.
 */
function canStreamProgress() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPhone/iPad: كل المتصفحات مبنية على WebKit
  if (/iPhone|iPad|iPod/.test(ua)) return false;
  // Safari على الماك
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) return false;
  return true;
}

/** كنعلمو الخادم بالفشل باش نقدرو نشوفوه فالسجلات — بلا محتوى الملف */
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

  /** رفع ملف واحد. كترجع الصورة إلا نجح، ولا null إلا طاح. */
  const runOne = useCallback(
    async (file: File, id: string, preview: string): Promise<UploadedPhoto | null> => {
      if (!user) return null;

      setPending((p) =>
        p.map((x) =>
          x.id === id ? { ...x, progress: 0, stage: "prep", error: undefined } : x,
        ),
      );

      const started = Date.now();
      let percentage = 0;

      /** محاولة وحدة. withProgress = واش نطلبو شريط التقدّم. */
      const attempt = async (ready: File, withProgress: boolean) => {
        const ctrl = new AbortController();
        arm();
        setPending((p) =>
          p.map((x) =>
            x.id === id ? { ...x, stage: withProgress ? "up" : "up-blind", progress: 0 } : x,
          ),
        );
        return withDeadline(
          upload(`listings/${user.id}/${ready.name}`, ready, {
            access: "public",
            handleUploadUrl: "/api/upload",
            abortSignal: ctrl.signal,
            onUploadProgress: withProgress
              ? (e) => {
                  percentage = e.percentage;
                  setPending((p) =>
                    p.map((x) => (x.id === id ? { ...x, progress: e.percentage } : x)),
                  );
                }
              : undefined,
          }),
          withProgress ? STREAM_DEADLINE_MS : PLAIN_DEADLINE_MS,
          ctrl,
        );
      };

      let streamed = false;
      try {
        // كنصغّرو الصورة قبل الرفع — كتخفّ بزاف والرفع كيسالي بسرعة
        const { file: ready, width, height } = await prepareImage(file);

        if (ready.size > MAX_PHOTO_BYTES) {
          throw new Error(`كبيرة بزاف بعد الضغط (${prettyBytes(ready.size)})`);
        }

        let blob;
        if (canStreamProgress()) {
          streamed = true;
          try {
            // المسار خاصو يبدا بمجلّد المستخدم — الخادم كيرفض غير هادشي
            blob = await attempt(ready, true);
          } catch (first) {
            /* الطريق ديال التقدّم علق ولا طاح — كنعاودو بالعادي.
               حتى إلا الكشف ديالنا غالط، هاد الرجعة كتصلّح الأمور. */
            report({
              message: first instanceof Error ? first.message : "فشل مجهول",
              name: first instanceof Error ? first.name : "unknown",
              phase: "stream",
              probe: disarm(),
              percentage,
              elapsedMs: Date.now() - started,
              size: file.size,
              type: file.type,
              aborted: true,
            });
            percentage = 0;
            blob = await attempt(ready, false);
          }
        } else {
          blob = await attempt(ready, false);
        }

        disarm();
        setPending((p) => p.filter((x) => x.id !== id));
        URL.revokeObjectURL(preview);
        return { url: blob.url, kind: "photo", width, height };
      } catch (e) {
        const msg =
          e instanceof Error && e.message ? e.message : "ماقدرناش نرفعوها";
        setPending((p) => p.map((x) => (x.id === id ? { ...x, error: msg } : x)));
        report({
          message: msg,
          name: e instanceof Error ? e.name : "unknown",
          phase: streamed ? "plain-after-stream" : "plain",
          probe: disarm(),
          percentage,
          elapsedMs: Date.now() - started,
          size: file.size,
          type: file.type,
          aborted: true,
        });
        return null;
      }
    },
    [user],
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
              error: `كبيرة بزاف (${prettyBytes(file.size)})`,
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
    [photos, onChange, user, runOne],
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
                  <span className="mt-1 flex justify-center gap-2">
                    {x.file.size <= MAX_SOURCE_BYTES && (
                      <button type="button" onClick={() => void retry(x.id)} className="underline">
                        عاود
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPending((p) => p.filter((y) => y.id !== x.id))}
                      className="underline"
                    >
                      حيّد
                    </button>
                  </span>
                </span>
              ) : x.stage === "prep" ? (
                <span className="text-[10px] font-bold">كنحضّروها…</span>
              ) : x.stage === "up-blind" ? (
                <span className="text-[10px] font-bold">كنرفعوها…</span>
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
            كنصغّرو الصور أوتوماتيكياً قبل الرفع باش تمشي بسرعة.
          </>
        )}
      </p>
    </div>
  );
}
