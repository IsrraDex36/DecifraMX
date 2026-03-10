"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { decodeCURP, decodeRFC } from "@/lib/curp-rfc-decoder"
import { DecoderDisplay } from "@/components/decoder-display"
import { SummaryCard } from "@/components/summary-card"
import { toast } from "sonner"

type DocumentType = "curp" | "rfc"
type RecentEntry = { type: DocumentType; value: string }
const RECENT_STORAGE_KEY = "deciframx.recent.v1"

export function DecoderInput() {
  const [docType, setDocType] = useState<DocumentType>("curp")
  const [value, setValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [recentItems, setRecentItems] = useState<RecentEntry[]>([])
  const lastPersistedRef = useRef<string>("")

  const decoded = docType === "curp" ? decodeCURP(value) : decodeRFC(value)

  const handleClear = useCallback(() => {
    setValue("")
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as RecentEntry[]
      if (!Array.isArray(parsed)) return
      const safe = parsed.filter(
        (item): item is RecentEntry =>
          typeof item?.value === "string" && (item?.type === "curp" || item?.type === "rfc")
      )
      setRecentItems(safe.slice(0, 6))
    } catch {
      // Silently ignore corrupted localStorage values.
    }
  }, [])

  useEffect(() => {
    const completedLength = docType === "curp" ? 18 : value.length >= 12 ? value.length : 13
    const isComplete = value.length === completedLength
    if (!decoded.isValid || !isComplete) return

    const entry: RecentEntry = { type: docType, value: value.toUpperCase() }
    const entryKey = `${entry.type}:${entry.value}`
    if (entryKey === lastPersistedRef.current) return
    lastPersistedRef.current = entryKey

    setRecentItems((prev) => {
      const next = [entry, ...prev.filter((item) => !(item.type === entry.type && item.value === entry.value))]
        .slice(0, 6)
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage quota and privacy mode failures.
      }
      return next
    })
  }, [decoded.isValid, docType, value])

  const handleUseRecent = useCallback((entry: RecentEntry) => {
    setDocType(entry.type)
    setValue(entry.value)
  }, [])

  const clearRecent = useCallback(() => {
    setRecentItems([])
    try {
      localStorage.removeItem(RECENT_STORAGE_KEY)
    } catch {
      // noop
    }
    toast.success("Historial limpiado")
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase()
    const maxLength = docType === "curp" ? 18 : 13
    if (newValue.length <= maxLength) {
      setValue(newValue)
    }
  }

  const placeholder = docType === "curp" 
    ? "Ej. GODE850101HDFRRL09…" 
    : "Ej. GODE850101ABC…"

  return (
    <div className="w-full space-y-10">
      {/* Document Type Toggle */}
      <div className="flex justify-center" role="tablist" aria-label="Tipo de documento">
        <div className="inline-flex rounded-md border border-border bg-card p-1 shadow-sm">
          <button
            role="tab"
            aria-selected={docType === "curp"}
            aria-controls="document-input"
            onClick={() => {
              setDocType("curp")
              setValue("")
            }}
            className={cn(
              "px-8 py-2.5 rounded-sm text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              docType === "curp"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            CURP
          </button>
          <button
            role="tab"
            aria-selected={docType === "rfc"}
            aria-controls="document-input"
            onClick={() => {
              setDocType("rfc")
              setValue("")
            }}
            className={cn(
              "px-8 py-2.5 rounded-sm text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              docType === "rfc"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            RFC
          </button>
        </div>
      </div>

      {recentItems.length > 0 ? (
        <div className="max-w-2xl mx-auto rounded-md border border-border bg-card px-3 py-3 sm:px-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Recientes</p>
            <button
              type="button"
              onClick={clearRecent}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentItems.map((entry) => (
              <button
                type="button"
                key={`${entry.type}-${entry.value}`}
                onClick={() => handleUseRecent(entry)}
                className="inline-flex items-center gap-1 rounded-sm border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
              >
                <span className="font-semibold text-muted-foreground">{entry.type.toUpperCase()}</span>
                <span className="font-mono">{entry.value}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Input Field */}
      <div className="relative max-w-2xl mx-auto group mt-8 sm:mt-12">
        <label htmlFor="document-input" className="sr-only">
          Ingresa tu {docType.toUpperCase()}
        </label>
        <input
          id="document-input"
          name="document-input"
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          aria-label={`Ingresa tu ${docType.toUpperCase()}`}
          className={cn(
            "relative w-full border-b-2 bg-transparent px-2 py-4 sm:py-6 text-center text-4xl sm:text-5xl md:text-6xl font-mono font-medium tracking-[0.2em] sm:tracking-[0.25em] transition-all duration-300",
            "placeholder:text-muted-foreground/30 placeholder:tracking-normal placeholder:font-sans placeholder:text-2xl sm:placeholder:text-3xl",
            "focus:outline-none",
            "touch-manipulation rounded-none",
            value.length > 0 && decoded.isValid
              ? "border-foreground"
              : value.length > 0
              ? "border-muted-foreground"
              : "border-border hover:border-muted-foreground focus:border-foreground"
          )}
          autoComplete="off"
          spellCheck={false}
        />
        {value ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Limpiar campo"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
        <div className="mt-6 flex animate-fade-in items-center justify-center gap-4">
          <div className="h-0.5 flex-1 max-w-50 overflow-hidden bg-muted">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                decoded.isValid ? "bg-foreground" : "bg-muted-foreground"
              )}
              style={{ width: `${(value.length / (docType === "curp" ? 18 : 13)) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground min-w-12 text-right" aria-live="polite">
            {value.length}/{docType === "curp" ? 18 : 13}
          </span>
        </div>

        {/* Privacy Note on Focus */}
        <div className={cn(
          "absolute -bottom-8 left-0 right-0 text-center transition-all duration-300",
          isFocused ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        )}>
          <span className="text-[11px] text-muted-foreground">
            Tu información no se almacena ni se envía a ningún servidor. Todo se procesa localmente en tu navegador.
          </span>
        </div>
      </div>

      {/* Decoder Display */}
      {value.length > 0 ? (
        <div id="capture-zone" className="space-y-8 bg-card p-2 sm:p-6 -mx-2 sm:-mx-6 rounded-2xl">
          <DecoderDisplay
            value={value}
            segments={decoded.segments}
            type={docType}
          />
          
          {/* Summary Card */}
          {decoded.summary !== null ? (
            <div>
              <SummaryCard decoded={decoded} type={docType} value={value} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
