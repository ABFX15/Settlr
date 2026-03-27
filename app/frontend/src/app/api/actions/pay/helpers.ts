/**
 * Shared helpers for Solana Actions endpoints.
 *
 * Solana Actions spec requires specific CORS headers on every response
 * (GET, POST, OPTIONS) so that Blinks-compatible clients (Phantom,
 * Backpack, Dialect, Twitter unfurls) can render the action cards.
 */

import { NextResponse } from "next/server";

const ACTIONS_CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers":
        "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain-Ids",
    "Content-Type": "application/json",
};

/** Wrap a JSON payload in a NextResponse with the required Actions headers. */
export function actionsResponse(body: unknown, status = 200): NextResponse {
    return NextResponse.json(body, {
        status,
        headers: ACTIONS_CORS_HEADERS,
    });
}

/** OPTIONS preflight handler — required by the Actions spec. */
export function actionsOptions(): NextResponse {
    return new NextResponse(null, {
        status: 204,
        headers: ACTIONS_CORS_HEADERS,
    });
}
