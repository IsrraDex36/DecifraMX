import type { NextRequest } from 'next/server';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

/**
 * Obtiene la IP del cliente desde la request (Vercel/Edge usa request.ip; sino headers).
 */
export function getClientIp(request: NextRequest): string {
  const withIp = request as NextRequest & { ip?: string };
  return (
    withIp.ip ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

const rateLimitMap = new Map<string, RateLimitInfo>();
const RATE_LIMIT = 100;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Checks if a given IP has exceeded the rate limit.
 * @param ip The IP address of the client
 * @returns Object indicating if limit is exceeded and the remaining time to reset in seconds
 */
export function checkRateLimit(ip: string, scope = 'global'): { success: boolean; headers: HeadersInit } {
  const now = Date.now();
  const key = `${scope}:${ip}`;
  let info = rateLimitMap.get(key);

  if (!info) {
    info = { count: 1, resetTime: now + WINDOW_MS };
    rateLimitMap.set(key, info);
  } else {
    // Check if the window has passed
    if (now > info.resetTime) {
      info.count = 1;
      info.resetTime = now + WINDOW_MS;
    } else {
      info.count++;
    }
  }

  const isRateLimited = info.count > RATE_LIMIT;
  const remaining = Math.max(0, RATE_LIMIT - info.count);
  const resetSeconds = Math.ceil((info.resetTime - now) / 1000);

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': RATE_LIMIT.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetSeconds.toString(),
  };

  if (isRateLimited) {
    headers['Retry-After'] = resetSeconds.toString();
  }

  return { success: !isRateLimited, headers };
}

/**
 * Clean up the rate limit map to prevent memory leaks over time.
 * Can be called periodically or randomly on requests.
 */
export function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [key, info] of rateLimitMap.entries()) {
    if (now > info.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}
