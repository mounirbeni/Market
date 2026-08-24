import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/store/app";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompareBar } from "@/components/CompareBar";

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const latin = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-latin",
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
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070a0f" },
    { media: "(prefers-color-scheme: light)", color: "#fbf8f2" },
  ],
  width: "device-width",
  initialScale: 1,
};

/** يمنع وميض الوضع الفاتح/الداكن قبل التحميل */
const themeScript = `(function(){try{var s=localStorage.getItem('triq:v1');var t=s?JSON.parse(s).theme:'dark';document.documentElement.setAttribute('data-theme',t||'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark" className={`${arabic.variable} ${latin.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <AppProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:right-3 focus:z-[100] focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:font-bold focus:text-[var(--accent-ink)]"
          >
            تخطَّ إلى المحتوى
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CompareBar />
        </AppProvider>
      </body>
    </html>
  );
}
