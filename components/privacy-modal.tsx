"use client"

import { useRef, useCallback } from "react"
import { Lock, FileText, ServerOff, EyeOff, X } from "lucide-react"

interface PrivacyModalProps {
  label?: string
  className?: string
}

export function PrivacyModal({ label = "Aviso de Privacidad", className }: PrivacyModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const open = useCallback(() => {
    dialogRef.current?.showModal()
  }, [])

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={
          className ?? "hover:text-foreground transition-colors underline underline-offset-4 text-left"
        }
      >
        {label}
      </button>

      <dialog
        ref={dialogRef}
        onCancel={close}
        className="fixed inset-0 z-50 w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] m-auto p-0 rounded-lg sm:rounded-xl border border-border bg-card text-card-foreground shadow-2xl open:flex open:flex-col"
        aria-labelledby="privacy-title"
        aria-modal="true"
      >
        <div className="flex flex-col max-h-[90vh] overflow-hidden min-w-0">
          <header className="flex items-center justify-between gap-3 shrink-0 p-3 sm:p-6 border-b border-border min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center justify-center p-2 sm:p-2.5 bg-muted rounded-lg shrink-0">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" aria-hidden />
              </div>
              <h2 id="privacy-title" className="text-base sm:text-2xl font-semibold tracking-tight truncate">
                Aviso de Privacidad
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="overflow-y-auto overflow-x-hidden p-3 sm:p-6 space-y-6 sm:space-y-10">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed min-w-0 wrap-break-word">
              Nuestra premisa es muy simple: la principal forma de proteger tus datos es no recopilarlos en absoluto.
            </p>

            <section className="space-y-6 sm:space-y-8">
              <div className="space-y-2 sm:space-y-3 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <ServerOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" aria-hidden />
                  <h3 className="text-base sm:text-lg font-medium wrap-break-word">1. Cero recolección de datos</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-6 sm:pl-8 min-w-0 wrap-break-word">
                  DescífraMX no cuenta con bases de datos para almacenar usuarios, códigos, ubicaciones ni fechas de nacimiento. La aplicación es puramente visual y lógica; todo el análisis de tu CURP o RFC se procesa exclusivamente mediante JavaScript dentro de tu dispositivo.
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" aria-hidden />
                  <h3 className="text-base sm:text-lg font-medium wrap-break-word">2. Procesamiento local (Client-side)</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-6 sm:pl-8 min-w-0 wrap-break-word">
                  Cuando escribes un carácter en la caja de texto central, el código que descifra la estructura de las claves gubernamentales se ejecuta directamente en el navegador de tu computadora o celular. Ni un solo bit de esa información viaja a internet o a servidores externos en esa experiencia web.
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" aria-hidden />
                  <h3 className="text-base sm:text-lg font-medium wrap-break-word">3. API publica y tratamiento temporal</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-6 sm:pl-8 min-w-0 wrap-break-word">
                  Si usas los endpoints de API, el procesamiento ocurre en servidor para responder la solicitud HTTP. No se persisten CURP/RFC en bases de datos ni se realizan consultas a RENAPO/SAT; la API solo valida estructura y devuelve resultado.
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" aria-hidden />
                  <h3 className="text-base sm:text-lg font-medium wrap-break-word">4. Sin afiliación gubernamental</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-6 sm:pl-8 min-w-0 wrap-break-word">
                  Este proyecto es independiente, educativo y de código abierto. No existe conexión ni comunicación alguna con herramientas de SEGOB, RENAPO o el SAT. Nuestro propósito es únicamente didáctico: que comprendas cómo está ensamblada tu identidad digital en México.
                </p>
              </div>
            </section>

            <div className="pt-4 sm:pt-6 border-t border-border">
              <p className="text-xs sm:text-sm text-muted-foreground text-center wrap-break-word">
                Última actualización: Marzo 2026.
                <br className="sm:hidden" />
                Válido en todo momento porque nunca cambiaremos este enfoque.
              </p>
            </div>
          </div>
        </div>
      </dialog>
    </>
  )
}
