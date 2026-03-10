import Image from "next/image"
import { Lock, Zap, Heart } from "lucide-react"
import { DecoderInput } from "@/components/decoder-input"
import { InfoSection } from "@/components/info-section"
import { ThemeToggle } from "@/components/theme-toggle"
import { PrivacyModal } from "@/components/privacy-modal"

export default function Home() {
  return (
    <div className="relative min-h-screen selection:bg-primary/10">
      {/* Skip to content link for a11y */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring focus:rounded-sm border border-border"
      >
        Saltar al contenido principal
      </a>

      {/* Top Header Row */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50">
        <ThemeToggle />
      </div>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-16 sm:py-24 animate-slide-up">
        {/* Hero Section */}
        <header className="mb-16 sm:mb-20">
          <div className="mb-8 flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="DescífraMX Logo" 
              width={48} 
              height={48} 
              className="rounded-md object-contain dark:bg-white dark:p-1"
              priority
            />
            <span className="text-xl sm:text-2xl font-bold tracking-tighter text-foreground">
              DescífraMX.
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground mb-6 tracking-tight leading-[1.1]">
            Comprende la estructura de tu identidad.
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl font-light leading-relaxed mb-8">
            Un diseño transparente para descifrar cada carácter de tu CURP o RFC. Todo se procesa localmente en tu navegador.
          </p>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground border border-border">
              <Lock className="w-3.5 h-3.5" /> Tu información nunca sale del navegador
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground border border-border">
              <Zap className="w-3.5 h-3.5" /> Sin registro
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground border border-border">
              <Heart className="w-3.5 h-3.5  dark:text-green-500" /> Gratis
            </span>
          </div>
        </header>

        {/* Decoder Section */}
        <section className="mb-20 sm:mb-32 relative z-10" aria-label="Decodificador principal">
          <DecoderInput />
        </section>

        {/* Info Section */}
        <InfoSection />

        {/* Footer */}
        <footer className="mt-20 sm:mt-32 py-10 text-sm text-muted-foreground border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="space-y-3">
              <p className="text-foreground font-medium">Hecho con 💚 en México</p>
              <p className="max-w-md text-xs leading-relaxed">
                DescífraMX no está afiliado al SAT, RENAPO ni ninguna entidad gubernamental mexicana. Es una herramienta 100% educativa y sin telemetría.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <a
                href="/documentacion-api"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline underline-offset-4"
                title="La API procesa solicitudes en servidor (sin almacenamiento persistente)."
              >
                API
              </a>
              <PrivacyModal />
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
