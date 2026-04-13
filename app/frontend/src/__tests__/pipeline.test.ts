/**
 * Data Pipeline Tests
 *
 * End-to-end tests for event emission, batch processing,
 * stats aggregation, and CSV/JSON export.
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/pipeline.test.ts'
 */

import { expect } from "chai";
import {
    emitEvent,
    getEventCount,
    getRecentEvents,
    getEventsByMerchant,
    getOldestPendingEvent,
} from "../lib/pipeline/events";
import {
    processEvents,
    getMerchantStats,
    getPlatformStats,
} from "../lib/pipeline/processor";
import { generateExport } from "../lib/pipeline/exporter";
import type { PipelineEvent, MerchantDailyStats } from "../lib/pipeline/types";

const TEST_MERCHANT = "test-merchant-001";
const TODAY = new Date().toISOString().substring(0, 10);

describe("Data Pipeline", () => {
    // -----------------------------------------------------------------------
    // 1. Event Emission
    // -----------------------------------------------------------------------
    describe("Event Emission", () => {
        it("should emit a payment.completed event", async () => {
            const event = await emitEvent(
                "payment.completed",
                "payment",
                "pay_test_001",
                TEST_MERCHANT,
                { amount: 100, currency: "USDC", customerWallet: "wallet123" },
            );

            expect(event).to.have.property("id").that.is.a("string");
            expect(event.id).to.match(/^pe_/);
            expect(event.eventType).to.equal("payment.completed");
            expect(event.entityType).to.equal("payment");
            expect(event.entityId).to.equal("pay_test_001");
            expect(event.merchantId).to.equal(TEST_MERCHANT);
            expect(event.processed).to.equal(false);
            expect(event.data).to.deep.include({ amount: 100, currency: "USDC" });
        });

        it("should emit an invoice.created event", async () => {
            const event = await emitEvent(
                "invoice.created",
                "invoice",
                "inv_test_001",
                TEST_MERCHANT,
                { amount: 500, invoiceNumber: "INV-2026-001", buyerEmail: "buyer@example.com" },
            );

            expect(event.eventType).to.equal("invoice.created");
            expect(event.entityType).to.equal("invoice");
            expect(event.data.amount).to.equal(500);
        });

        it("should emit an invoice.paid event", async () => {
            const event = await emitEvent(
                "invoice.paid",
                "invoice",
                "inv_test_001",
                TEST_MERCHANT,
                { amount: 500, invoiceNumber: "INV-2026-001" },
            );

            expect(event.eventType).to.equal("invoice.paid");
        });

        it("should emit payout events", async () => {
            const batch = await emitEvent(
                "batch.created",
                "batch",
                "batch_test_001",
                TEST_MERCHANT,
                { amount: 300, count: 2 },
            );
            expect(batch.eventType).to.equal("batch.created");

            const payout1 = await emitEvent(
                "payout.created",
                "payout",
                "po_test_001",
                TEST_MERCHANT,
                { amount: 150, email: "recipient1@example.com" },
            );
            expect(payout1.eventType).to.equal("payout.created");

            const payout2 = await emitEvent(
                "payout.created",
                "payout",
                "po_test_002",
                TEST_MERCHANT,
                { amount: 150, email: "recipient2@example.com" },
            );
            expect(payout2.entityId).to.equal("po_test_002");
        });

        it("should emit order and fee events", async () => {
            await emitEvent("order.created", "order", "ord_test_001", TEST_MERCHANT, {
                amount: 250, orderNumber: "PO-2026-001",
            });
            await emitEvent("fee.collected", "treasury", "fee_test_001", TEST_MERCHANT, {
                amount: 3.5,
            });
            await emitEvent("recipient.registered", "recipient", "rcp_test_001", TEST_MERCHANT, {
                email: "new@example.com",
            });
        });
    });

    // -----------------------------------------------------------------------
    // 2. Event Querying
    // -----------------------------------------------------------------------
    describe("Event Querying", () => {
        it("should count pending events", async () => {
            const count = await getEventCount(false);
            expect(count).to.be.greaterThan(0);
        });

        it("should count all events", async () => {
            const total = await getEventCount();
            expect(total).to.be.greaterThanOrEqual(8); // we emitted 8 above
        });

        it("should return the oldest pending event", async () => {
            const oldest = await getOldestPendingEvent();
            expect(oldest).to.not.be.null;
            expect(oldest!.processed).to.equal(false);
        });

        it("should return recent events for a merchant", async () => {
            const events = await getRecentEvents(TEST_MERCHANT, 50);
            expect(events).to.be.an("array");
            expect(events.length).to.be.greaterThanOrEqual(8);
        });

        it("should filter events by merchant", async () => {
            const events = await getEventsByMerchant(TEST_MERCHANT, { limit: 100 });
            expect(events.every((e: PipelineEvent) => e.merchantId === TEST_MERCHANT)).to.be.true;
        });

        it("should return empty for unknown merchant", async () => {
            const events = await getRecentEvents("nonexistent-merchant", 10);
            expect(events).to.be.an("array").with.length(0);
        });
    });

    // -----------------------------------------------------------------------
    // 3. Batch Processing
    // -----------------------------------------------------------------------
    describe("Batch Processing", () => {
        it("should process pending events and aggregate stats", async () => {
            const result = await processEvents();

            expect(result).to.have.property("eventsProcessed").that.is.greaterThan(0);
            expect(result).to.have.property("merchantStatsUpdated").that.is.greaterThan(0);
            expect(result).to.have.property("platformStatsUpdated").that.is.greaterThan(0);
            expect(result).to.have.property("errors").that.is.an("array");
            expect(result).to.have.property("durationMs").that.is.a("number");

            console.log(`  Processed ${result.eventsProcessed} events in ${result.durationMs}ms`);
            if (result.errors.length > 0) {
                console.log(`  Errors: ${result.errors.join(", ")}`);
            }
        });

        it("should have zero pending events after processing", async () => {
            const pending = await getEventCount(false);
            expect(pending).to.equal(0);
        });

        it("should be idempotent (no-op on second run)", async () => {
            const result = await processEvents();
            expect(result.eventsProcessed).to.equal(0);
        });
    });

    // -----------------------------------------------------------------------
    // 4. Aggregated Stats
    // -----------------------------------------------------------------------
    describe("Aggregated Stats", () => {
        it("should return merchant daily stats", async () => {
            const stats = await getMerchantStats(TEST_MERCHANT, { limit: 7 });

            expect(stats).to.be.an("array").with.length.greaterThan(0);

            const todayStats = stats.find((s: MerchantDailyStats) => s.date === TODAY);
            expect(todayStats).to.exist;
            expect(todayStats!.paymentsCount).to.equal(1);
            expect(todayStats!.paymentsVolume).to.equal(100);
            expect(todayStats!.invoicesCreated).to.equal(1);
            expect(todayStats!.invoicesPaid).to.equal(1);
            expect(todayStats!.invoicesPaidVolume).to.equal(500);
            expect(todayStats!.payoutsCount).to.equal(2);
            expect(todayStats!.payoutsVolume).to.equal(300);
            expect(todayStats!.feesCollected).to.equal(3.5);
            expect(todayStats!.ordersCreated).to.equal(1);
            expect(todayStats!.newRecipients).to.equal(1);

            console.log("  Today's merchant stats:", JSON.stringify(todayStats, null, 2));
        });

        it("should return platform daily stats", async () => {
            const stats = await getPlatformStats({ limit: 7 });

            expect(stats).to.be.an("array").with.length.greaterThan(0);

            const todayStats = stats.find((s) => s.date === TODAY);
            expect(todayStats).to.exist;
            expect(todayStats!.paymentsCount).to.equal(1);
            expect(todayStats!.paymentsVolume).to.equal(100);
            expect(todayStats!.activeMerchants).to.be.greaterThanOrEqual(1);
        });

        it("should filter stats by date range", async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().substring(0, 10);

            const stats = await getMerchantStats(TEST_MERCHANT, {
                dateFrom: yesterdayStr,
                dateTo: TODAY,
            });

            // Should only include today (yesterday has no events)
            expect(stats.every((s: MerchantDailyStats) => s.date >= yesterdayStr && s.date <= TODAY)).to.be.true;
        });
    });

    // -----------------------------------------------------------------------
    // 5. Export
    // -----------------------------------------------------------------------
    describe("Data Export", () => {
        it("should export stats as CSV", async () => {
            const result = await generateExport({
                merchantId: TEST_MERCHANT,
                entityType: "stats",
                format: "csv",
            });

            expect(result.format).to.equal("csv");
            expect(result.filename).to.match(/^settlr-stats-.*\.csv$/);
            expect(result.rowCount).to.be.greaterThan(0);
            expect(result.data).to.include("Date,Payments");

            const lines = result.data.split("\n");
            expect(lines.length).to.be.greaterThan(1); // header + data rows

            console.log("  CSV preview:\n   ", lines.slice(0, 3).join("\n    "));
        });

        it("should export stats as JSON", async () => {
            const result = await generateExport({
                merchantId: TEST_MERCHANT,
                entityType: "stats",
                format: "json",
            });

            expect(result.format).to.equal("json");
            expect(result.filename).to.match(/\.json$/);

            const parsed = JSON.parse(result.data);
            expect(parsed).to.be.an("array").with.length.greaterThan(0);
            expect(parsed[0]).to.have.property("Date");
            expect(parsed[0]).to.have.property("Payments");
            expect(parsed[0]).to.have.property("Payment Volume (USDC)");
        });

        it("should export events as CSV", async () => {
            const result = await generateExport({
                merchantId: TEST_MERCHANT,
                entityType: "payment",
                format: "csv",
            });

            expect(result.format).to.equal("csv");
            expect(result.data).to.include("Event ID");
        });
    });

    // -----------------------------------------------------------------------
    // 6. End-to-end: Emit → Process → Query → Export
    // -----------------------------------------------------------------------
    describe("End-to-End Flow", () => {
        const E2E_MERCHANT = "e2e-merchant-001";

        it("should handle a full payment lifecycle", async () => {
            // 1. Emit events for a realistic payment flow
            await emitEvent("payment.completed", "payment", "pay_e2e_001", E2E_MERCHANT, {
                amount: 1000, currency: "USDC",
            });
            await emitEvent("invoice.created", "invoice", "inv_e2e_001", E2E_MERCHANT, {
                amount: 1000, invoiceNumber: "INV-E2E-001",
            });
            await emitEvent("invoice.paid", "invoice", "inv_e2e_001", E2E_MERCHANT, {
                amount: 1000, invoiceNumber: "INV-E2E-001",
            });
            await emitEvent("fee.collected", "treasury", "fee_e2e_001", E2E_MERCHANT, {
                amount: 10,
            });

            // 2. Process
            const processResult = await processEvents();
            expect(processResult.eventsProcessed).to.equal(4);

            // 3. Verify stats
            const stats = await getMerchantStats(E2E_MERCHANT);
            const todayStats = stats.find((s: MerchantDailyStats) => s.date === TODAY);
            expect(todayStats).to.exist;
            expect(todayStats!.paymentsVolume).to.equal(1000);
            expect(todayStats!.invoicesCreated).to.equal(1);
            expect(todayStats!.invoicesPaid).to.equal(1);
            expect(todayStats!.feesCollected).to.equal(10);

            // 4. Export
            const csv = await generateExport({
                merchantId: E2E_MERCHANT,
                entityType: "stats",
                format: "csv",
            });
            expect(csv.rowCount).to.equal(1);
            expect(csv.data).to.include("1000");

            console.log("  E2E lifecycle passed ✓");
        });
    });
});
