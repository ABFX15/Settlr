/**
 * Wallet Sign-In Auth Smoke Test
 *
 * Exercises the nonce → sign → verify flow end-to-end against the actual
 * Next.js route handlers, using an Ed25519 keypair as the "wallet". Catches
 * the exact class of regression that just shipped — a hardcoded cookie name
 * inside `verify/route.ts` that broke sign-in after the cookie rename.
 *
 * Bypasses Next's HTTP server entirely; calls the route handlers directly
 * with NextRequest objects and inspects NextResponse cookies.
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/auth-wallet.test.ts'
 */

import { expect } from "chai";
import { NextRequest } from "next/server";
import nacl from "tweetnacl";
import bs58 from "bs58";

import { GET as nonceGET } from "../app/api/auth/wallet/nonce/route";
import { POST as verifyPOST } from "../app/api/auth/wallet/verify/route";

// Stable session secret so HMAC verification works across calls.
process.env.SESSION_SECRET =
    "test-only-session-secret-must-be-at-least-32-chars-long";

// Disable upstash rate-limiter so smoke tests don't hit the network.
process.env.UPSTASH_REDIS_REST_URL = "";
process.env.UPSTASH_REDIS_REST_TOKEN = "";

function makeKeypair(): { publicKey: string; sign: (msg: string) => string } {
    const kp = nacl.sign.keyPair();
    return {
        publicKey: bs58.encode(kp.publicKey),
        sign: (msg: string) => {
            const sig = nacl.sign.detached(
                new TextEncoder().encode(msg),
                kp.secretKey,
            );
            return bs58.encode(sig);
        },
    };
}

/** Parse Set-Cookie headers into a name → value map. */
function parseCookies(res: Response): Map<string, string> {
    const out = new Map<string, string>();
    // NextResponse exposes cookies via `headers.getSetCookie()` in Node 18+.
    const setCookies =
        typeof (res.headers as any).getSetCookie === "function"
            ? (res.headers as any).getSetCookie()
            : res.headers.get("set-cookie")?.split(/,(?=[^ ])/) ?? [];
    for (const raw of setCookies as string[]) {
        const [pair] = raw.split(";");
        const eq = pair.indexOf("=");
        if (eq < 0) continue;
        out.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
    return out;
}

describe("auth: wallet sign-in flow", () => {
    it("issues a nonce, accepts a valid signature, and sets the session cookie", async () => {
        const wallet = makeKeypair();

        // ── 1. GET nonce ───────────────────────────────────────
        const nonceReq = new NextRequest(
            `http://localhost/api/auth/wallet/nonce?wallet=${encodeURIComponent(wallet.publicKey)}`,
        );
        const nonceRes = await nonceGET(nonceReq);
        expect(nonceRes.status, "nonce route should 200").to.equal(200);

        const { message } = (await nonceRes.json()) as { message: string };
        expect(message).to.include(wallet.publicKey);

        const nonceCookies = parseCookies(nonceRes);
        // Production cookie name lives at `offbank_nonce`; legacy compat
        // accepts `settlr_nonce` too. The route MUST set the new one.
        const nonceCookieValue = nonceCookies.get("offbank_nonce");
        expect(nonceCookieValue, "offbank_nonce cookie should be set").to.be.a("string");

        // ── 2. Sign and POST verify ────────────────────────────
        const signature = wallet.sign(message);
        const verifyReq = new NextRequest(
            "http://localhost/api/auth/wallet/verify",
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    cookie: `offbank_nonce=${nonceCookieValue}`,
                },
                body: JSON.stringify({ wallet: wallet.publicKey, signature }),
            },
        );
        const verifyRes = await verifyPOST(verifyReq);

        if (verifyRes.status !== 200) {
            const body = await verifyRes.json().catch(() => ({}));
            throw new Error(
                `verify failed (${verifyRes.status}): ${JSON.stringify(body)}`,
            );
        }

        // ── 3. Session cookie must be set ──────────────────────
        const verifyCookies = parseCookies(verifyRes);
        const session = verifyCookies.get("offbank_session");
        expect(session, "offbank_session cookie should be set").to.be.a("string");
        expect(session!.length, "session cookie should not be empty").to.be.greaterThan(0);

        // Nonce should be cleared (single-use).
        const clearedNonce = verifyCookies.get("offbank_nonce");
        expect(clearedNonce ?? "", "offbank_nonce should be cleared").to.equal("");
    });

    it("rejects a signature from a different keypair", async () => {
        const real = makeKeypair();
        const attacker = makeKeypair();

        const nonceReq = new NextRequest(
            `http://localhost/api/auth/wallet/nonce?wallet=${encodeURIComponent(real.publicKey)}`,
        );
        const nonceRes = await nonceGET(nonceReq);
        const { message } = (await nonceRes.json()) as { message: string };
        const nonceCookieValue = parseCookies(nonceRes).get("offbank_nonce");

        const badSignature = attacker.sign(message);
        const verifyReq = new NextRequest(
            "http://localhost/api/auth/wallet/verify",
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    cookie: `offbank_nonce=${nonceCookieValue}`,
                },
                body: JSON.stringify({ wallet: real.publicKey, signature: badSignature }),
            },
        );
        const verifyRes = await verifyPOST(verifyReq);
        expect(verifyRes.status, "wrong-key signature must be rejected").to.equal(401);
    });

    it("accepts the legacy settlr_nonce cookie name (back-compat)", async () => {
        // Simulates a user mid-flow during the rename: their nonce was
        // issued under the old name. Verify must still work.
        const wallet = makeKeypair();
        const nonceReq = new NextRequest(
            `http://localhost/api/auth/wallet/nonce?wallet=${encodeURIComponent(wallet.publicKey)}`,
        );
        const nonceRes = await nonceGET(nonceReq);
        const { message } = (await nonceRes.json()) as { message: string };
        const nonceCookieValue = parseCookies(nonceRes).get("offbank_nonce")!;

        const signature = wallet.sign(message);
        const verifyReq = new NextRequest(
            "http://localhost/api/auth/wallet/verify",
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    cookie: `settlr_nonce=${nonceCookieValue}`, // legacy name
                },
                body: JSON.stringify({ wallet: wallet.publicKey, signature }),
            },
        );
        const verifyRes = await verifyPOST(verifyReq);
        expect(verifyRes.status, "legacy nonce cookie must still verify").to.equal(200);
    });
});
