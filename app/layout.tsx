import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DescífraMX — Descifra tu CURP y RFC en segundos",
  description:
    "Herramienta educativa para descifrar cada carácter de tu CURP o RFC mexicano. Entiende qué significa cada parte de tu identificación. 100% privado, todo se procesa en tu navegador.",
  keywords: ["CURP", "RFC", "México", "descifrar", "decodificar", "SAT", "identificación"],
  manifest: "/manifest.json",
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
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
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
      </body>
    </html>
  );
}
