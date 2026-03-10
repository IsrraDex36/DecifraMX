import { NextRequest } from 'next/server';
import { checkRateLimit, cleanupRateLimitMap, getClientIp } from '@/lib/api/rate-limit';
import { apiResponse, apiErrorResponse, sanitizeInput } from '@/lib/api/response';
import { startApiTrace } from '@/lib/api/observability';
import { decodeRFC, PALABRAS_INCONVENIENTES } from '@/lib/curp-rfc-decoder';

export async function POST(request: NextRequest) {
  const trace = startApiTrace(request, '/api/validate/rfc');
  if (Math.random() < 0.1) cleanupRateLimitMap();
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip, 'validate-rfc-post');

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

  const rfc = sanitizeInput((body as { rfc?: unknown }).rfc);

  if (!rfc) {
    return apiErrorResponse(
      [{ code: 'MISSING_FIELD', message: 'El campo "rfc" es requerido en el body.', field: 'rfc' }],
      400,
      undefined,
      rateLimit.headers,
      trace
    );
  }

  if (!/^[A-Z0-9]+$/.test(rfc)) {
    return apiErrorResponse(
      [{ code: 'INVALID_FORMAT', message: 'El RFC solo puede contener letras y números.', field: 'rfc' }],
      400,
      rfc,
      rateLimit.headers,
      trace
    );
  }

  if (rfc.length !== 12 && rfc.length !== 13) {
    return apiErrorResponse(
      [{ code: 'INVALID_LENGTH', message: 'El RFC debe tener 12 o 13 caracteres.', field: 'rfc' }],
      400,
      rfc,
      rateLimit.headers,
      trace
    );
  }

  const decoded = decodeRFC(rfc);

  if (!decoded.isValid) {
    const apiErrors = decoded.errors.map(err => {
      let code = 'INVALID_FORMAT';
      if (err.includes('fecha')) code = 'INVALID_DATE';
      return { code, message: err, field: 'rfc' };
    });

    return apiErrorResponse(apiErrors, 400, rfc, rateLimit.headers, trace);
  }

  // Verificar si hay palabra inconveniente en las primeras 4 letras (personas físicas)
  let tienePalabraInconveniente = false;
  if (rfc.length === 13) {
    const primeras4 = rfc.substring(0, 4);
    if (PALABRAS_INCONVENIENTES.has(primeras4)) {
      tienePalabraInconveniente = true; // Though normally it changes to an X, it's good metadata
    }
  }

  const validResponse = {
    valid: true,
    rfc: rfc,
    tipo: decoded.summary?.tipo === 'persona moral' ? 'persona_moral' : 'persona_fisica',
    data: {
      fechaNacimiento: decoded.summary?.fechaNacimiento || '',
      homoclave: rfc.length === 13 ? rfc.substring(10, 13) : rfc.substring(9, 12),
      tienePalabraInconveniente
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
