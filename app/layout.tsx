import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://deciframx.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DescífraMX — Descifra tu CURP y RFC en segundos",
    template: "%s | DescífraMX",
  },
  description:
    "Herramienta educativa para descifrar cada carácter de tu CURP o RFC mexicano. Entiende qué significa cada parte de tu identificación. 100% privado, todo se procesa en tu navegador.",
  keywords: [
    "CURP",
    "RFC",
    "México",
    "descifrar",
    "decodificar",
    "SAT",
    "RENAPO",
    "identificación",
    "clave única",
    "registro federal contribuyentes",
  ],
  authors: [{ name: "DescífraMX" }],
  creator: "DescífraMX",
  publisher: "DescífraMX",
  formatDetection: { email: false, address: false, telephone: false },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: SITE_URL,
    siteName: "DescífraMX",
    title: "DescífraMX — Descifra tu CURP y RFC en segundos",
    description:
      "Herramienta educativa para descifrar cada carácter de tu CURP o RFC mexicano. 100% privado, todo se procesa en tu navegador.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "DescífraMX — Descifra tu CURP y RFC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DescífraMX — Descifra tu CURP y RFC en segundos",
    description:
      "Herramienta educativa para descifrar cada carácter de tu CURP o RFC mexicano. 100% privado.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  appleWebApp: {
    title: "DescífraMX",
    statusBarStyle: "black-translucent",
    capable: true,
  },
};

export const viewport = {
  themeColor: "#123458",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "DescífraMX",
    description: "Herramienta educativa para descifrar cada carácter de tu CURP o RFC mexicano. 100% privado, todo se procesa en tu navegador.",
    url: SITE_URL,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "MXN" },
    inLanguage: "es-MX",
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark') {
                  document.documentElement.classList.add('dark')
                  document.documentElement.style.colorScheme = 'dark'
                } else {
                  document.documentElement.classList.remove('dark')
                  document.documentElement.style.colorScheme = 'light'
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${sora.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
