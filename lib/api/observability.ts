import type { NextRequest } from 'next/server';
import { getClientIp } from '@/lib/api/rate-limit';

export interface ApiTrace {
  requestId: string;
  route: string;
  method: string;
  startedAt: number;
  clientIpMasked: string;
}

function buildRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function maskIp(ip: string) {
  if (!ip) return 'unknown';
  if (ip.includes(':')) {
    const chunks = ip.split(':').filter(Boolean);
    return `${chunks.slice(0, 3).join(':')}:****`;
  }
  const parts = ip.split('.');
  if (parts.length !== 4) return 'unknown';
  return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
}

export function startApiTrace(request: NextRequest, route: string): ApiTrace {
  return {
    requestId: buildRequestId(),
    route,
    method: request.method,
    startedAt: Date.now(),
    clientIpMasked: maskIp(getClientIp(request)),
  };
}

export function logApiTrace(trace: ApiTrace, status: number, isValid: boolean) {
  const durationMs = Date.now() - trace.startedAt;
  console.info(
    JSON.stringify({
      type: 'api.request',
      requestId: trace.requestId,
      route: trace.route,
      method: trace.method,
      status,
      valid: isValid,
      durationMs,
      ip: trace.clientIpMasked,
      at: new Date().toISOString(),
    })
  );
}
