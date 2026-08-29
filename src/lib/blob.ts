/* ============================================================
   تخزين الصور — Vercel Blob

   الخزّان ديالنا مُعدّ `private` (وهادشي ماكيتبدّلش من بعد ما
   يتصاوب الخزّان). كنّا كنكتبو بـ`public` والخزّان كان كيرفض:

     Vercel Blob: Cannot use public access on a private store.

   ولهذا كان الرفع كيطيح. المكتبة كانت كتعاود الطلب 10 مرات
   بلا ما تقول والو، فالمتصفح كان كيبان بحال واقف.

   الصور ديال الإعلانات خاصها تتشاف من أي زائر، والخزّان خاص،
   فكنقدّموها من عندنا: /api/media/<المسار> كيقراها بالتوكن
   وكيرجّعها. الرد كيتخزّن فCDN ديال Vercel سنة كاملة — المسار
   فيه لاحقة عشوائية فماكيتبدّلش أبداً — فالزائر الثاني كياخدها
   من الحافة بلا ما توصل حتى للدالة.
   ============================================================ */

export const BLOB_ACCESS = "private" as const;

/** الحد الأقصى لكل صورة — تصويرة تيليفون عادية بين 2 و8 ميغا */
export const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic"];
export const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

/** أقصى عدد ديال الصور فإعلان واحد */
export const MAX_PHOTOS = 20;

export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/**
 * بادئة الملفات الخاصة (وثائق الهوية).
 * مسار الصور العام كيرفضها — غير المشرف كيقدر يشوفها.
 */
export const PRIVATE_PREFIX = "private/";

/** مسار وثيقة هوية — ماكيتقدّمش من /api/media */
export function docPath(userId: string, filename: string) {
  const ext = (filename.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${PRIVATE_PREFIX}${userId}/${Date.now()}.${ext || "jpg"}`;
}

/** الرابط اللي كيتخزّن فقاعدة البيانات وكيتحط ف<img> */
export const mediaUrl = (pathname: string) =>
  `/api/media/${pathname.split("/").map(encodeURIComponent).join("/")}`;

/** واش هاد الرابط كيمشي لمسار الصور ديالنا؟ */
export const isMediaUrl = (url: string) => /^\/api\/media\/[^?#]+$/.test(url);

/** كنرجّعو المسار داخل الخزّان من رابط /api/media/… */
export function pathnameFromMediaUrl(url: string): string | null {
  if (!isMediaUrl(url)) return null;
  try {
    return url
      .slice("/api/media/".length)
      .split("/")
      .map(decodeURIComponent)
      .join("/");
  } catch {
    return null;
  }
}

/**
 * مسار الملف داخل الخزّان.
 *
 * كنرتّبو حسب المستخدم باش يسهل التنظيف ملي يتمسح حساب، وVercel
 * كيزيد لاحقة عشوائية باش حتى واحد ما يخمّن رابط صورة ماشي ديالو.
 */
export function mediaPath(userId: string, filename: string) {
  const ext = (filename.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `listings/${userId}/${Date.now()}.${ext || "jpg"}`;
}

/** مسار صورة الملف الشخصي / شعار النشاط — بلا علامة مائية */
export function avatarPath(userId: string, filename: string) {
  const ext = (filename.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `avatars/${userId}/${Date.now()}.${ext || "jpg"}`;
}
