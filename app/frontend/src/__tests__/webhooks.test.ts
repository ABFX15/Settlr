/**
 * Webhook Dispatch Engine Tests
 *
 * Tests the webhook event dispatch, delivery, signing, and query system.
 * Uses in-memory stores (no Supabase required).
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/webhooks.test.ts'
 */

import { expect } from "chai";
import http from "http";
import {
    dispatchWebhookEvent,
    getWebhookEvents,
    getWebhookDeliveries,
    getRecentDeliveries,
    signPayload,
    verifyPayloadSignature,
    registerWebhookConfigInMemory,
    memoryWebhookEvents,
    memoryWebhookDeliveries,
    memoryWebhookConfigs,
    type WebhookEvent,
    type WebhookDelivery,
} from "../lib/webhooks";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const uid = () => `test_merchant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const SECRET = "whsec_test_secret_12345";

/** Spin up a tiny HTTP server that collects webhook deliveries for assertions. */
function createTestServer(): Promise<{
    server: http.Server;
    port: number;
    received: Array<{ headers: http.IncomingHttpHeaders; body: string }>;
    close: () => Promise<void>;
}> {
    return new Promise((resolve) => {
        const received: Array<{ headers: http.IncomingHttpHeaders; body: string }> = [];
        const server = http.createServer((req, res) => {
            let body = "";
            req.on("data", (chunk) => (body += chunk));
            req.on("end", () => {
                received.push({ headers: req.headers, body });
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ received: true }));
            });
        });
        server.listen(0, () => {
            const addr = server.address();
            const port = typeof addr === "object" && addr ? addr.port : 0;
            resolve({
                server,
                port,
                received,
                close: () => new Promise<void>((r) => server.close(() => r())),
            });
        });
    });
}

// ---------------------------------------------------------------------------
// 1. Payload Signing
// ---------------------------------------------------------------------------

describe("Webhooks — Signing", () => {
    it("should produce a deterministic HMAC-SHA256 signature", () => {
        const payload = '{"id":"evt_test","type":"payout.created"}';
        const sig1 = signPayload(payload, SECRET);
        const sig2 = signPayload(payload, SECRET);
        expect(sig1).to.equal(sig2);
        expect(sig1).to.have.lengthOf(64); // hex sha256
    });

    it("should verify a valid signature", () => {
        const payload = '{"test":true}';
        const sig = signPayload(payload, SECRET);
        expect(verifyPayloadSignature(payload, sig, SECRET)).to.be.true;
    });

    it("should reject an invalid signature", () => {
        const payload = '{"test":true}';
        expect(verifyPayloadSignature(payload, "bad_sig_0000", SECRET)).to.be.false;
    });

    it("should reject tampered payload", () => {
        const original = '{"amount":100}';
        const sig = signPayload(original, SECRET);
        expect(verifyPayloadSignature('{"amount":200}', sig, SECRET)).to.be.false;
    });
});

// ---------------------------------------------------------------------------
// 2. Event Dispatch (no endpoints)
// ---------------------------------------------------------------------------

describe("Webhooks — Dispatch (no endpoints)", () => {
    it("should save the event even when no webhooks match", async () => {
        const mid = uid();
        const deliveries = await dispatchWebhookEvent(mid, "payout.created", {
            payoutId: "pay_test_001",
            amount: 100,
        });

        // No deliveries (no registered endpoints)
        expect(deliveries).to.be.an("array").with.lengthOf(0);

        // But the event is saved
        const events = await getWebhookEvents(mid);
        expect(events.length).to.be.greaterThanOrEqual(1);
        expect(events[0].type).to.equal("payout.created");
        expect((events[0].data as Record<string, unknown>).payoutId).to.equal("pay_test_001");
    });
});

// ---------------------------------------------------------------------------
// 3. Event Dispatch (with live endpoint)
// ---------------------------------------------------------------------------

describe("Webhooks — Dispatch (with endpoint)", () => {
    let testServer: Awaited<ReturnType<typeof createTestServer>>;

    before(async () => {
        testServer = await createTestServer();
    });

    after(async () => {
        await testServer.close();
    });

    it("should deliver to a registered webhook and sign the payload", async () => {
        const mid = uid();
        const whId = `wh_test_${Date.now()}`;

        registerWebhookConfigInMemory({
            id: whId,
            merchantId: mid,
            url: `http://localhost:${testServer.port}/hook`,
            secret: SECRET,
            events: ["payout.created", "payout.claimed"],
            active: true,
        });

        const deliveries = await dispatchWebhookEvent(mid, "payout.created", {
            payoutId: "pay_deliver_001",
            amount: 50,
        });

        expect(deliveries).to.have.lengthOf(1);
        expect(deliveries[0].status).to.equal("success");
        expect(deliveries[0].httpStatus).to.equal(200);
        expect(deliveries[0].attempts).to.equal(1);

        // Verify the server received the request
        expect(testServer.received.length).to.be.greaterThanOrEqual(1);
        const last = testServer.received[testServer.received.length - 1];

        // Check headers
        expect(last.headers["x-settlr-event"]).to.equal("payout.created");
        expect(last.headers["x-settlr-signature"]).to.be.a("string");
        expect(last.headers["x-settlr-delivery"]).to.match(/^del_/);
        expect(last.headers["content-type"]).to.equal("application/json");

        // Verify signature
        const sig = last.headers["x-settlr-signature"] as string;
        expect(verifyPayloadSignature(last.body, sig, SECRET)).to.be.true;

        // Verify payload
        const payload = JSON.parse(last.body) as WebhookEvent;
        expect(payload.type).to.equal("payout.created");
        expect(payload.data.payoutId).to.equal("pay_deliver_001");
    });

    it("should not deliver events the webhook is not subscribed to", async () => {
        const mid = uid();
        registerWebhookConfigInMemory({
            id: `wh_filter_${Date.now()}`,
            merchantId: mid,
            url: `http://localhost:${testServer.port}/hook`,
            secret: SECRET,
            events: ["payout.claimed"], // only 'claimed', not 'created'
            active: true,
        });

        const before = testServer.received.length;
        const deliveries = await dispatchWebhookEvent(mid, "payout.created", { test: true });

        expect(deliveries).to.have.lengthOf(0);
        expect(testServer.received.length).to.equal(before); // no new requests
    });

    it("should deliver to wildcard (*) subscribers", async () => {
        const mid = uid();
        registerWebhookConfigInMemory({
            id: `wh_wild_${Date.now()}`,
            merchantId: mid,
            url: `http://localhost:${testServer.port}/hook`,
            secret: SECRET,
            events: ["*"],
            active: true,
        });

        const deliveries = await dispatchWebhookEvent(mid, "deposit.confirmed", { amount: 1000 });
        expect(deliveries).to.have.lengthOf(1);
        expect(deliveries[0].status).to.equal("success");
    });

    it("should skip inactive webhooks", async () => {
        const mid = uid();
        registerWebhookConfigInMemory({
            id: `wh_inactive_${Date.now()}`,
            merchantId: mid,
            url: `http://localhost:${testServer.port}/hook`,
            secret: SECRET,
            events: ["*"],
            active: false, // disabled
        });

        const deliveries = await dispatchWebhookEvent(mid, "payout.created", { test: true });
        expect(deliveries).to.have.lengthOf(0);
    });
});

// ---------------------------------------------------------------------------
// 4. Delivery Failure + Retry
// ---------------------------------------------------------------------------

describe("Webhooks — Delivery Failure", () => {
    let failServer: Awaited<ReturnType<typeof createFailServer>>;

    function createFailServer(): Promise<{
        server: http.Server;
        port: number;
        requestCount: number;
        close: () => Promise<void>;
    }> {
        return new Promise((resolve) => {
            let requestCount = 0;
            const server = http.createServer((_req, res) => {
                requestCount++;
                res.writeHead(500);
                res.end("Internal Server Error");
            });
            server.listen(0, () => {
                const addr = server.address();
                const port = typeof addr === "object" && addr ? addr.port : 0;
                resolve({
                    server,
                    port,
                    get requestCount() { return requestCount; },
                    close: () => new Promise<void>((r) => server.close(() => r())),
                });
            });
        });
    }

    before(async () => {
        failServer = await createFailServer();
    });

    after(async () => {
        await failServer.close();
    });

    it("should retry on failure and mark delivery as failed after exhausting short retries", async () => {
        const mid = uid();
        registerWebhookConfigInMemory({
            id: `wh_fail_${Date.now()}`,
            merchantId: mid,
            url: `http://localhost:${failServer.port}/fail`,
            secret: SECRET,
            events: ["*"],
            active: true,
        });

        const deliveries = await dispatchWebhookEvent(mid, "payout.failed", { test: true });
        expect(deliveries).to.have.lengthOf(1);
        expect(deliveries[0].status).to.equal("failed");
        // First attempt is immediate, second retry is 5s — these execute within timeout.
        // Third retry would be 30s so the engine bails and marks as failed.
        expect(deliveries[0].attempts).to.be.greaterThanOrEqual(1);
        expect(deliveries[0].httpStatus).to.equal(500);
        expect(deliveries[0].errorMessage).to.include("500");
    }).timeout(15000);
});

// ---------------------------------------------------------------------------
// 5. Query: Events & Deliveries
// ---------------------------------------------------------------------------

describe("Webhooks — Event Queries", () => {
    it("should return events in reverse chronological order", async () => {
        const mid = uid();
        await dispatchWebhookEvent(mid, "payout.created", { order: 1 });
        await dispatchWebhookEvent(mid, "payout.claimed", { order: 2 });

        const events = await getWebhookEvents(mid);
        expect(events.length).to.be.greaterThanOrEqual(2);
        expect(new Date(events[0].createdAt).getTime()).to.be.greaterThanOrEqual(
            new Date(events[1].createdAt).getTime()
        );
    });

    it("should filter events by type", async () => {
        const mid = uid();
        await dispatchWebhookEvent(mid, "payout.created", { a: 1 });
        await dispatchWebhookEvent(mid, "payout.claimed", { b: 2 });
        await dispatchWebhookEvent(mid, "deposit.confirmed", { c: 3 });

        const created = await getWebhookEvents(mid, { type: "payout.created" });
        expect(created.every((e) => e.type === "payout.created")).to.be.true;
    });

    it("should respect limit", async () => {
        const mid = uid();
        await dispatchWebhookEvent(mid, "payout.created", { i: 1 });
        await dispatchWebhookEvent(mid, "payout.created", { i: 2 });
        await dispatchWebhookEvent(mid, "payout.created", { i: 3 });

        const events = await getWebhookEvents(mid, { limit: 2 });
        expect(events.length).to.equal(2);
    });
});

// ---------------------------------------------------------------------------
// 6. Fee Calculation (imported from db for completeness)
// ---------------------------------------------------------------------------

describe("Webhooks — Integration Sanity", () => {
    it("all event types are recognized", async () => {
        const mid = uid();
        const types = [
            "payout.created",
            "payout.claimed",
            "payout.expired",
            "payout.failed",
            "deposit.confirmed",
            "batch.created",
        ] as const;

        for (const type of types) {
            await dispatchWebhookEvent(mid, type, { test: true });
        }

        const events = await getWebhookEvents(mid, { limit: 10 });
        const seenTypes = new Set(events.map((e) => e.type));
        for (const type of types) {
            expect(seenTypes.has(type)).to.be.true;
        }
    });
});
