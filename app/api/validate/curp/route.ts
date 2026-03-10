import { NextRequest } from 'next/server';
import { checkRateLimit, cleanupRateLimitMap, getClientIp } from '@/lib/api/rate-limit';
import { apiResponse, apiErrorResponse, sanitizeInput } from '@/lib/api/response';
import { startApiTrace } from '@/lib/api/observability';
import { decodeCURP, calcularDigitoVerificador } from '@/lib/curp-rfc-decoder';

export async function POST(request: NextRequest) {
  const trace = startApiTrace(request, '/api/validate/curp');
  if (Math.random() < 0.1) cleanupRateLimitMap();
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip, 'validate-curp-post');

  if (!rateLimit.success) {
    return apiErrorResponse(
      [{ code: 'RATE_LIMIT_EXCEEDED', message: 'Se han excedido las 100 peticiones por hora.' }],
      429,
      undefined,
      rateLimit.headers,
      trace
    );
  }

  // Validate Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return apiErrorResponse(
      [{ code: 'INVALID_FORMAT', message: 'Content-Type debe ser application/json.' }],
      415,
      undefined,
      rateLimit.headers,
      trace
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    return apiErrorResponse(
      [{ code: 'INVALID_FORMAT', message: 'Payload JSON inválido o malformado.' }],
      400,
      undefined,
      rateLimit.headers,
      trace
    );
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return apiErrorResponse(
      [{ code: 'INVALID_FORMAT', message: 'El body debe ser un objeto JSON.' }],
      400,
      undefined,
      rateLimit.headers,
      trace
    );
  }

  const curp = sanitizeInput((body as { curp?: unknown }).curp);

  if (!curp) {
    return apiErrorResponse(
      [{ code: 'MISSING_FIELD', message: 'El campo "curp" es requerido en el body.', field: 'curp' }],
      400,
      undefined,
      rateLimit.headers,
      trace
    );
  }

  if (!/^[A-Z0-9]+$/.test(curp)) {
    return apiErrorResponse(
      [{ code: 'INVALID_FORMAT', message: 'El CURP solo puede contener letras y números.', field: 'curp' }],
      400,
      curp,
      rateLimit.headers,
      trace
    );
  }

  if (curp.length !== 18) {
    return apiErrorResponse(
      [{ code: 'INVALID_LENGTH', message: 'El CURP debe tener exactamente 18 caracteres.', field: 'curp' }],
      400,
      curp,
      rateLimit.headers,
      trace
    );
  }

  const decoded = decodeCURP(curp);

  if (!decoded.isValid) {
    // Map general decoder errors to API specific codes
    const apiErrors = decoded.errors.map(err => {
      let code = 'INVALID_FORMAT';
      if (err.includes('fecha')) code = 'INVALID_DATE';
      if (err.includes('estado')) code = 'INVALID_STATE';
      if (err.includes('sexo')) code = 'INVALID_GENDER';
      return { code, message: err, field: 'curp' };
    });

    return apiErrorResponse(apiErrors, 400, curp, rateLimit.headers, trace);
  }

  const lastChar = curp.charAt(17);
  const curp17 = curp.substring(0, 17);
  const digitoEsperado = calcularDigitoVerificador(curp17);
  
  const hasNumberEnd = /[0-9]/.test(lastChar);
  const parsedFound = hasNumberEnd ? parseInt(lastChar, 10) : lastChar;
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

  return apiResponse(validResponse, 200, rateLimit.headers, trace);
}

export async function OPTIONS() {
  const allowedOrigin = process.env.API_ALLOWED_ORIGIN || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
  });
}
