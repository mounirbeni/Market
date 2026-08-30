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
  /* رؤوس أمان أساسية على كل الصفحات — بلا CSP: الموقع كيحمّل خطوط
     Google وصور Blob من نطاقات مختلفة، وCSP صارمة خاصها تُختبر
     على staging قبل ما تدخل الإنتاج بلاها تكسر شي حاجة بلا ما نديرو. */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
