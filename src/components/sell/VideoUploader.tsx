"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { BLOB_ACCESS, MAX_VIDEO_BYTES, VIDEO_TYPES, mediaUrl } from "@/lib/blob";
import { useSession } from "@/store/session";
import { Close, Play } from "@/components/icons";

export interface UploadedVideo {
  url: string;
  kind: "video";
}

const prettyBytes = (n: number) =>
  n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(0)} ميغا` : `${Math.round(n / 1024)} كيلو`;

/**
 * واش نقدرو نطلبو شريط التقدّم؟
 *
 * باش تعطي النسبة، مكتبة Blob كتصيفط الجسم كـstream فداخل fetch
 * (`duplex: "half"`) — مدعوم غير فChromium على الحاسوب. فWebKit
 * (كل المتصفحات فiPhone) كنمشيو بلا نسبة بدل ما نخاطرو بالتعليق.
 */
function canStreamProgress() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return false;
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) return false;
  return true;
}

export function VideoUploader({
  video,
  onChange,
}: {
  video: UploadedVideo | null;
  onChange: (next: UploadedVideo | null) => void;
}) {
  const { user } = useSession();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFile = useRef<File | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/upload/video")
      .then((r) => r.json())
      .then((j) => alive && setEnabled(Boolean(j?.ok && j.data.enabled)))
      .catch(() => alive && setEnabled(false));
    return () => {
      alive = false;
    };
  }, []);

  // عدّاد الثواني — ملي ماعندناش نسبة، على الأقل المستخدم يشوف حركة
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  const send = useCallback(
    async (file: File) => {
      if (!user) return;
      lastFile.current = file;
      setError(null);
      setElapsed(0);
      setProgress(canStreamProgress() ? 0 : null);
      setBusy(true);

      try {
        /* الفيديو كيمشي من المتصفح للخزّان نيشان — ماشي عبر الخادم
           ديالنا — حيت حدّ جسم الطلب فVercel هو 4.5 ميغا. */
        const blob = await upload(`listings/${user.id}/${file.name}`, file, {
          access: BLOB_ACCESS,
          handleUploadUrl: "/api/upload/video",
          multipart: true,
          contentType: file.type || "video/mp4",
          ...(canStreamProgress()
            ? { onUploadProgress: ({ percentage }) => setProgress(percentage) }
            : {}),
        });
        // الخزّان خاص — الرابط ديالو ماكيتقراش من المتصفح، كنقدّموه حنا
        onChange({ url: mediaUrl(blob.pathname), kind: "video" });
      } catch (e) {
        const msg = e instanceof Error && e.message ? e.message : "ماقدرناش نرفعو الفيديو.";
        setError(msg);
        /* الفيديو كيمشي للخزّان نيشان — الخادم ديالنا ماكيشوفش الخطأ.
           كنبلّغوه باش يبان فالسجلات إلا وقع شي مشكل. */
        try {
          navigator.sendBeacon?.(
            "/api/upload/report",
            new Blob(
              [JSON.stringify({
                message: msg,
                name: e instanceof Error ? e.name : "unknown",
                phase: "video",
                size: file.size,
                type: file.type,
              })],
              { type: "application/json" },
            ),
          );
        } catch {
          /* التقرير ماشي مهم بزاف باش يوقف الواجهة */
        }
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [user, onChange],
  );

  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) {
      setError(`الفيديو كبير بزاف (${prettyBytes(file.size)}). الحد ${prettyBytes(MAX_VIDEO_BYTES)}.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    void send(file);
  };

  const remove = () => {
    const url = video?.url;
    onChange(null);
    setError(null);
    if (!url) return;
    void fetch("/api/upload", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
      keepalive: true,
    }).catch(() => {});
  };

  if (!user || enabled === false) return null;

  return (
    <div>
      <label className="label">
        <Play size={13} /> فيديو قصير
        <span className="num mr-auto text-[10px]" style={{ color: "var(--good)" }}>
          +4 نقط
        </span>
      </label>

      {video ? (
        <div
          className="relative overflow-hidden rounded-lg border"
          style={{ borderColor: "var(--line)" }}
        >
          <video
            src={video.url}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full bg-black"
          />
          <button
            type="button"
            onClick={remove}
            aria-label="حيّد الفيديو"
            title="حيّد الفيديو"
            className="absolute left-1 top-1 grid h-7 w-7 place-items-center rounded-md shadow-md"
            style={{ background: "var(--bad)", color: "#fff" }}
          >
            <Close size={13} />
          </button>
        </div>
      ) : busy ? (
        <div
          className="rounded-lg p-3 text-center text-[11.5px]"
          style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
        >
          <div className="font-bold">
            {progress === null ? "كنرفعو الفيديو…" : `${Math.round(progress)}%`}
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full"
            style={{ background: "var(--line)" }}
          >
            <div
              className="h-full transition-[width]"
              style={{
                width: progress === null ? "100%" : `${progress}%`,
                background: "var(--brand)",
                opacity: progress === null ? 0.45 : 1,
              }}
            />
          </div>
          <div className="num mt-1.5 text-[10.5px]" style={{ color: "var(--text-dim)" }}>
            {elapsed} ثانية · الفيديو كبير، خلّي الصفحة محلولة
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="grid w-full place-items-center rounded-lg border-2 border-dashed py-5 transition hover:border-[var(--brand)]"
          style={{ borderColor: "var(--line)", color: "var(--text-dim)" }}
        >
          <span className="flex flex-col items-center gap-1">
            <Play size={18} />
            <span className="text-[11px] font-bold">زيد فيديو ديال المركبة</span>
            <span className="text-[10.5px]">المحرك + جولة حول المركبة · حتى {prettyBytes(MAX_VIDEO_BYTES)}</span>
          </span>
        </button>
      )}

      {error && (
        <p className="mt-1.5 text-[11px] font-bold" style={{ color: "var(--bad)" }}>
          {error}
          {lastFile.current && (
            <button
              type="button"
              onClick={() => lastFile.current && void send(lastFile.current)}
              className="mr-2 underline"
            >
              عاود
            </button>
          )}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={VIDEO_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => pick(e.target.files)}
      />
    </div>
  );
}
