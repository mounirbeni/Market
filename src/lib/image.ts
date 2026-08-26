/* ============================================================
   تحضير الصور قبل الرفع — كيوقع كلّو فالمتصفح

   تصويرة ديال تيليفون حديث كتجي 4000×3000 و6 لـ12 ميغا. رفع
   هادشي من شبكة 4G ضعيفة كياخد دقايق، وإلا تقطع الشبكة فآخر
   لحظة كتعاود مكتبة Blob الرفع من الصفر (٪99 ← ٪0) عشر مرات.

   الحل: كنصغّرو الصورة هنا لـ1920px و JPEG — كتولّي بين 200
   و500 كيلو، يعني الرفع كيسالي فثواني والقطع مابقاش كيوقع.
   1920 كافية بزاف: أكبر عرض كنبيّنو فالموقع هو 1200px.
   ============================================================ */

/** أطول ضلع فالصورة المرفوعة */
const MAX_EDGE = 1920;
/** تحت هاد الحجم مانضغطوش — الصورة أصلاً خفيفة */
const SKIP_BELOW_BYTES = 900 * 1024;
const QUALITY = 0.82;
/** إلا بقات ثقيلة بعد الضغط الأول، كنعاودو بجودة أقل */
const HEAVY_BYTES = 2 * 1024 * 1024;
const QUALITY_LOW = 0.7;

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
      /* HEIC ولا صيغة ماكيعرفهاش المتصفح — كنجرّبو <img> */
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
  const base = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 60);
  return `${base || "photo"}.jpg`;
}

/**
 * كترجع الملف اللي غادي يتّرفع مع أبعادو.
 * إلا فشل شي حاجة كنرجعو الملف الأصلي — الضغط تحسين ماشي شرط.
 */
export async function prepareImage(file: File): Promise<Prepared> {
  const src = await decode(file);
  if (!src) return { file };

  const { w, h } = sizeOf(src);
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));

  // صغيرة وخفيفة أصلاً — نرفعوها كيما هي
  if (scale === 1 && file.size <= SKIP_BELOW_BYTES) {
    if ("close" in src) src.close();
    return { file, width: w, height: h };
  }

  const width = Math.max(1, Math.round(w * scale));
  const height = Math.max(1, Math.round(h * scale));

  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file, width: w, height: h };
    ctx.drawImage(src as CanvasImageSource, 0, 0, width, height);

    let blob = await toBlob(canvas, QUALITY);
    /* صور فيها تفاصيل بزاف كتبقى ثقيلة حتى بعد التصغير —
       جولة ثانية بجودة أقل بلا ما نخسرو الوضوح فالتيليفون */
    if (blob && blob.size > HEAVY_BYTES) {
      const lighter = await toBlob(canvas, QUALITY_LOW);
      if (lighter && lighter.size < blob.size) blob = lighter;
    }
    canvas.width = 0;
    canvas.height = 0;
    if (!blob) return { file, width: w, height: h };

    // إلا الضغط ماربحنا فيه والو، نبقاو على الأصل
    if (blob.size >= file.size && scale === 1) return { file, width: w, height: h };

    return {
      file: new File([blob], jpegName(file.name), {
        type: "image/jpeg",
        lastModified: Date.now(),
      }),
      width,
      height,
    };
  } catch {
    return { file, width: w, height: h };
  } finally {
    if ("close" in src) src.close();
  }
}
