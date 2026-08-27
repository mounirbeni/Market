/* ============================================================
   Service Worker — طريق

   الهدف الوحيد: التطبيب يتنصّب (installable) ويوري صفحة معقولة
   ملي التيليفون بلا شبكة. ماشي كاش شامل — سوق فيه أثمنة وإعلانات
   كتبدّل فأي وقت، فحطّينا بيانات قديمة خطر أكبر من نفعه.

   القاعدة:
   · تصفّح صفحة (navigate) → الشبكة أولاً؛ خصّها تطيح → offline
   · ملفات البناء الثابتة (/_next/static/…، هاش فسميتها) → cache
     أولاً، عمرها ماكتبدّل لنفس الاسم
   · شعارات وأيقونات → cache أولاً، أخف وزن
   · كلشي آخر (API، الإشراف، رفع الملفات) → ماكنديروش فيه شي حاجة،
     كيمشي للشبكة نيشان بلا ما نتدخّلو
   ============================================================ */

const CACHE = "triq-v1";
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => {
      /* ماشي حرج إلا فشل التخزين المسبق — كيبقى الموقع خدّام */
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brands/") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/apple-icon.png" ||
    url.pathname === "/manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // غير GET، وغير نفس النطاق — ماكنمسّوش
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // API، الإشراف، الحساب — بيانات حيّة وحساسة، تمشي للشبكة نيشان
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/dashboard")
  ) {
    return;
  }

  // تصفّح صفحة: الشبكة أولاً، وoffline هي الشبكة العدل
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL).then((r) => r ?? Response.error())),
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ??
          fetch(req).then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
            return res;
          }),
      ),
    );
  }
});
