/* ============================================================
   تخزين الصور — Vercel Blob

   الصور ديال الإعلانات عامة (`access: 'public'`):
   الإعلان كيتشاف من أي زائر، حتى اللي ماشي مسجّل، والصور كتبان
   ف24 بطاقة فصفحة النتائج. مع `private` كل صورة خاصها تعدّى من
   دالة خادم — يعني 24 استدعاء لكل صفحة، بلا CDN وبلا cache
   فالمتصفح. `public` كيخلّي CDN ديال Vercel يخدم الصور مباشرة.

   إلا بغينا شي نهار وثائق خاصة (كارط كريز مثلاً)، هادوك خاصهم
   يكونو private مع مسار خادم كيقدّمهم — ماشي نفس الحالة.
   ============================================================ */

export const BLOB_ACCESS = "public" as const;

/** الحد الأقصى لكل صورة — تصويرة تيليفون عادية بين 2 و8 ميغا */
export const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic"];
export const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

/** أقصى عدد ديال الصور فإعلان واحد */
export const MAX_PHOTOS = 20;

export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

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
