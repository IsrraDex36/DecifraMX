import { NextRequest } from 'next/server';
import { checkRateLimit, cleanupRateLimitMap, getClientIp } from '@/lib/api/rate-limit';
import { apiResponse, apiErrorResponse, sanitizeInput } from '@/lib/api/response';
import { startApiTrace } from '@/lib/api/observability';
import { decodeCURP, calcularDigitoVerificador } from '@/lib/curp-rfc-decoder';

function handleCurpValidation(
  curpParam: string | null,
  headers: HeadersInit,
  trace: ReturnType<typeof startApiTrace>
) {
  const curp = sanitizeInput(curpParam);

  if (!curp) {
    return apiErrorResponse(
      [{ code: 'MISSING_FIELD', message: 'El campo "curp" es requerido en la ruta.', field: 'curp' }],
      400,
      undefined,
      headers,
      trace
    );
  }

  // Basic length check to return specific errors faster before deep parsing
  if (!/^[A-Z0-9]+$/.test(curp)) {
    return apiErrorResponse(
      [{ code: 'INVALID_FORMAT', message: 'El CURP solo puede contener letras y números.', field: 'curp' }],
      400,
      curp,
      headers,
      trace
    );
  }

  // Basic length check to return specific errors faster before deep parsing
  if (curp.length !== 18) {
    return apiErrorResponse(
      [{ code: 'INVALID_LENGTH', message: 'El CURP debe tener exactamente 18 caracteres.', field: 'curp' }],
      400,
      curp,
      headers,
      trace
    );
  }

  const decoded = decodeCURP(curp);

  if (!decoded.isValid) {
    // Map general decoder errors to API specific codes (we try to guess based on length/format of standard errors)
    const apiErrors = decoded.errors.map(err => {
      let code = 'INVALID_FORMAT';
      if (err.includes('fecha')) code = 'INVALID_DATE';
      if (err.includes('estado')) code = 'INVALID_STATE';
      if (err.includes('sexo')) code = 'INVALID_GENDER';
      return { code, message: err, field: 'curp' };
    });

    return apiErrorResponse(apiErrors, 400, curp, headers, trace);
  }

  // If perfectly valid structurally, we compute and match the verificador
  const lastChar = curp.charAt(17);
  // Extract the first 17 to check the math
  const curp17 = curp.substring(0, 17);
  const digitoEsperado = calcularDigitoVerificador(curp17);
  
  // Digit logic matching
  const hasNumberEnd = /[0-9]/.test(lastChar);
  const parsedFound = hasNumberEnd ? parseInt(lastChar, 10) : lastChar; // if it's A..Z we leave as letter
  const esValido = parsedFound == digitoEsperado;

  // Iniciales desde CURP: [0]=1er apellido, [1]=vocal 1er apellido, [2]=2do apellido, [3]=nombre
  const validResponse = {
    valid: true,
    curp: curp,
    verificador: {
      esValido,
      digitoEncontrado: parsedFound,
      digitoEsperado,
      mensaje: esValido 
        ? "✅ CURP matemáticamente auténtico." 
        : "❌ El dígito verificador no coincide con los cálculos matemáticos."
    },
    data: {
      iniciales: curp.substring(0, 4),
      nombre: curp[3] ?? '',
      primerApellido: curp[0] ?? '',
      segundoApellido: curp[2] ?? '',
      fechaNacimiento: decoded.summary?.fechaNacimiento ?? '',
      sexo: decoded.summary?.sexo ?? '',
      estadoNacimiento: decoded.summary?.estadoNacimiento ?? '',
      codigoEstado: curp.substring(11, 13)
    },
    errors: []
  };

  return apiResponse(validResponse, 200, headers, trace);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ curp: string }> }
) {
  const trace = startApiTrace(request, '/api/validate/curp/[curp]');
  if (Math.random() < 0.1) cleanupRateLimitMap();
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip, 'validate-curp-get');

  if (!rateLimit.success) {
    return apiErrorResponse(
      [{ code: 'RATE_LIMIT_EXCEEDED', message: 'Se han excedido las 100 peticiones por hora.' }],
      429,
      undefined,
      rateLimit.headers,
      trace
    );
  }

  // Next.js 15+ needs await on params
  const { curp } = await params;
  return handleCurpValidation(curp, rateLimit.headers, trace);
}

export async function OPTIONS() {
  const allowedOrigin = process.env.API_ALLOWED_ORIGIN || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
  });
}
