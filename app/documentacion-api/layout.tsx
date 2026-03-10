import type { Metadata } from "next"

const SITE_URL = "https://deciframx.vercel.app"

export const metadata: Metadata = {
  title: "Documentacion API",
  description:
    "Referencia oficial para integrar la API de DescifraMX: endpoints de validacion CURP/RFC, rate limit, codigos de error y ejemplos de uso.",
  alternates: { canonical: `${SITE_URL}/documentacion-api` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/documentacion-api`,
    title: "Documentacion API | DescifraMX",
    description:
      "Integra la API de DescifraMX con ejemplos cURL y especificacion OpenAPI para validar CURP y RFC.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Documentacion API DescifraMX" }],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function DocumentationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
