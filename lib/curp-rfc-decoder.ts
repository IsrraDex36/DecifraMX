// Mexican states mapping
export const ESTADOS: Record<string, string> = {
  AS: "Aguascalientes",
  BC: "Baja California",
  BS: "Baja California Sur",
  CC: "Campeche",
  CL: "Coahuila",
  CM: "Colima",
  CS: "Chiapas",
  CH: "Chihuahua",
  DF: "Ciudad de México",
  DG: "Durango",
  GT: "Guanajuato",
  GR: "Guerrero",
  HG: "Hidalgo",
  JC: "Jalisco",
  MC: "Estado de México",
  MN: "Michoacán",
  MS: "Morelos",
  NT: "Nayarit",
  NL: "Nuevo León",
  OC: "Oaxaca",
  PL: "Puebla",
  QT: "Querétaro",
  QR: "Quintana Roo",
  SP: "San Luis Potosí",
  SL: "Sinaloa",
  SR: "Sonora",
  TC: "Tabasco",
  TS: "Tamaulipas",
  TL: "Tlaxcala",
  VZ: "Veracruz",
  YN: "Yucatán",
  ZS: "Zacatecas",
  NE: "Nacido en el Extranjero",
}

// List of inappropriate word combinations the SAT filters out
// Using Set for O(1) lookups (js-set-map-lookups)
export const PALABRAS_INCONVENIENTES = new Set([
  "BACA", "BAKA", "BUEI", "BUEY", "CACA", "CACO", "CAGA", "CAGO",
  "CAKA", "CAKO", "COGE", "COGI", "COJA", "COJE", "COJI", "COJO",
  "COLA", "CULO", "FALO", "FETO", "GETA", "GUEI", "GUEY", "JETA",
  "JOTO", "KACA", "KACO", "KAGA", "KAGO", "KAKA", "KAKO", "KOGE",
  "KOGI", "KOJA", "KOJE", "KOJI", "KOJO", "KOLA", "KULO", "LILO",
  "LOCA", "LOCO", "LOKA", "LOKO", "MAME", "MAMO", "MEAR", "MEAS",
  "MEON", "MIAR", "MION", "MOCO", "MOKO", "MULA", "MULO", "NACA",
  "NACO", "PEDA", "PEDO", "PENE", "PIPI", "PITO", "POPO", "PUTA",
  "PUTO", "QULO", "RATA", "ROBA", "ROBE", "ROBO", "RUIN", "SENO",
  "TETA", "VACA", "VAGA", "VAGO", "VAKA", "VUEI", "VUEY", "WUEI", "WUEY"
])

// ============================================================
// Validación del Dígito Verificador del CURP — RENAPO
// ============================================================
const CURP_CHARSET: Record<string, number> = {
  "0": 0,  "1": 1,  "2": 2,  "3": 3,  "4": 4,
  "5": 5,  "6": 6,  "7": 7,  "8": 8,  "9": 9,
  "A": 10, "B": 11, "C": 12, "D": 13, "E": 14,
  "F": 15, "G": 16, "H": 17, "I": 18, "J": 19,
  "K": 20, "L": 21, "M": 22, "N": 23, "Ñ": 24,
  "O": 25, "P": 26, "Q": 27, "R": 28, "S": 29,
  "T": 30, "U": 31, "V": 32, "W": 33, "X": 34,
  "Y": 35, "Z": 36,
}

export function calcularDigitoVerificador(curp17: string): number {
  let suma = 0
  for (let i = 0; i < 17; i++) {
    const char = curp17[i].toUpperCase()
    const valor = CURP_CHARSET[char]
    if (valor === undefined) {
      throw new Error(`Carácter inválido en posición ${i + 1}: "${char}"`)
    }
    suma += valor * (18 - i)
  }
  const residuo = suma % 10
  return residuo === 0 ? 0 : 10 - residuo
}
export interface CURPSegment {
  chars: string
  startIndex: number
  endIndex: number
  type: "apellido1" | "apellido2" | "nombre" | "fecha" | "sexo" | "estado" | "consonantes" | "homoclave" | "verificador"
  label: string
  description: string
  icon: string
  color: string
}

export interface RFCSegment {
  chars: string
  startIndex: number
  endIndex: number
  type: "apellido1" | "apellido2" | "nombre" | "fecha" | "homoclave"
  label: string
  description: string
  icon: string
  color: string
}

export interface DecodedCURP {
  isValid: boolean
  segments: CURPSegment[]
  summary: {
    nombreDeducido: string
    fechaNacimiento: string
    sexo: string
    estadoNacimiento: string
  } | null
  errors: string[]
}

export interface DecodedRFC {
  isValid: boolean
  segments: RFCSegment[]
  summary: {
    nombreDeducido: string
    fechaNacimiento: string
    tipo: "persona física" | "persona moral"
  } | null
  errors: string[]
}

const MESES: Record<string, string> = {
  "01": "enero", "02": "febrero", "03": "marzo", "04": "abril",
  "05": "mayo", "06": "junio", "07": "julio", "08": "agosto",
  "09": "septiembre", "10": "octubre", "11": "noviembre", "12": "diciembre"
}

function parseDate(yy: string, mm: string, dd: string): { formatted: string; valid: boolean } {
  const month = parseInt(mm)
  const day = parseInt(dd)
  const yearNum = parseInt(yy)
  
  // Determine century: 00-30 → 2000s, 31-99 → 1900s
  const year = yearNum >= 0 && yearNum <= 30 ? 2000 + yearNum : 1900 + yearNum
  
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { formatted: "Fecha inválida", valid: false }
  }
  
  const mesNombre = MESES[mm] || "mes desconocido"
  return { formatted: `${day} de ${mesNombre} de ${year}`, valid: true }
}

function getSexDescription(char: string): { description: string; valid: boolean } {
  if (char === "H") return { description: "Hombre", valid: true }
  if (char === "M") return { description: "Mujer", valid: true }
  if (char === "X") return { description: "No binario", valid: true }
  return { description: "No reconocido (usa H, M o X)", valid: false }
}

function getEstadoDescription(code: string): { description: string; valid: boolean } {
  const estado = ESTADOS[code.toUpperCase()]
  if (estado) return { description: estado, valid: true }
  return { description: "Estado no reconocido", valid: false }
}

export function decodeCURP(curp: string): DecodedCURP {
  const upperCurp = curp.toUpperCase().replace(/\s/g, "")
  const segments: CURPSegment[] = []
  const errors: string[] = []
  
  // CURP structure: AAAA YYMMDD S EE CCC HH
  // 4 chars: first letters of names
  // 6 chars: birth date
  // 1 char: sex
  // 2 chars: state
  // 3 chars: consonants
  // 2 chars: homoclave + check digit
  
  const len = upperCurp.length
  
  // Letras 1 a 4: tus iniciales (apellidos y nombre)
  if (len >= 1) {
    const apellido1Char = upperCurp.slice(0, Math.min(1, len))
    segments.push({
      chars: apellido1Char,
      startIndex: 0,
      endIndex: 0,
      type: "apellido1",
      label: "Primer apellido",
      description: "La primera letra de tu primer apellido. Ej.: si te apellidas García, aquí va la G.",
      icon: "user",
      color: "var(--segment-name)"
    })
  }
  
  if (len >= 2) {
    const vocal = upperCurp.slice(1, 2)
    segments.push({
      chars: vocal,
      startIndex: 1,
      endIndex: 1,
      type: "apellido1",
      label: "Vocal del primer apellido",
      description: "La primera vocal que tenga tu primer apellido. En GARCÍA es la A.",
      icon: "user",
      color: "var(--segment-name)"
    })
  }
  
  if (len >= 3) {
    const apellido2Char = upperCurp.slice(2, 3)
    segments.push({
      chars: apellido2Char,
      startIndex: 2,
      endIndex: 2,
      type: "apellido2",
      label: "Segundo apellido",
      description: "La primera letra de tu segundo apellido.",
      icon: "users",
      color: "var(--segment-name)"
    })
  }
  
  if (len >= 4) {
    const nombreChar = upperCurp.slice(3, 4)
    segments.push({
      chars: nombreChar,
      startIndex: 3,
      endIndex: 3,
      type: "nombre",
      label: "Nombre",
      description: "La primera letra de tu nombre. Si te llamas María o José, a veces usan la del segundo nombre.",
      icon: "sparkles",
      color: "var(--segment-name)"
    })
  }
  
  // Check for inappropriate words
  if (len >= 4) {
    const firstFour = upperCurp.slice(0, 4)
    if (PALABRAS_INCONVENIENTES.has(firstFour)) {
      errors.push(`Las iniciales "${firstFour}" fueron modificadas por el SAT por ser palabra inconveniente`)
    }
  }
  
  // Birth date: positions 4-9
  if (len >= 5) {
    const dateChars = upperCurp.slice(4, Math.min(10, len))
    const yy = dateChars.slice(0, 2)
    const mm = dateChars.slice(2, 4)
    const dd = dateChars.slice(4, 6)
    
    const dateResult = parseDate(yy, mm, dd)
    
    segments.push({
      chars: dateChars,
      startIndex: 4,
      endIndex: Math.min(9, len - 1),
      type: "fecha",
      label: "Fecha de nacimiento",
      description: `${dateResult.formatted}. Son 6 números: año (2), mes (2) y día (2).`,
      icon: "calendar",
      color: "var(--segment-date)"
    })
    
    if (!dateResult.valid && len >= 10) {
      errors.push("La fecha de nacimiento parece inválida")
    }
  }
  
  // Sex: position 10
  if (len >= 11) {
    const sexChar = upperCurp[10]
    const sexResult = getSexDescription(sexChar)
    
    segments.push({
      chars: sexChar,
      startIndex: 10,
      endIndex: 10,
      type: "sexo",
      label: "Sexo",
      description: sexResult.description,
      icon: (sexChar === "H" || sexChar === "M" || sexChar === "X") ? "user" : "help-circle",
      color: "var(--segment-sex)"
    })
    
    if (!sexResult.valid) {
      errors.push("El indicador de sexo no es válido (debe ser H, M o X)")
    }
  }
  
  // Posiciones 12-13: Código de la entidad federativa de nacimiento (RENAPO). NE = nacido en el extranjero.
  if (len >= 12) {
    const stateChars = upperCurp.slice(11, Math.min(13, len))
    const stateResult = getEstadoDescription(stateChars)
    
    segments.push({
      chars: stateChars,
      startIndex: 11,
      endIndex: Math.min(12, len - 1),
      type: "estado",
      label: "Dónde naciste",
      description: `${stateResult.description}. Dos letras que identifican el estado o país (NE = extranjero).`,
      icon: "map-pin",
      color: "var(--segment-state)"
    })
    
    if (!stateResult.valid && len >= 13) {
      errors.push("El código de estado no es reconocido")
    }
  }
  
  // Posiciones 14-16: Primera consonante interna del 1er apellido, del 2do apellido y del nombre (para diferenciar personas con mismas iniciales y fecha).
  if (len >= 14) {
    const consonants = upperCurp.slice(13, Math.min(16, len))
    
    segments.push({
      chars: consonants,
      startIndex: 13,
      endIndex: Math.min(15, len - 1),
      type: "consonantes",
      label: "Tres consonantes",
      description: "La primera consonante interna de tu primer apellido, de tu segundo apellido y de tu nombre. Sirven para que no haya dos CURP iguales cuando dos personas tienen las mismas iniciales y fecha.",
      icon: "type",
      color: "var(--segment-consonants)"
    })
  }
  
  if (len >= 17) {
    const homoclave = upperCurp[16]
    
    segments.push({
      chars: homoclave,
      startIndex: 16,
      endIndex: 16,
      type: "homoclave",
      label: "Diferenciador",
      description: "Una letra o número que asigna el gobierno para que tu CURP sea única. Nadie más puede tener la misma combinación.",
      icon: "hash",
      color: "var(--segment-homoclave)"
    })
  }
  
  if (len >= 18) {
    const checkDigit = upperCurp[17]
    
    segments.push({
      chars: checkDigit,
      startIndex: 17,
      endIndex: 17,
      type: "verificador",
      label: "Número de control",
      description: "Un número del 0 al 9 que se calcula con las 17 letras anteriores. Si alguien se equivoca al escribir tu CURP, este número no cuadra y se detecta el error.",
      icon: "check-circle",
      color: "var(--segment-check)"
    })
  }
  
  // Validate length and mathematical check digit
  const isValidLength = len === 18
  if (len > 0 && len < 18) {
    errors.push(`El CURP debe tener 18 caracteres (tienes ${len})`)
  } else if (len > 18) {
    errors.push(`El CURP tiene demasiados caracteres (${len} en lugar de 18)`)
  } else if (isValidLength) {
    try {
      const cuerpo = upperCurp.slice(0, 17)
      const digitoActual = parseInt(upperCurp[17], 10)
      
      if (isNaN(digitoActual)) {
        errors.push(`El último carácter debe ser un número (dígito verificador)`)
      } else {
        const digitoEsperado = calcularDigitoVerificador(cuerpo)
        if (digitoActual !== digitoEsperado) {
          errors.push(`El dígito verificador no coincide matemáticamente. Se esperaba "${digitoEsperado}". Posible error de tipeo.`)
        }
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "El CURP contiene caracteres inválidos para la validación matemática.")
    }
  }
  
  // Build summary
  let summary = null
  if (len >= 13) {
    const yy = upperCurp.slice(4, 6)
    const mm = upperCurp.slice(6, 8)
    const dd = upperCurp.slice(8, 10)
    const dateResult = parseDate(yy, mm, dd)
    const sexResult = len >= 11 ? getSexDescription(upperCurp[10]) : { description: "No especificado" }
    const stateResult = len >= 13 ? getEstadoDescription(upperCurp.slice(11, 13)) : { description: "No especificado" }
    
    summary = {
      nombreDeducido: `Iniciales: ${upperCurp.slice(0, 4)}`,
      fechaNacimiento: dateResult.formatted,
      sexo: sexResult.description,
      estadoNacimiento: stateResult.description
    }
  }
  
  return {
    isValid: isValidLength && errors.length === 0,
    segments,
    summary,
    errors
  }
}

export function decodeRFC(rfc: string): DecodedRFC {
  const upperRfc = rfc.toUpperCase().replace(/\s/g, "")
  const segments: RFCSegment[] = []
  const errors: string[] = []
  
  const len = upperRfc.length
  const isMoral = len === 12 // Persona moral has 12 chars, física has 13
  
  // For persona física (13 chars): AAAA YYMMDD HHH
  // For persona moral (12 chars): AAA YYMMDD HHH
  
  const nameLength = isMoral ? 3 : 4
  const dateStart = nameLength
  
  // Name initials
  if (len >= 1) {
    const nameChars = upperRfc.slice(0, Math.min(nameLength, len))
    
    if (!isMoral && len >= 4) {
      // Persona física: mismas 4 letras que el CURP (apellidos y nombre)
      segments.push({
        chars: nameChars.slice(0, 1),
        startIndex: 0,
        endIndex: 0,
        type: "apellido1",
        label: "Primer apellido",
        description: "La primera letra de tu primer apellido. Igual que en el CURP.",
        icon: "user",
        color: "var(--segment-name)"
      })
      
      if (len >= 2) {
        segments.push({
          chars: nameChars.slice(1, 2),
          startIndex: 1,
          endIndex: 1,
          type: "apellido1",
          label: "Vocal del primer apellido",
          description: "La primera vocal de tu primer apellido. En GARCÍA es la A.",
          icon: "user",
          color: "var(--segment-name)"
        })
      }
      
      if (len >= 3) {
        segments.push({
          chars: nameChars.slice(2, 3),
          startIndex: 2,
          endIndex: 2,
          type: "apellido2",
          label: "Segundo apellido",
          description: "La primera letra de tu segundo apellido.",
          icon: "users",
          color: "var(--segment-name)"
        })
      }
      
      if (len >= 4) {
        segments.push({
          chars: nameChars.slice(3, 4),
          startIndex: 3,
          endIndex: 3,
          type: "nombre",
          label: "Nombre",
          description: "La primera letra de tu nombre.",
          icon: "sparkles",
          color: "var(--segment-name)"
        })
      }
    } else {
      segments.push({
        chars: nameChars,
        startIndex: 0,
        endIndex: Math.min(nameLength - 1, len - 1),
        type: "nombre",
        label: "Nombre de la empresa",
        description: "Las primeras 3 letras del nombre de la empresa o negocio (como está en el SAT).",
        icon: "building",
        color: "var(--segment-name)"
      })
    }
  }
  
  // Check for inappropriate words (only for persona física)
  if (!isMoral && len >= 4) {
    const firstFour = upperRfc.slice(0, 4)
    if (PALABRAS_INCONVENIENTES.has(firstFour)) {
      errors.push(`Las iniciales "${firstFour}" fueron modificadas por el SAT por ser palabra inconveniente`)
    }
  }
  
  // Birth/constitution date
  if (len > dateStart) {
    const dateChars = upperRfc.slice(dateStart, Math.min(dateStart + 6, len))
    const yy = dateChars.slice(0, 2)
    const mm = dateChars.slice(2, 4)
    const dd = dateChars.slice(4, 6)
    
    const dateResult = parseDate(yy, mm, dd)
    
    segments.push({
      chars: dateChars,
      startIndex: dateStart,
      endIndex: Math.min(dateStart + 5, len - 1),
      type: "fecha",
      label: isMoral ? "Fecha de la empresa" : "Fecha de nacimiento",
      description: isMoral ? `${dateResult.formatted}. El día en que se creó o registró la empresa.` : `${dateResult.formatted}. Año, mes y día en 6 números.`,
      icon: "calendar",
      color: "var(--segment-date)"
    })
  }
  
  const homoStart = dateStart + 6
  if (len > homoStart) {
    const homoclave = upperRfc.slice(homoStart, Math.min(homoStart + 3, len))
    
    segments.push({
      chars: homoclave,
      startIndex: homoStart,
      endIndex: Math.min(homoStart + 2, len - 1),
      type: "homoclave",
      label: "Homoclave",
      description: "Tres letras o números que asigna el SAT. Nadie puede elegirlos: salen de un cálculo. Sirven para que no existan dos RFC iguales.",
      icon: "hash",
      color: "var(--segment-homoclave)"
    })
  }
  
  // Validate length
  const isValidLength = len === 12 || len === 13
  if (len > 0 && len < 12) {
    errors.push(`El RFC debe tener 12 o 13 caracteres (tienes ${len})`)
  } else if (len > 13) {
    errors.push(`El RFC tiene demasiados caracteres (${len} en lugar de 12-13)`)
  }
  
  // Build summary
  let summary = null
  if (len >= dateStart + 6) {
    const yy = upperRfc.slice(dateStart, dateStart + 2)
    const mm = upperRfc.slice(dateStart + 2, dateStart + 4)
    const dd = upperRfc.slice(dateStart + 4, dateStart + 6)
    const dateResult = parseDate(yy, mm, dd)
    
    summary = {
      nombreDeducido: isMoral ? `Razón social: ${upperRfc.slice(0, 3)}...` : `Iniciales: ${upperRfc.slice(0, 4)}`,
      fechaNacimiento: dateResult.formatted,
      tipo: (isMoral ? "persona moral" : "persona física") as "persona física" | "persona moral"
    }
  }
  
  return {
    isValid: isValidLength && errors.length === 0,
    segments,
    summary,
    errors
  }
}
