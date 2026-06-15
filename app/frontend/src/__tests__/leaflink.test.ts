/**
 * LeafLink settle-back tests
 *
 * Exercises syncPaymentToLeafLink end-to-end against a local stand-in for the
 * LeafLink REST API (LEAFLINK_API_BASE override). Uses the in-memory sync /
 * config stores (no Supabase required).
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/leaflink.test.ts'
 */

import { expect } from "chai";
import http from "http";

/** A tiny fake LeafLink API that records the requests it receives. */
function createFakeLeafLink(opts?: { failPatch?: boolean }): Promise<{
    baseUrl: string;
    requests: Array<{ method: string; path: string; body: string }>;
    close: () => Promise<void>;
}> {
    return new Promise((resolve) => {
        const requests: Array<{ method: string; path: string; body: string }> = [];
        const server = http.createServer((req, res) => {
            let body = "";
            req.on("data", (c) => (body += c));
            req.on("end", () => {
                requests.push({
                    method: req.method || "",
                    path: req.url || "",
                    body,
                });
                const isPatch = req.method === "PATCH";
                if (isPatch && opts?.failPatch) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "boom" }));
                    return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ id: 1, ok: true }));
            });
        });
        server.listen(0, () => {
            const addr = server.address();
            const port = typeof addr === "object" && addr ? addr.port : 0;
            resolve({
                baseUrl: `http://127.0.0.1:${port}`,
                requests,
                close: () =>
                    new Promise((r) => server.close(() => r())),
            });
        });
    });
}

const uid = () => `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

describe("LeafLink settle-back", () => {
    let fake: Awaited<ReturnType<typeof createFakeLeafLink>>;

    // Imported lazily after LEAFLINK_API_BASE is set so the client picks it up.
    let createSync: typeof import("../lib/leaflink/db").createSync;
    let upsertConfig: typeof import("../lib/leaflink/db").upsertConfig;
    let getSyncByInvoiceId: typeof import("../lib/leaflink/db").getSyncByInvoiceId;
    let syncPaymentToLeafLink: typeof import("../lib/leaflink/sync").syncPaymentToLeafLink;

    before(async () => {
        const db = await import("../lib/leaflink/db");
        const sync = await import("../lib/leaflink/sync");
        createSync = db.createSync;
        upsertConfig = db.upsertConfig;
        getSyncByInvoiceId = db.getSyncByInvoiceId;
        syncPaymentToLeafLink = sync.syncPaymentToLeafLink;
    });

    beforeEach(async () => {
        fake = await createFakeLeafLink();
        process.env.LEAFLINK_API_BASE = fake.baseUrl;
    });

    afterEach(async () => {
        await fake.close();
        delete process.env.LEAFLINK_API_BASE;
    });

    async function seed(merchantId: string, invoiceId: string, orderId = 555) {
        await upsertConfig({
            merchant_id: merchantId,
            leaflink_api_key: "ll_test_key",
            leaflink_company_id: 42,
            auto_create_invoice: true,
            auto_send_link: true,
            metrc_sync: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        return createSync({
            merchant_id: merchantId,
            leaflink_order_id: orderId,
            leaflink_order_number: "PO-1001",
            seller_email: "seller@disp.co",
            buyer_email: "buyer@disp.co",
            buyer_company: "Buyer Co",
            amount: 4500,
            settlr_invoice_id: invoiceId,
            settlr_payment_link: "https://offbankpay.com/invoice/tok",
            status: "link_sent",
            metadata: { source: "leaflink" },
        });
    }

    it("returns matched=false for an invoice with no LeafLink sync", async () => {
        const res = await syncPaymentToLeafLink({
            invoiceId: "inv_does_not_exist",
            txSignature: "sig123",
        });
        expect(res.matched).to.equal(false);
        expect(res.synced).to.equal(false);
    });

    it("pushes payment proof to LeafLink and marks the sync synced", async () => {
        const merchantId = uid();
        const invoiceId = `inv_${Date.now()}`;
        const sync = await seed(merchantId, invoiceId);

        const res = await syncPaymentToLeafLink({
            invoiceId,
            txSignature: "txABC",
            amount: 4500,
            paidAt: new Date().toISOString(),
        });

        expect(res.matched).to.equal(true);
        expect(res.synced).to.equal(true);
        expect(res.orderNumber).to.equal("PO-1001");

        // The order was PATCHed with external_id and a note was POSTed.
        const methods = fake.requests.map((r) => `${r.method} ${r.path}`);
        expect(methods.some((m) => m.startsWith("PATCH /orders-received/555/"))).to.equal(true);
        expect(methods.some((m) => m.includes("/notes/"))).to.equal(true);

        const updated = await getSyncByInvoiceId(invoiceId);
        expect(updated?.status).to.equal("synced");
        expect(updated?.tx_signature).to.equal("txABC");
        expect(sync.id).to.be.a("string");
    });

    it("keeps the sync 'paid' with an error when the LeafLink API fails", async () => {
        await fake.close();
        fake = await createFakeLeafLink({ failPatch: true });
        process.env.LEAFLINK_API_BASE = fake.baseUrl;

        const merchantId = uid();
        const invoiceId = `inv_${Date.now()}_f`;
        await seed(merchantId, invoiceId);

        const res = await syncPaymentToLeafLink({ invoiceId, txSignature: "txFAIL" });

        expect(res.matched).to.equal(true);
        expect(res.synced).to.equal(false);
        expect(res.error).to.be.a("string");

        const updated = await getSyncByInvoiceId(invoiceId);
        expect(updated?.status).to.equal("paid");
        expect(updated?.tx_signature).to.equal("txFAIL");
        expect(updated?.error).to.be.a("string");
    });

    it("is idempotent — a second call on a synced order is a no-op", async () => {
        const merchantId = uid();
        const invoiceId = `inv_${Date.now()}_idem`;
        await seed(merchantId, invoiceId);

        await syncPaymentToLeafLink({ invoiceId, txSignature: "txONE" });
        const firstCount = fake.requests.length;

        const res = await syncPaymentToLeafLink({ invoiceId, txSignature: "txTWO" });
        expect(res.synced).to.equal(true);
        expect(res.reason).to.equal("already_synced");
        // No further LeafLink calls were made.
        expect(fake.requests.length).to.equal(firstCount);
    });
});
