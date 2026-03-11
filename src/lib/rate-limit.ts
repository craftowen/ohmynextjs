import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(options: { limit?: number; windowMs?: number } = {}) {
  const { limit = 10, windowMs = 60_000 } = options;

  return function check(identifier: string): { success: boolean; remaining: number } {
    const now = Date.now();
    const entry = store.get(identifier);

    if (!entry || now > entry.resetAt) {
      store.set(identifier, { count: 1, resetAt: now + windowMs });
      return { success: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
      return { success: false, remaining: 0 };
    }

    entry.count++;
    return { success: true, remaining: limit - entry.count };
  };
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
    { status: 429, headers: { 'Retry-After': '60' } },
  );
}
