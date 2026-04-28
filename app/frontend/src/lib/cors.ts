/**
 * CORS allowlist helpers.
 *
 * SDK redirect/checkout endpoints need cross-origin access from arbitrary
 * merchant sites. We default to the configured app URL and any explicit
 * allowlist in `ALLOWED_CORS_ORIGINS` (comma-separated). Wildcard `*` is
 * NEVER returned for endpoints that touch authenticated state — those
 * routes should pass `requireOrigin: true`.
 */

const ALLOWED_ORIGINS: readonly string[] = (() => {
    const fromEnv = process.env.ALLOWED_CORS_ORIGINS || "";
    const explicit = fromEnv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const app = process.env.NEXT_PUBLIC_APP_URL?.trim();
    const set = new Set<string>(explicit);
    if (app) set.add(app);
    return Array.from(set);
})();

export interface CorsOptions {
    /**
     * If true, requests from non-allowlisted origins receive no CORS
     * headers (the browser will block them). If false (SDK-style), we
     * echo the origin back so any merchant site can call us — but the
     * route must remain unauthenticated and idempotent.
     */
    requireOrigin?: boolean;
    methods?: string;
    headers?: string;
}

export function corsHeadersFor(
    request: Request,
    opts: CorsOptions = {},
): Record<string, string> {
    const origin = request.headers.get("origin") || "";
    const methods = opts.methods || "GET, POST, OPTIONS";
    const headers = opts.headers || "Content-Type, Authorization";

    const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

    if (opts.requireOrigin && !isAllowed) {
        // Don't expose CORS to unknown origins for sensitive routes.
        return {};
    }

    const allowOrigin = isAllowed
        ? origin
        : opts.requireOrigin
            ? ""
            : (origin || "*");

    if (!allowOrigin) return {};

    return {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": methods,
        "Access-Control-Allow-Headers": headers,
        "Vary": "Origin",
    };
}
