import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f0f23",
};

export const metadata: Metadata = {
  title: "VEKO - La vision de ce que vous gagnez vraiment",
  description:
    "Application de gestion financiere pour vendeurs africains. Calculez vos prix, suivez vos ventes, gerez vos clients.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VEKO",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('veko-theme-user-set')?localStorage.getItem('veko-theme')||'auto':'auto';if(t==='light'){document.documentElement.setAttribute('data-theme','light');}else if(t==='dark'){document.documentElement.removeAttribute('data-theme');}else{if(!window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','light');}}}catch(e){}})();`,
          }}
        />

      </head>
      <body className={`${inter.variable}`}>
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","vvmt58xcc8");`,
          }}
        />
        <Script
          id="load-fontawesome"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://unpkg.com/@fortawesome/fontawesome-free@7.2.0/css/all.min.css';l.crossOrigin='anonymous';document.head.appendChild(l);})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
