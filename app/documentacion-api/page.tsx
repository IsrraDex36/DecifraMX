"use client"

import Link from "next/link"
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Copy,
  Globe,
  Play,
  Shield,
  TimerReset,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { PrivacyModal } from "@/components/privacy-modal"

const BASE_URL = "https://deciframx.vercel.app"

type EndpointDoc = {
  id: "curp-post" | "curp-get" | "rfc-post" | "states-get"
  title: string
  method: "GET" | "POST"
  path: string
  description: string
  body?: string
  curl: string
}

const endpoints: EndpointDoc[] = [
  {
    id: "curp-post",
    title: "Validar CURP (POST)",
    method: "POST",
    path: "/api/validate/curp",
    description: "Valida estructura, campos y digito verificador del CURP.",
    body: `{"curp":"HEGJ850101HDFRLN08"}`,
    curl: `curl -X POST "${BASE_URL}/api/validate/curp" \\
  -H "Content-Type: application/json" \\
  -d "{\\"curp\\":\\"HEGJ850101HDFRLN08\\"}"`,
  },
  {
    id: "curp-get",
    title: "Validar CURP (GET)",
    method: "GET",
    path: "/api/validate/curp/{curp}",
    description: "Misma validacion del endpoint POST, enviando el CURP en ruta.",
    curl: `curl "${BASE_URL}/api/validate/curp/HEGJ850101HDFRLN08"`,
  },
  {
    id: "rfc-post",
    title: "Validar RFC (POST)",
    method: "POST",
    path: "/api/validate/rfc",
    description: "Valida RFC de persona fisica o moral (12 o 13 caracteres).",
    body: `{"rfc":"HEGJ850101ABC"}`,
    curl: `curl -X POST "${BASE_URL}/api/validate/rfc" \\
  -H "Content-Type: application/json" \\
  -d "{\\"rfc\\":\\"HEGJ850101ABC\\"}"`,
  },
  {
    id: "states-get",
    title: "Catalogo de estados",
    method: "GET",
    path: "/api/states",
    description: "Devuelve codigos y nombres de entidades para CURP.",
    curl: `curl "${BASE_URL}/api/states"`,
  },
]

const fetchExample = `const response = await fetch("${BASE_URL}/api/validate/curp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ curp: "HEGJ850101HDFRLN08" }),
});

const data = await response.json();
console.log(response.status, data);`

const errorRows = [
  ["INVALID_FORMAT", "400 / 415", "JSON malformado o content-type invalido."],
  ["MISSING_FIELD", "400", "Falta el campo obligatorio en body."],
  ["INVALID_LENGTH", "400", "Longitud invalida de CURP o RFC."],
  ["INVALID_DATE", "400", "Fecha de nacimiento invalida."],
  ["INVALID_STATE", "400", "Codigo de estado no reconocido en CURP."],
  ["INVALID_GENDER", "400", "Sexo invalido en CURP (H o M)."],
  ["RATE_LIMIT_EXCEEDED", "429", "Limite de peticiones excedido por IP."],
]

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  const isPost = method === "POST"
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold border ${
        isPost
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted text-foreground border-border"
      }`}
    >
      {method}
    </span>
  )
}

async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copiado`)
  } catch {
    toast.error("No se pudo copiar")
  }
}

export default function ApiDocumentationPage() {
  const [playgroundId, setPlaygroundId] = useState<EndpointDoc["id"]>("curp-post")
  const [pathValue, setPathValue] = useState("HEGJ850101HDFRLN08")
  const [jsonBody, setJsonBody] = useState(`{"curp":"HEGJ850101HDFRLN08"}`)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    status: number
    headers: Record<string, string>
    data: unknown
  } | null>(null)

  const selectedEndpoint = useMemo(
    () => endpoints.find((endpoint) => endpoint.id === playgroundId) ?? endpoints[0],
    [playgroundId]
  )

  const canUsePathInput = selectedEndpoint.id === "curp-get"
  const canUseBodyInput = selectedEndpoint.method === "POST"

  useEffect(() => {
    if (selectedEndpoint.id === "curp-post") {
      setJsonBody(`{"curp":"HEGJ850101HDFRLN08"}`)
      return
    }
    if (selectedEndpoint.id === "rfc-post") {
      setJsonBody(`{"rfc":"HEGJ850101ABC"}`)
    }
  }, [selectedEndpoint.id])

  async function runPlaygroundRequest() {
    setIsLoading(true)
    setResult(null)
    try {
      let url = selectedEndpoint.path
      if (selectedEndpoint.id === "curp-get") {
        const safeCurp = pathValue.trim().toUpperCase()
        url = `/api/validate/curp/${encodeURIComponent(safeCurp)}`
      }

      const requestInit: RequestInit = {
        method: selectedEndpoint.method,
      }

      if (canUseBodyInput) {
        let parsedBody: unknown
        try {
          parsedBody = JSON.parse(jsonBody)
        } catch {
          toast.error("El JSON del body no es valido")
          setIsLoading(false)
          return
        }
        requestInit.headers = { "Content-Type": "application/json" }
        requestInit.body = JSON.stringify(parsedBody)
      }

      const response = await fetch(url, requestInit)
      let data: unknown
      try {
        data = await response.json()
      } catch {
        data = { message: "La respuesta no fue JSON" }
      }

      const interestingHeaders = [
        "x-request-id",
        "x-response-time-ms",
        "x-ratelimit-limit",
        "x-ratelimit-remaining",
        "x-ratelimit-reset",
        "retry-after",
      ]
      const headers: Record<string, string> = {}
      for (const key of interestingHeaders) {
        const value = response.headers.get(key)
        if (value) headers[key] = value
      }

      setResult({
        status: response.status,
        headers,
        data,
      })
    } catch {
      toast.error("No se pudo ejecutar la solicitud")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-14 sm:py-20 animate-slide-up">
      <header className="mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-4">
          <BookOpen className="h-3.5 w-3.5" />
          Documentacion API
        </div>

        <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
          API de DescifraMX
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
          Integra validacion de CURP y RFC en minutos. Esta guia incluye base URL, endpoints, cURL y
          codigos de error.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 sm:mb-12">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Base URL</p>
          <p className="font-mono text-xs text-foreground break-all mb-3">{BASE_URL}</p>
          <Button size="sm" variant="outline" onClick={() => copyText(BASE_URL, "Base URL")}>
            <Copy className="h-3.5 w-3.5" />
            Copiar
          </Button>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <TimerReset className="h-3.5 w-3.5" /> Rate limit
          </p>
          <p className="text-sm text-foreground">100 peticiones por hora / IP</p>
          <p className="text-xs text-muted-foreground mt-2">Headers: X-RateLimit-* y Retry-After</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> CORS
          </p>
          <p className="text-sm text-foreground">Access-Control-Allow-Origin: *</p>
          <p className="text-xs text-muted-foreground mt-2">Compatible con frontend externo</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> OpenAPI JSON
          </p>
          <Link
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4"
          >
            Ver especificacion <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 sm:p-7 mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-4 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-icon-active" />
          Endpoints
        </h2>

        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <article key={endpoint.path} className="rounded-md border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{endpoint.title}</p>
                  <div className="flex items-center gap-2">
                    <MethodBadge method={endpoint.method} />
                    <code className="text-xs sm:text-sm text-foreground font-mono">{endpoint.path}</code>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => copyText(endpoint.curl, `cURL ${endpoint.title}`)}>
                  <Copy className="h-3.5 w-3.5" />
                  Copiar cURL
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>

              <div className="grid gap-3 lg:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Body</p>
                  <pre className="text-xs overflow-x-auto rounded-sm border border-border bg-background p-3 text-foreground min-h-16">
                    <code>{endpoint.body ?? "No aplica"}</code>
                  </pre>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Ejemplo cURL</p>
                  <pre className="text-xs overflow-x-auto rounded-sm border border-border bg-background p-3 text-foreground min-h-16">
                    <code>{endpoint.curl}</code>
                  </pre>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 sm:p-7 mb-10">
        <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-4">Quick start (JavaScript)</h2>
        <pre className="text-xs sm:text-sm overflow-x-auto rounded-sm border border-border bg-background p-4 text-foreground">
          <code>{fetchExample}</code>
        </pre>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 sm:p-7 mb-10">
        <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-4">Playground API</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Prueba endpoints en vivo desde esta pagina y revisa status, headers y respuesta.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                Endpoint
              </span>
              <select
                value={playgroundId}
                onChange={(event) => setPlaygroundId(event.target.value as EndpointDoc["id"])}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {endpoints.map((endpoint) => (
                  <option key={endpoint.id} value={endpoint.id}>
                    {endpoint.method} {endpoint.path}
                  </option>
                ))}
              </select>
            </label>

            {canUsePathInput ? (
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Parametro de ruta (curp)
                </span>
                <input
                  value={pathValue}
                  onChange={(event) => setPathValue(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground font-mono"
                  placeholder="HEGJ850101HDFRLN08"
                />
              </label>
            ) : null}

            {canUseBodyInput ? (
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
                  Body JSON
                </span>
                <textarea
                  value={jsonBody}
                  onChange={(event) => setJsonBody(event.target.value)}
                  className="w-full min-h-28 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground font-mono"
                />
              </label>
            ) : null}

            <Button onClick={runPlaygroundRequest} disabled={isLoading} className="w-full sm:w-auto">
              <Play className="h-3.5 w-3.5" />
              {isLoading ? "Ejecutando..." : "Ejecutar request"}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Status</p>
              <p className="text-sm font-medium text-foreground">
                {result ? result.status : "Aun sin ejecutar"}
              </p>
            </div>

            <div className="rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Headers</p>
                {result ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyText(JSON.stringify(result.headers, null, 2), "Headers")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar
                  </Button>
                ) : null}
              </div>
              <pre className="text-xs overflow-x-auto rounded-sm border border-border bg-background p-3 text-foreground min-h-24">
                <code>{result ? JSON.stringify(result.headers, null, 2) : "{}"}</code>
              </pre>
            </div>

            <div className="rounded-md border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Respuesta JSON</p>
                {result ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyText(JSON.stringify(result.data, null, 2), "Respuesta")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar
                  </Button>
                ) : null}
              </div>
              <pre className="text-xs overflow-x-auto rounded-sm border border-border bg-background p-3 text-foreground min-h-36">
                <code>{result ? JSON.stringify(result.data, null, 2) : "{ }"}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 sm:p-7 mb-10">
        <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-4">Codigos de error</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs uppercase tracking-wider text-muted-foreground py-2 pr-3">Codigo</th>
                <th className="text-left text-xs uppercase tracking-wider text-muted-foreground py-2 pr-3">HTTP</th>
                <th className="text-left text-xs uppercase tracking-wider text-muted-foreground py-2">Descripcion</th>
              </tr>
            </thead>
            <tbody>
              {errorRows.map(([code, http, description]) => (
                <tr key={code} className="border-b border-border/70 last:border-b-0">
                  <td className="py-3 pr-3">
                    <code className="text-xs sm:text-sm text-foreground">{code}</code>
                  </td>
                  <td className="py-3 pr-3 text-sm text-foreground">{http}</td>
                  <td className="py-3 text-sm text-muted-foreground">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="text-sm text-muted-foreground border-t border-border pt-6">
        <p className="inline-flex items-start gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 text-icon-active shrink-0" />
          Esta API valida estructura y consistencia algoritmica. No consulta bases oficiales SAT/RENAPO ni almacena CURP/RFC de forma persistente.
        </p>
        <div>
          <span>Politica de privacidad: </span>
          <PrivacyModal
            label="ver detalles"
            className="text-primary hover:underline underline-offset-4"
          />
          <span>.</span>
        </div>
      </footer>
    </main>
  )
}
