/**
 * OpenGravity V3 — Rate Limiting Middleware
 * Uses @upstash/ratelimit + @upstash/redis
 *
 * Strategy: Sliding window per IP
 *   - /api/predict  → 5 requests / 60s  (heavy: Tavily + LLM + Monte Carlo)
 *   - /api/predict/status → 120 requests / 60s  (polling endpoint)
 *   - /api/chat → 30 requests / 60s
 *   - /api/tts → 10 requests / 60s
 *   - /api/research → 3 requests / 60s
 *
 * Install deps:
 *   npm install @upstash/ratelimit @upstash/redis
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// ─── Redis singleton (reuses connection across warm lambda invocations) ────────
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Limiters ─────────────────────────────────────────────────────────────────

/** Heavy endpoint: POST /api/predict — triggers full pipeline */
export const predictLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "og:rl:predict",
});

/** Polling endpoint: GET /api/predict/status — called every 3-15s */
export const statusLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "60 s"),
  analytics: true,
  prefix: "og:rl:status",
});

/** Public chat endpoint — protects provider spend and streaming capacity. */
export const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: true,
  prefix: "og:rl:chat",
});

/** Speech synthesis endpoint — caps external TTS requests. */
export const ttsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "og:rl:tts",
});

/** Deep research endpoint — limits high-cost parallel searches. */
export const researchLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "60 s"),
  analytics: true,
  prefix: "og:rl:research",
});

// ─── IP extraction (works behind Vercel's edge proxy) ─────────────────────────
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  );
}

// ─── Reusable guard ──────────────────────────────────────────────────────────

/**
 * Call at the top of any route handler.
 * Returns a 429 NextResponse if rate limited, null if allowed.
 *
 * Usage:
 *   const limited = await checkRateLimit(req, predictLimiter);
 *   if (limited) return limited;
 */
export async function checkRateLimit(
  req: NextRequest,
  limiter: Ratelimit
): Promise<NextResponse | null> {
  const ip = getClientIP(req);
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null; // allowed
}
