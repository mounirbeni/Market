import type { MetadataRoute } from "next";

/* ============================================================
   بيان التطبيق — باش «طريق» يتزاد للشاشة الرئيسية بحال تطبيق
   حقيقي: أيقونة، اسم، وفتحة بلا شريط عنوان المتصفح (standalone).
   ============================================================ */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "طريق — سوق السيارات والدراجات النارية المستعملة في المغرب",
    short_name: "طريق",
    description:
      "سوق السيارات والدراجات النارية المستعملة في المغرب — مؤشر ثقة، ثمن مرجعي، وتكلفة استعمال حقيقية لكل مركبة.",
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f4f8fe",
    theme_color: "#0a1e3d",
    categories: ["shopping", "automotive"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
