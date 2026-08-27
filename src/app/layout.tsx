import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/store/app";
import { SessionProvider } from "@/store/session";
import { getCurrentUser } from "@/lib/auth";
import { unreadCount } from "@/lib/db/chat";
import { Header, MobileNav } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompareBar } from "@/components/CompareBar";
import { PwaRegister } from "@/components/PwaRegister";

/** نص المتن */
const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

/** العناوين — كوفي معماري يعطي الهوية المغربية */
const kufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["500", "700", "800"],
  variable: "--font-kufi",
  display: "swap",
});

/** الأرقام والنصوص اللاتينية */
const num = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-num",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://triq.ma"),
  title: {
    default: "طريق TRIQ — سوق السيارات والدراجات النارية المستعملة في المغرب",
    template: "%s · طريق TRIQ",
  },
  description:
    "أول سوق مغربي يعطيك مؤشر ثقة لكل إعلان، ثمناً مرجعياً محسوباً من السوق، وتكلفة استعمال حقيقية بالدرهم قبل ما تشري سيارتك أو دراجتك.",
  keywords: [
    "سيارات مستعملة المغرب",
    "دراجات نارية مستعملة",
    "طوموبيل مستعملة",
    "voiture occasion maroc",
    "moto occasion maroc",
    "ثمن السيارة في المغرب",
  ],
  openGraph: {
    type: "website",
    locale: "ar_MA",
    siteName: "طريق TRIQ",
    title: "طريق TRIQ — سوق السيارات والدراجات النارية المستعملة في المغرب",
    description:
      "مؤشر ثقة، ثمن مرجعي، وتكلفة استعمال حقيقية لكل مركبة مستعملة في المغرب.",
    images: [{ url: "/hero-vehicles.webp", width: 1774, height: 887, alt: "طريق TRIQ" }],
  },
  robots: { index: true, follow: true },
  /* ملي كيتزاد للشاشة الرئيسية فiOS: بلا شريط سفاري، وباسم مختصر */
  appleWebApp: {
    capable: true,
    title: "طريق",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#071426" },
    { media: "(prefers-color-scheme: light)", color: "#0a1e3d" },
  ],
  width: "device-width",
  initialScale: 1,
  // بلا هادشي المحتوى ماكيتمدّش تحت الـnotch/الجزيرة الديناميكية
  // ملي التطبيق مزاد للشاشة الرئيسية — كيبقى فراغ أبيض فوق وتحت
  viewportFit: "cover",
};

/** يمنع وميض الوضع الفاتح/الداكن قبل التحميل */
const themeScript = `(function(){try{var s=localStorage.getItem('triq:v1');var t=s?JSON.parse(s).theme:'light';document.documentElement.setAttribute('data-theme',t||'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // الجلسة كتتقرا من الكوكي فالخادم — هي المصدر الوحيد للحقيقة
  const user = await getCurrentUser();
  const unread = user ? await unreadCount(user.id).catch(() => 0) : 0;

  return (
    <html lang="ar" dir="rtl" data-theme="light" className={`${body.variable} ${kufi.variable} ${num.variable}`}>
      <head>
        {/* Next كيصيفط mobile-web-app-capable وحدو؛ آيفون قبل iOS 16.4
            كيقرا غير هاد الوسم القديم باش يفتح بلا شريط سفاري */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <SessionProvider user={user} unread={unread}>
        <AppProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:right-3 focus:z-[100] focus:rounded-lg focus:bg-[var(--brand)] focus:px-4 focus:py-2 focus:font-bold focus:text-[var(--brand-ink)]"
          >
            تخطَّ إلى المحتوى
          </a>
          <Header />
          <main id="main" className="pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
            {children}
          </main>
          <Footer />
          <CompareBar />
          <MobileNav />
          <PwaRegister />
        </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
