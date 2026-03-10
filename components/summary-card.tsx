"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Check, Copy, AlertTriangle, Sparkles, Info, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toPng } from "html-to-image"
import { cn } from "@/lib/utils"
import type { DecodedCURP, DecodedRFC } from "@/lib/curp-rfc-decoder"
import { Confetti } from "@/components/confetti"

interface SummaryCardProps {
  decoded: DecodedCURP | DecodedRFC
  type: "curp" | "rfc"
  value: string
}

function isCURPDecoded(decoded: DecodedCURP | DecodedRFC): decoded is DecodedCURP {
  return decoded.summary !== null && "sexo" in decoded.summary
}

export function SummaryCard({ decoded, type, value }: SummaryCardProps) {
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const hasShownConfettiRef = useRef(false)

  // rerender-functional-setstate: stable copy callback
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value.toUpperCase())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [value])

  const handleDownload = useCallback(async () => {
    try {
      setIsDownloading(true)
      const element = document.getElementById("capture-zone")
      if (!element) return

      // Use html-to-image to generate the PNG
      const isDark = document.documentElement.classList.contains("dark")
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: isDark ? "#252322" : "#FFFFFF",
        style: {
          padding: "2rem",
          paddingBottom: "1.5rem",
          borderRadius: "1rem"
        },
      })

      const link = document.createElement("a")
      link.download = `Descifrado_${value.toUpperCase()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Error generating image:", err)
    } finally {
      setIsDownloading(false)
    }
  }, [value])

  // Show confetti when CURP/RFC becomes valid, hide after 3s
  useEffect(() => {
    if (decoded.isValid && !hasShownConfettiRef.current) {
      hasShownConfettiRef.current = true
      // Schedule state update outside synchronous effect body
      const showTimer = setTimeout(() => setShowConfetti(true), 0)
      const hideTimer = setTimeout(() => setShowConfetti(false), 3000)
      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    }
    if (!decoded.isValid) {
      hasShownConfettiRef.current = false
    }
  }, [decoded.isValid])

  if (!decoded.summary) return null

  const summary = decoded.summary
  const isCURP = isCURPDecoded(decoded)

  return (
    <>
      {showConfetti ? <Confetti /> : null}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.3 }}
        className={cn(
          "rounded-lg p-4 sm:p-6 transition-colors duration-300 border bg-card shadow-sm overflow-hidden",
          decoded.isValid
            ? "border-foreground"
            : "border-muted-foreground"
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {decoded.isValid ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground">
                <Check className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-icon-inactive bg-muted text-icon-inactive">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {decoded.isValid ? (
                  <span className="inline-flex items-center gap-2 flex-wrap">
                    {type === "curp" ? "¡CURP válido!" : "¡RFC válido!"}
                    <Sparkles className="h-5 w-5 text-icon-active shrink-0" />
                  </span>
                ) : (
                  `${type === "curp" ? "CURP" : "RFC"} incompleto o con errores`
                )}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {decoded.isValid
                  ? `Según tu ${type.toUpperCase()}, esto es lo que sabemos:`
                  : "Revisa los siguientes detalles:"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 sm:flex-nowrap flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="transition-all hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Guardando
                </>
              ) : (
                <>
                  <Camera className="mr-1 h-4 w-4" />
                  Descargar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="transition-all hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="rounded-md bg-muted/30 p-3 sm:p-4 border border-border min-w-0">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Identificación
            </p>
            <p className="text-sm sm:text-base font-medium text-foreground wrap-break-word">
              {summary.nombreDeducido}
            </p>
          </div>

          <div className="rounded-md bg-muted/30 p-3 sm:p-4 border border-border min-w-0">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              {isCURP ? "Fecha de nacimiento" : "Fecha"}
            </p>
            <p className="text-sm sm:text-base font-medium text-foreground">
              {summary.fechaNacimiento}
            </p>
          </div>

          {isCURP ? (
            <>
              <div className="rounded-md bg-muted/30 p-3 sm:p-4 border border-border min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Sexo
                </p>
                <p className="text-sm sm:text-base font-medium text-foreground">
                  {(decoded.summary as DecodedCURP["summary"])?.sexo}
                </p>
              </div>

              <div className="rounded-md bg-muted/30 p-3 sm:p-4 border border-border min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Entidad de nacimiento
                </p>
                <p className="text-sm sm:text-base font-medium text-foreground wrap-break-word">
                  {(decoded.summary as DecodedCURP["summary"])?.estadoNacimiento}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-md bg-muted/30 p-3 sm:p-4 border border-border min-w-0">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Tipo de contribuyente
              </p>
              <p className="text-sm sm:text-base font-medium text-foreground capitalize">
                {(decoded.summary as DecodedRFC["summary"])?.tipo}
              </p>
            </div>
          )}
        </div>

        {decoded.errors.length > 0 ? (
          <div className="mt-4 sm:mt-6 rounded-md bg-muted/50 border border-muted p-3 sm:p-4 min-w-0">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Advertencias:
            </p>
            <ul className="mt-2 list-inside list-disc text-xs sm:text-sm text-muted-foreground space-y-1 wrap-break-word">
              {decoded.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Validation Disclaimer */}
        <div className="mt-4 sm:mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground/80 flex items-start gap-1.5 leading-relaxed">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="min-w-0">Validamos la estructura de tu documento mediante algoritmos. No consultamos bases de datos externas del SAT ni RENAPO, garantizando tu completa privacidad.</span>
          </p>
        </div>
      </motion.div>
    </>
  )
}
