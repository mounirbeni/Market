/* ============================================================
   مراقب طلبات الرفع

   المشكل: مكتبة Vercel Blob كتعاود الطلب 10 مرات بلا ما تقول
   والو، ومن برّا الفشل السريع اللي تعاود 10 مرات كيبان بحال
   طلب واحد علق. باش نعرفو الفرق، كنسجّلو نتيجة كل طلب حقيقي
   كيمشي للخزّان: الحالة، الوقت، والخطأ.

   خاص هاد الملف يتحمّل قبل `@vercel/blob/client` — داكشي كيربط
   `globalThis.fetch` عندو ملي كيتحمّل، فإلا جينا من بعديه
   الغلاف ديالنا ماغاديش يشوف والو. import ديالو مكتوب فوق
   ديالها فPhotoUploader ولهذا كيخدم.

   الغلاف شفّاف: كيرجّع نفس الرد ونفس الخطأ، وكيسجّل غير ملي
   يكون مسلّح (`arm()`), وغير لطلبات الخزّان.
   ============================================================ */

export interface ProbeEntry {
  status?: number;
  vercelError?: string | null;
  err?: string;
  name?: string;
  ms: number;
}

const BLOB_HOSTS = /vercel\.com\/api\/blob|blob\.vercel-storage\.com/;
const MAX_ENTRIES = 8;

let armed = false;
let entries: ProbeEntry[] = [];

/** كنبداو التسجيل من الصفر */
export function arm() {
  armed = true;
  entries = [];
}

/** كنحبسو التسجيل وكنرجّعو اللي تجمع */
export function disarm(): ProbeEntry[] {
  armed = false;
  return entries;
}

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

if (typeof globalThis.fetch === "function" && !("__triqProbe" in globalThis)) {
  Object.defineProperty(globalThis, "__triqProbe", { value: true });
  const original = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!armed || !BLOB_HOSTS.test(urlOf(input))) return original(input, init);

    const started = Date.now();
    try {
      const res = await original(input, init);
      if (entries.length < MAX_ENTRIES) {
        entries.push({
          status: res.status,
          vercelError: res.headers.get("x-vercel-error"),
          ms: Date.now() - started,
        });
      }
      return res;
    } catch (e) {
      if (entries.length < MAX_ENTRIES) {
        entries.push({
          err: String(e).slice(0, 160),
          name: e instanceof Error ? e.name : "unknown",
          ms: Date.now() - started,
        });
      }
      throw e;
    }
  };
}
