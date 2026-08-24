/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // كل الصور مولّدة محلياً (SVG) — لا حاجة لخدمات خارجية
  images: { unoptimized: true },
};

export default nextConfig;
