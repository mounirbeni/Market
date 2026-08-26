/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // كل رسوم المركبات مولّدة محلياً (SVG) وصورة البطل WebP جاهزة
  images: { unoptimized: true },
  // ملفات الهجرات كتّقرا وقت التشغيل من /api/admin/setup — بلا هادشي
  // Vercel ماكيحطّهاش فحزمة الدالة
  outputFileTracingIncludes: {
    "/api/admin/setup": ["./db/migrations/**"],
  },
  async redirects() {
    return [
      // المسارات القديمة
      { source: "/vehicles/:id", destination: "/vehicle/:id", permanent: true },
      { source: "/estimate", destination: "/valuation", permanent: true },
    ];
  },
};

export default nextConfig;
