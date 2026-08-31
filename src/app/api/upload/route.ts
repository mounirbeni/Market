import { del, put } from "@vercel/blob";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";
import { body, fail, ok, unauthorized } from "@/lib/api";
import {
  BLOB_ACCESS,
  PHOTO_TYPES,
  avatarPath,
  blobConfigured,
  docPath,
  mediaPath,
  mediaUrl,
  pathnameFromMediaUrl,
} from "@/lib/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** نفس السقف اللي كيحترمو المتصفح (lib/image.ts) مع شوية هامش */
const MAX_BODY_BYTES = 3.6 * 1024 * 1024;
const WATERMARK_EDGE = 1920;
const WATERMARK_QUALITIES = [84, 78, 70, 62];

/** علامة مائية خفيفة جداً ومتكررة (صعبة القصّ) — شفافية منخفضة باش
 *  ماتبانش كعيب فعرض الصورة، وكتبقى كافية باش تصعّب سرقة الصور. */
function watermarkSvg() {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="180" viewBox="0 0 480 180">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="blur"/>
          <feOffset dy="1" result="offset"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.65"/></feComponentTransfer>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g transform="rotate(-18 240 90)" opacity="0.12" filter="url(#shadow)">
        <circle cx="62" cy="90" r="30" fill="#0a1e3d" fill-opacity="0.76" stroke="#ffffff" stroke-opacity="0.88" stroke-width="3"/>
        <text x="62" y="101" text-anchor="middle" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="#ffffff">T</text>
        <text x="108" y="88" font-family="Arial, sans-serif" font-size="27" font-weight="800" letter-spacing="2" fill="#ffffff">TRIQ</text>
        <text x="109" y="113" font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="1.5" fill="#ffffff">MARKET MAROC</text>
      </g>
    </svg>
  `);
}

/** كيحوّل الصورة إلى JPEG مائية قبل ما تدخل للخزّان. */
async function watermarkPhoto(input: Buffer) {
  let normalized: Buffer;
  try {
    normalized = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: WATERMARK_EDGE, height: WATERMARK_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new Error("IMAGE_UNSUPPORTED");
  }

  const overlay = await sharp(watermarkSvg()).png().toBuffer();
  for (const quality of WATERMARK_QUALITIES) {
    const output = await sharp(normalized)
      .composite([{ input: overlay, tile: true, blend: "over" }])
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (output.byteLength <= MAX_BODY_BYTES) return output;
  }
  throw new Error("IMAGE_TOO_LARGE");
}

const AVATAR_EDGE = 640;

/** صورة الملف الشخصي / الشعار — تصغير بلا علامة مائية (ماشي صورة إعلان للبيع) */
async function processAvatar(input: Buffer) {
  try {
    return await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: AVATAR_EDGE, height: AVATAR_EDGE, fit: "cover" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new Error("IMAGE_UNSUPPORTED");
  }
}

/* ============================================================
   رفع الصور — الملف كيدوز من هنا

   كنّا كنستعملو «الرفع المباشر»: المتصفح كياخد توكن من هنا ومن
   بعد كيصيفط الملف نيشان لـvercel.com/api/blob. السبب كان حدّ
   Vercel على جسم الطلب (4.5 ميغا) — تصويرة تيليفون أكبر منّو.

   المشكل: هاد الطلب من المتصفح للخزّان عمرو ما كمل فiPhone —
   لا بالشبكة ديال الدار ولا ب5G، لا بشريط التقدّم ولا بلاه.
   السجلات بيّنو أنّ /api/upload كيعطي التوكن (200) والرفع من بعد
   كيضيع. نطاق آخر، وCORS، وحماية vercel.com — بزاف ديال الحوايج
   خارجة على يدّينا.

   دابا كنصغّرو الصورة فالمتصفح أولاً (1920px، وتحت 3.4 ميغا
   مضمون)، فالحد ديال 4.5 ميغا مابقاش مشكل — والملف كيدوز من
   نفس النطاق اللي التيليفون كيهضر معاه أصلاً بلا مشاكل.

   XHR فالمتصفح كيعطينا شريط التقدّم فكل المتصفحات، بلا streams.
   ============================================================ */

export async function POST(req: Request) {
  if (!blobConfigured())
    return fail("رفع الصور ماشي مضبوط: BLOB_READ_WRITE_TOKEN ناقص.", 503);

  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const type = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!PHOTO_TYPES.includes(type)) return fail("نوع الملف ماشي مقبول.", 415);

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return fail("الصورة كبيرة بزاف.", 413);

  const bytes = Buffer.from(await req.arrayBuffer());
  if (bytes.byteLength === 0) return fail("الملف خاوي.", 400);
  if (bytes.byteLength > MAX_BODY_BYTES) return fail("الصورة كبيرة بزاف.", 413);

  const name = req.headers.get("x-filename") ?? "photo.jpg";

  /* وثيقة هوية: كتمشي تحت private/ — مسار الصور العام كيرفض
     هاد البادئة، وغير المشرف كيقدر يشوفها. */
  const purpose = req.headers.get("x-purpose");
  const isDoc = purpose === "doc";
  const isAvatar = purpose === "avatar";
  const path = isDoc ? docPath(user.id, name) : isAvatar ? avatarPath(user.id, name) : mediaPath(user.id, "photo.jpg");

  try {
    // وثائق الهوية لا تدخل هذا المسار؛ صور الإعلانات تُخزَّن مائية فقط.
    const storedBytes = isDoc ? bytes : isAvatar ? await processAvatar(bytes) : await watermarkPhoto(bytes);
    const storedType = isDoc ? type : "image/jpeg";
    const blob = await put(path, storedBytes, {
      access: BLOB_ACCESS,
      addRandomSuffix: true,
      contentType: storedType,
    });
    return ok({
      url: isDoc ? null : mediaUrl(blob.pathname),
      pathname: blob.pathname,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "IMAGE_UNSUPPORTED")
      return fail("هاد الصيغة ماقدرناش نعالجوها بعلامة مائية. حوّلها إلى JPG أو PNG.", 415);
    if (e instanceof Error && e.message === "IMAGE_TOO_LARGE")
      return fail("الصورة كبيرة بزاف من بعد إضافة العلامة المائية. جرّب صورة أخرى.", 413);
    console.error("[upload] الخزّان أو معالجة الصورة فشلات:", e);
    return fail("ماقدرناش نسجّلو الصورة. عاود المحاولة.", 502);
  }
}

/**
 * حذف صورة.
 *
 * المستخدم كيحيّد صورة من المعالج قبل ما ينشر — بلا هاد المسار
 * كتبقى فالخزّان للأبد. كنتحققو أنّ الملف داخل المجلّد ديالو
 * قبل أي حذف: المسار كيبدا بـlistings/<المعرّف>/.
 */
export async function DELETE(req: Request) {
  if (!blobConfigured()) return fail("رفع الصور ماشي مضبوط.", 503);

  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<{ url?: string }>(req);
  const pathname = b?.url ? pathnameFromMediaUrl(b.url) : null;
  if (!pathname) return fail("الرابط ماشي صحيح.", 400);
  if (!pathname.startsWith(`listings/${user.id}/`)) return fail("ماعندكش الصلاحية.", 403);

  try {
    await del(pathname);
    return ok({ deleted: true });
  } catch (e) {
    console.error("[upload] ماقدرناش نمسحو:", pathname, e);
    return fail("ماقدرناش نمسحو الصورة.", 502);
  }
}

/**
 * فحص: واش الرفع مضبوط.
 *
 * `?selftest=1` كيكتب بكسل واحد فالخزّان — كيبيّن واش الخادم
 * كيوصل للخزّان، بلا ما نحتاجو متصفح. المسار ثابت وكيتكتب فوقو،
 * فحتى إلا تنادى بزاف ماكيزيدش غير 68 بايت فالخزّان.
 */
export async function GET(req: Request) {
  const enabled = blobConfigured();
  if (!enabled || new URL(req.url).searchParams.get("selftest") !== "1")
    return ok({ enabled });

  // بكسل شفّاف — أصغر PNG صالح
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64",
  );
  const started = Date.now();
  try {
    const blob = await put("selftest/probe.png", png, {
      access: BLOB_ACCESS,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "image/png",
    });
    return ok({ enabled, selftest: "ok", ms: Date.now() - started, url: mediaUrl(blob.pathname) });
  } catch (e) {
    return ok({
      enabled,
      selftest: "fail",
      ms: Date.now() - started,
      error: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
    });
  }
}
