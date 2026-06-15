/**
 * Transak on-ramp tests — webhook signature verification + widget URL.
 *
 * The webhook is the security boundary (a forged body must not settle an
 * invoice), so we test it thoroughly with real HS256-signed payloads.
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/transak.test.ts'
 */

import { expect } from "chai";
import crypto from "crypto";
import {
    buildTransakUrl,
    verifyTransakWebhook,
    isOrderCompleted,
} from "../lib/transak";

const SECRET = "transak_test_secret_abc123";

/** Sign a payload as an HS256 JWT the way Transak delivers webhooks. */
function signJwt(payload: object, secret: string): string {
    const enc = (o: object) =>
        Buffer.from(JSON.stringify(o)).toString("base64url");
    const head = enc({ alg: "HS256", typ: "JWT" });
    const body = enc(payload);
    const sig = crypto
        .createHmac("sha256", secret)
        .update(`${head}.${body}`)
        .digest("base64url");
    return `${head}.${body}.${sig}`;
}

function webhookBody(payload: object, secret: string): string {
    return JSON.stringify({ data: signJwt(payload, secret) });
}

const completedOrder = {
    eventID: "ORDER_COMPLETED",
    webhookData: {
        id: "ord_1",
        status: "COMPLETED",
        partnerOrderId: "tok_invoice_123",
        walletAddress: "MerchantWa11et1111111111111111111111111111",
        cryptoCurrency: "USDC",
        network: "solana",
        cryptoAmount: 4500,
        fiatAmount: 4500,
        transactionHash: "5xtxhashabc",
    },
};

describe("Transak webhook verification", () => {
    it("accepts a correctly signed order", () => {
        const event = verifyTransakWebhook(webhookBody(completedOrder, SECRET), SECRET);
        expect(event).to.not.equal(null);
        expect(event!.webhookData.partnerOrderId).to.equal("tok_invoice_123");
        expect(isOrderCompleted(event!)).to.equal(true);
    });

    it("rejects a payload signed with the wrong secret", () => {
        const forged = webhookBody(completedOrder, "attacker_secret");
        expect(verifyTransakWebhook(forged, SECRET)).to.equal(null);
    });

    it("rejects a tampered payload (valid header, swapped body)", () => {
        const token = signJwt(completedOrder, SECRET);
        const [h, , s] = token.split(".");
        const evilBody = Buffer.from(
            JSON.stringify({ ...completedOrder, webhookData: { ...completedOrder.webhookData, cryptoAmount: 999999 } }),
        ).toString("base64url");
        const tampered = JSON.stringify({ data: `${h}.${evilBody}.${s}` });
        expect(verifyTransakWebhook(tampered, SECRET)).to.equal(null);
    });

    it("rejects when no secret is configured", () => {
        expect(verifyTransakWebhook(webhookBody(completedOrder, SECRET), "")).to.equal(
            null,
        );
    });

    it("treats non-completed statuses as not completed", () => {
        const processing = {
            eventID: "ORDER_PROCESSING",
            webhookData: { ...completedOrder.webhookData, status: "PROCESSING" },
        };
        const event = verifyTransakWebhook(webhookBody(processing, SECRET), SECRET);
        expect(event).to.not.equal(null);
        expect(isOrderCompleted(event!)).to.equal(false);
    });
});

describe("Transak widget URL", () => {
    afterEach(() => {
        delete process.env.NEXT_PUBLIC_TRANSAK_API_KEY;
        delete process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT;
    });

    it("returns null when no API key is configured", () => {
        const url = buildTransakUrl({
            walletAddress: "W",
            fiatAmount: 100,
            partnerOrderId: "tok",
            redirectURL: "https://offbankpay.com/invoice/tok",
        });
        expect(url).to.equal(null);
    });

    it("builds a USDC/Solana buy URL pointed at the merchant wallet", () => {
        process.env.NEXT_PUBLIC_TRANSAK_API_KEY = "pk_test";
        process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT = "PRODUCTION";
        const url = buildTransakUrl({
            walletAddress: "MerchantWallet",
            fiatAmount: 4500,
            partnerOrderId: "tok_abc",
            redirectURL: "https://offbankpay.com/invoice/tok_abc",
        })!;
        expect(url).to.contain("https://global.transak.com/?");
        expect(url).to.contain("cryptoCurrencyCode=USDC");
        expect(url).to.contain("network=solana");
        expect(url).to.contain("walletAddress=MerchantWallet");
        expect(url).to.contain("fiatAmount=4500");
        expect(url).to.contain("partnerOrderId=tok_abc");
    });
});
