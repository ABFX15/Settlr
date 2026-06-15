/**
 * Saved payees (supplier address book) tests.
 *
 * Run:
 *   npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/payees.test.ts'
 */

import { expect } from "chai";
import {
    createPayee,
    listPayees,
    getPayee,
    deletePayee,
} from "../lib/payees";

const M = "merchant_payees_1";

describe("Saved payees (supplier address book)", () => {
    it("saves and lists a supplier", () => {
        const p = createPayee({
            merchantId: M,
            name: "Green Valley Distribution",
            walletAddress: "Dist1111111111111111111111111111111111111111",
            licenseNumber: "C11-0000999-LIC",
        });
        expect(p.id).to.be.a("string");
        const list = listPayees(M);
        expect(list.map((x) => x.name)).to.include("Green Valley Distribution");
        expect(getPayee(p.id)?.licenseNumber).to.equal("C11-0000999-LIC");
    });

    it("scopes payees to their merchant", () => {
        const p = createPayee({
            merchantId: M,
            name: "Acme Grow",
            walletAddress: "Grow222222222222222222222222222222222222222",
        });
        // Another merchant can't see or delete it.
        expect(listPayees("other_merchant")).to.not.include(p);
        expect(deletePayee("other_merchant", p.id)).to.equal(false);
        expect(getPayee(p.id)).to.not.equal(null);
    });

    it("deletes a supplier for its owner", () => {
        const p = createPayee({
            merchantId: M,
            name: "Temp Supplier",
            walletAddress: "Temp333333333333333333333333333333333333333",
        });
        expect(deletePayee(M, p.id)).to.equal(true);
        expect(getPayee(p.id)).to.equal(null);
    });
});
