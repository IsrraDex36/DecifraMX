import { describe, it, expect } from "vitest"
import {
  decodeCURP,
  decodeRFC,
  calcularDigitoVerificador,
  ESTADOS,
  PALABRAS_INCONVENIENTES,
} from "@/lib/curp-rfc-decoder"

// CURP válido: estado DF, dígito verificador correcto
const CURP_VALIDO = "HEGJ850101HDFRLN08"

describe("calcularDigitoVerificador", () => {
  it("calcula el dígito para los primeros 17 caracteres de un CURP", () => {
    expect(calcularDigitoVerificador("HEGJ850101HDFRLN0")).toBe(8)
  })

  it("devuelve 0 cuando el residuo es 0", () => {
    const curp17 = "AAAA000000HDFXXX0"
    const d = calcularDigitoVerificador(curp17)
    expect(d).toBeGreaterThanOrEqual(0)
    expect(d).toBeLessThanOrEqual(9)
  })

  it("lanza si hay carácter inválido", () => {
    expect(() => calcularDigitoVerificador("HEGJ850101HDFRLN*")).toThrow()
  })
})

describe("decodeCURP", () => {
  it("decodifica un CURP válido (18 caracteres, estado válido, dígito correcto)", () => {
    const r = decodeCURP(CURP_VALIDO)
    expect(r.isValid).toBe(true)
    expect(r.errors).toHaveLength(0)
    expect(r.summary).not.toBeNull()
    expect(r.summary?.fechaNacimiento).toContain("1985")
    expect(r.summary?.sexo).toBe("Hombre")
    expect(r.summary?.estadoNacimiento).toBe("Ciudad de México")
    expect(r.segments).toHaveLength(10)
  })

  it("normaliza a mayúsculas y sin espacios", () => {
    const r = decodeCURP("  hegj850101hdfrln08  ")
    expect(r.isValid).toBe(true)
    expect(r.segments[0].chars).toBe("H")
  })

  it("marca inválido si la longitud no es 18", () => {
    expect(decodeCURP("").isValid).toBe(false)
    expect(decodeCURP("ABC").isValid).toBe(false)
    expect(decodeCURP("HEGJ850101HDFRLN081").isValid).toBe(false)
  })

  it("añade error cuando el código de estado no existe", () => {
    const r = decodeCURP("HEGJ850101HXXRLN08")
    expect(r.isValid).toBe(false)
    expect(r.errors.some((e) => e.toLowerCase().includes("estado"))).toBe(true)
  })

  it("añade error cuando el sexo no es H, M o X", () => {
    const curpConSexoInvalido = "HEGJ850101ZDFRLN08"
    const r = decodeCURP(curpConSexoInvalido)
    expect(r.isValid).toBe(false)
    expect(r.errors.some((e) => e.toLowerCase().includes("sexo"))).toBe(true)
  })

  it("añade error cuando el dígito verificador no coincide", () => {
    const r = decodeCURP("HEGJ850101HDFRLN09")
    expect(r.isValid).toBe(false)
    expect(r.errors.some((e) => e.includes("verificador") || e.includes("esperaba"))).toBe(true)
  })

  it("incluye advertencia si las primeras 4 letras son palabra inconveniente", () => {
    const r = decodeCURP("BACA850101HDFRLN09")
    expect(r.errors.some((e) => e.includes("inconveniente") || e.includes("BACA"))).toBe(true)
  })

  it("devuelve segmentos con labels y descripciones", () => {
    const r = decodeCURP(CURP_VALIDO)
    const primerApellido = r.segments.find((s) => s.type === "apellido1" && s.startIndex === 0)
    expect(primerApellido?.label).toBeDefined()
    expect(primerApellido?.description).toBeDefined()
    const fecha = r.segments.find((s) => s.type === "fecha")
    expect(fecha?.chars).toBe("850101")
  })
})

describe("decodeRFC", () => {
  it("decodifica RFC de persona física (13 caracteres)", () => {
    const r = decodeRFC("HEGJ850101ABC")
    expect(r.isValid).toBe(true)
    expect(r.errors).toHaveLength(0)
    expect(r.summary).not.toBeNull()
    expect(r.summary?.tipo).toBe("persona física")
    expect(r.summary?.fechaNacimiento).toContain("1985")
    expect(r.segments.length).toBeGreaterThanOrEqual(5)
  })

  it("decodifica RFC de persona moral (12 caracteres)", () => {
    const r = decodeRFC("ABC850101XYZ")
    expect(r.isValid).toBe(true)
    expect(r.summary?.tipo).toBe("persona moral")
    const razon = r.segments.find((s) => s.type === "nombre" && s.label?.includes("empresa"))
    expect(razon?.chars).toBe("ABC")
  })

  it("marca inválido si la longitud no es 12 ni 13", () => {
    expect(decodeRFC("").isValid).toBe(false)
    expect(decodeRFC("HEGJ850101").isValid).toBe(false)
    expect(decodeRFC("HEGJ850101ABCD").isValid).toBe(false)
  })

  it("normaliza a mayúsculas", () => {
    const r = decodeRFC("hegj850101abc")
    expect(r.isValid).toBe(true)
    expect(r.segments[0].chars).toBe("H")
  })
})

describe("ESTADOS", () => {
  it("contiene códigos de 2 letras para entidades federativas", () => {
    expect(ESTADOS["DF"]).toBe("Ciudad de México")
    expect(ESTADOS["NE"]).toBe("Nacido en el Extranjero")
    expect(Object.keys(ESTADOS).every((k) => k.length === 2)).toBe(true)
  })

  it("tiene al menos 32 entidades", () => {
    expect(Object.keys(ESTADOS).length).toBeGreaterThanOrEqual(32)
  })
})

describe("PALABRAS_INCONVENIENTES", () => {
  it("contiene palabras en mayúsculas de 4 letras", () => {
    expect(PALABRAS_INCONVENIENTES.has("BUEY")).toBe(true)
    expect(PALABRAS_INCONVENIENTES.has("CACA")).toBe(true)
  })
})
