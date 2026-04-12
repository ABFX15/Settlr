import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter using Upstash Redis.
 * Falls back to a no-op when UPSTASH_REDIS_REST_URL is not configured
 * (so development works without Redis).
 */

let ratelimit: Ratelimit | null = null;

if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
) {
    ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(30, "60 s"), // 30 requests per 60 seconds
        analytics: true,
        prefix: "settlr",
    });
}

/**
 * Check rate limit for a given identifier (IP, wallet, API key, etc.).
 * Returns null if allowed, or a 429 NextResponse if rate-limited.
 */
export async function checkRateLimit(
    identifier: string,
): Promise<NextResponse | null> {
    if (!ratelimit) return null; // No Redis configured — allow all (dev mode)

    const { success, limit, remaining, reset } =
        await ratelimit.limit(identifier);

    if (!success) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": String(limit),
                    "X-RateLimit-Remaining": String(remaining),
                    "X-RateLimit-Reset": String(reset),
                },
            },
        );
    }

    return null;
}

/**
 * Extract IP address from request headers (works on Vercel and local dev).
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    const real = request.headers.get("x-real-ip");
    if (real) return real;
    return "127.0.0.1";
}
