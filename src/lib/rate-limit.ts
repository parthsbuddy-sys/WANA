import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
    tokens: number;
    lastRefill: number;
}

// In-memory store for rate limits
const ipStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipStore.entries()) {
        if (now - record.lastRefill > 300000) {
            ipStore.delete(key);
        }
    }
}, 300000);

export interface RateLimitOptions {
    limit?: number;          // Maximum requests allowed in the window (default 60)
    windowMs?: number;       // Window size in milliseconds (default 60,000ms = 1 min)
    identifier?: string;     // Custom identifier (e.g. userId or apiKey)
}

/**
 * Token-bucket sliding window rate limiter
 */
export function checkRateLimit(
    identifier: string,
    options: RateLimitOptions = {}
): {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
} {
    const limit = options.limit || 60;
    const windowMs = options.windowMs || 60000;
    const now = Date.now();

    const record = ipStore.get(identifier);

    if (!record) {
        ipStore.set(identifier, {
            tokens: limit - 1,
            lastRefill: now
        });
        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset: Math.ceil((now + windowMs) / 1000)
        };
    }

    // Calculate token refill based on elapsed time
    const elapsed = now - record.lastRefill;
    if (elapsed >= windowMs) {
        record.tokens = limit - 1;
        record.lastRefill = now;
        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset: Math.ceil((now + windowMs) / 1000)
        };
    }

    if (record.tokens > 0) {
        record.tokens -= 1;
        return {
            success: true,
            limit,
            remaining: record.tokens,
            reset: Math.ceil((record.lastRefill + windowMs) / 1000)
        };
    }

    // Rate limit exceeded
    const resetSeconds = Math.ceil((record.lastRefill + windowMs - now) / 1000);
    return {
        success: false,
        limit,
        remaining: 0,
        reset: Math.ceil((record.lastRefill + windowMs) / 1000)
    };
}

/**
 * Helper to extract client IP from Next.js request
 */
export function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return realIp.trim();
    }
    return "127.0.0.1";
}

/**
 * Middleware rate limiter helper
 */
export function enforceRateLimit(
    request: NextRequest,
    options: RateLimitOptions = {}
): NextResponse | null {
    const ip = options.identifier || getClientIp(request);
    const key = `${request.nextUrl.pathname}:${ip}`;
    const result = checkRateLimit(key, options);

    if (!result.success) {
        const retryAfter = Math.max(1, result.reset - Math.ceil(Date.now() / 1000));
        return NextResponse.json(
            {
                status: false,
                message: "Too many requests. Rate limit exceeded.",
                error: "Rate limit exceeded"
            },
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": result.limit.toString(),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": result.reset.toString(),
                    "Retry-After": retryAfter.toString()
                }
            }
        );
    }

    return null;
}
