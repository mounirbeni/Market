/* ============================================================
   تحضير الصور قبل الرفع — كيوقع كلّو فالمتصفح

   تصويرة ديال تيليفون حديث كتجي 4000×3000 و6 لـ12 ميغا. حنا
   كنرفعو الصورة عبر الخادم ديالنا، وVercel عندو حدّ 4.5 ميغا
   على جسم الطلب — فالضغط هنا ماشي غير تحسين، هو شرط.

   1920px كافية بزاف: أكبر عرض كنبيّنو فالموقع هو 1200px.
   ============================================================ */

/** أطول ضلع فالصورة المرفوعة */
const MAX_EDGE = 1920;
/** تحت هاد الحجم ومقاس معقول، مانضغطوش — الصورة أصلاً خفيفة */
const SKIP_BELOW_BYTES = 700 * 1024;

/**
 * السقف اللي خاص الملف المرفوع يبقى تحتو.
 * حدّ Vercel هو 4.5 ميغا على الجسم كامل، وكنخلّيو هامش للرؤوس.
 */
export const MAX_UPLOAD_BYTES = 3.4 * 1024 * 1024;

/** درجات الضغط: كنهبطو الجودة، ومن بعد المقاس، حتى نوصلو للسقف */
const STEPS: { edge: number; quality: number }[] = [
  { edge: 1920, quality: 0.82 },
  { edge: 1920, quality: 0.7 },
  { edge: 1600, quality: 0.65 },
  { edge: 1280, quality: 0.6 },
  { edge: 1024, quality: 0.55 },
];

export interface Prepared {
  file: File;
  width?: number;
  height?: number;
}

/** كنقراو الصورة بلا ما نحمّلوها فالذاكرة مرّتين ملي يكون مدعوم */
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* HEIC ولا صيغة ماكيعرفهاش createImageBitmap — كنجرّبو <img> */
    }
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

const sizeOf = (src: ImageBitmap | HTMLImageElement) =>
  "naturalWidth" in src
    ? { w: src.naturalWidth, h: src.naturalHeight }
    : { w: src.width, h: src.height };

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/** اسم نظيف — بلا مسافات ولا حروف كتخلّط المسار */
function jpegName(name: string) {
  const base = name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .slice(0, 60);
  return `${base || "photo"}.jpg`;
}

/** كنرسمو الصورة فمقاس معيّن وكنرجّعو JPEG */
async function encodeAt(
  src: ImageBitmap | HTMLImageElement,
  w: number,
  h: number,
  edge: number,
  quality: number,
) {
  const scale = Math.min(1, edge / Math.max(w, h));
  const width = Math.max(1, Math.round(w * scale));
  const height = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(src as CanvasImageSource, 0, 0, width, height);

  const blob = await toBlob(canvas, quality);
  // كنفرّغو الذاكرة — تيليفون قديم كيضيق بيه الحال مع صور بزاف
  canvas.width = 0;
  canvas.height = 0;
  return blob ? { blob, width, height } : null;
}

/**
 * كترجع الملف اللي غادي يتّرفع مع أبعادو.
 *
 * كتّرمى غلطة إلا ماقدرناش نوصلو للسقف — أحسن من رفع كيفشل
 * فالخادم برسالة ماكتفهم والو.
 */
export async function prepareImage(file: File): Promise<Prepared> {
  const src = await decode(file);

  if (!src) {
    // ماقدرناش نقراوها — نجرّبو نرفعوها كما هي إلا كانت صغيرة
    if (file.size <= MAX_UPLOAD_BYTES) return { file };
    throw new Error("ماقدرناش نقراو هاد الصورة. جرّب وحدة أخرى.");
  }

  try {
    const { w, h } = sizeOf(src);

    // صغيرة ومقاسها معقول — نرفعوها كيما هي
    if (Math.max(w, h) <= MAX_EDGE && file.size <= SKIP_BELOW_BYTES) {
      return { file, width: w, height: h };
    }

    let best: { blob: Blob; width: number; height: number } | null = null;
    for (const step of STEPS) {
      const out = await encodeAt(src, w, h, step.edge, step.quality);
      if (!out) continue;
      best = out;
      if (out.blob.size <= MAX_UPLOAD_BYTES) break;
    }

    if (!best) throw new Error("ماقدرناش نحضّرو هاد الصورة. جرّب وحدة أخرى.");
    if (best.blob.size > MAX_UPLOAD_BYTES) {
      throw new Error("الصورة كبيرة بزاف. جرّب وحدة أخرى.");
    }

    // إلا الضغط ماربحنا فيه والو والأصل تحت السقف، نبقاو على الأصل
    if (best.blob.size >= file.size && file.size <= MAX_UPLOAD_BYTES) {
      return { file, width: w, height: h };
    }

    return {
      file: new File([best.blob], jpegName(file.name), {
        type: "image/jpeg",
        lastModified: Date.now(),
      }),
      width: best.width,
      height: best.height,
    };
  } finally {
    if ("close" in src) src.close();
  }
}
