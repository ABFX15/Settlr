/**
 * Range Security Tests
 * 
 * Tests wallet risk screening functionality
 * 
 * Run: npx tsx node_modules/mocha/bin/mocha.js 'app/frontend/src/__tests__/range.test.ts'
 */

import { expect } from 'chai';
import {
    screenWallet,
    screenWalletsBatch,
    isWalletBlocked,
    isSanctioned,
    screenPaymentParties,
    RiskLevel,
    RiskCategory,
    type WalletRiskResult,
} from '../lib/range';

describe('Range Security - Wallet Risk Screening', () => {
    const CLEAN_WALLET = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
    const BAD_WALLET = 'BadActor111111111111111111111111111111111111';
    const MIXER_WALLET = 'Mixer22222222222222222222222222222222222222';
    const SCAM_WALLET = 'Scammer333333333333333333333333333333333333';

    describe('screenWallet', () => {
        it('should return low risk for clean wallets', async () => {
            const result = await screenWallet(CLEAN_WALLET, { testMode: true });

            expect(result.address).to.equal(CLEAN_WALLET);
            expect(result.riskLevel).to.equal(RiskLevel.LOW);
            expect(result.riskScore).to.equal(0);
            expect(result.shouldBlock).to.be.false;
            expect(result.isSanctioned).to.be.false;
            expect(result.categories).to.include(RiskCategory.CLEAN);
        });

        it('should detect and block sanctioned wallets', async () => {
            const result = await screenWallet(BAD_WALLET, { testMode: true });

            expect(result.address).to.equal(BAD_WALLET);
            expect(result.riskLevel).to.equal(RiskLevel.SEVERE);
            expect(result.riskScore).to.equal(100);
            expect(result.shouldBlock).to.be.true;
            expect(result.isSanctioned).to.be.true;
            expect(result.categories).to.include(RiskCategory.SANCTIONS);
        });

        it('should detect mixer wallets', async () => {
            const result = await screenWallet(MIXER_WALLET, { testMode: true });

            expect(result.riskLevel).to.equal(RiskLevel.HIGH);
            expect(result.riskScore).to.equal(75);
            expect(result.shouldBlock).to.be.true;
            expect(result.categories).to.include(RiskCategory.MIXER);
        });

        it('should detect scam wallets', async () => {
            const result = await screenWallet(SCAM_WALLET, { testMode: true });

            expect(result.riskLevel).to.equal(RiskLevel.HIGH);
            expect(result.shouldBlock).to.be.true;
            expect(result.categories).to.include(RiskCategory.SCAM);
            expect(result.categories).to.include(RiskCategory.FRAUD);
        });

        it('should include screening timestamp', async () => {
            const before = new Date();
            const result = await screenWallet(CLEAN_WALLET, { testMode: true });
            const after = new Date();

            expect(result.screenedAt).to.be.instanceOf(Date);
            expect(result.screenedAt.getTime()).to.be.at.least(before.getTime());
            expect(result.screenedAt.getTime()).to.be.at.most(after.getTime());
        });

        it('should respect custom block threshold', async () => {
            // Mixer wallet has score 75, should block with default threshold (70)
            const result1 = await screenWallet(MIXER_WALLET, {
                testMode: true,
                blockThreshold: 70
            });
            expect(result1.shouldBlock).to.be.true;

            // With higher threshold, should not block
            const result2 = await screenWallet(MIXER_WALLET, {
                testMode: true,
                blockThreshold: 80
            });
            expect(result2.shouldBlock).to.be.false;
        });

        it('should always block sanctioned regardless of threshold when configured', async () => {
            const result = await screenWallet(BAD_WALLET, {
                testMode: true,
                blockThreshold: 101, // Very high threshold
                alwaysBlockSanctioned: true
            });
            expect(result.shouldBlock).to.be.true; // Still blocked due to sanctions
        });

        it('should generate human-readable summary', async () => {
            const cleanResult = await screenWallet(CLEAN_WALLET, { testMode: true });
            expect(cleanResult.summary).to.include('passed');
            expect(cleanResult.summary).to.include('No issues');

            const badResult = await screenWallet(BAD_WALLET, { testMode: true });
            expect(badResult.summary).to.include('sanctions');
            expect(badResult.summary).to.include('blocked');
        });
    });

    describe('screenWalletsBatch', () => {
        it('should screen multiple wallets in parallel', async () => {
            const wallets = [CLEAN_WALLET, BAD_WALLET, MIXER_WALLET];
            const results = await screenWalletsBatch(wallets, { testMode: true });

            expect(results).to.have.length(3);
            expect(results[0].address).to.equal(CLEAN_WALLET);
            expect(results[0].shouldBlock).to.be.false;
            expect(results[1].address).to.equal(BAD_WALLET);
            expect(results[1].shouldBlock).to.be.true;
            expect(results[2].address).to.equal(MIXER_WALLET);
            expect(results[2].shouldBlock).to.be.true;
        });

        it('should handle empty array', async () => {
            const results = await screenWalletsBatch([], { testMode: true });
            expect(results).to.have.length(0);
        });

        it('should handle single wallet', async () => {
            const results = await screenWalletsBatch([CLEAN_WALLET], { testMode: true });
            expect(results).to.have.length(1);
            expect(results[0].address).to.equal(CLEAN_WALLET);
        });
    });

    describe('isWalletBlocked', () => {
        it('should return false for clean wallets', async () => {
            const blocked = await isWalletBlocked(CLEAN_WALLET, { testMode: true });
            expect(blocked).to.be.false;
        });

        it('should return true for bad wallets', async () => {
            const blocked = await isWalletBlocked(BAD_WALLET, { testMode: true });
            expect(blocked).to.be.true;
        });

        it('should return true for mixer wallets', async () => {
            const blocked = await isWalletBlocked(MIXER_WALLET, { testMode: true });
            expect(blocked).to.be.true;
        });
    });

    describe('isSanctioned', () => {
        it('should return false for clean wallets', async () => {
            const sanctioned = await isSanctioned(CLEAN_WALLET, { testMode: true });
            expect(sanctioned).to.be.false;
        });

        it('should return true for sanctioned wallets', async () => {
            const sanctioned = await isSanctioned(BAD_WALLET, { testMode: true });
            expect(sanctioned).to.be.true;
        });

        it('should return false for high-risk but not sanctioned wallets', async () => {
            const sanctioned = await isSanctioned(MIXER_WALLET, { testMode: true });
            expect(sanctioned).to.be.false;
        });
    });

    describe('screenPaymentParties', () => {
        it('should allow payment between clean wallets', async () => {
            const result = await screenPaymentParties(
                CLEAN_WALLET,
                CLEAN_WALLET,
                { testMode: true }
            );

            expect(result.canProceed).to.be.true;
            expect(result.blockedParty).to.be.undefined;
            expect(result.payer.shouldBlock).to.be.false;
            expect(result.merchant.shouldBlock).to.be.false;
        });

        it('should block payment from bad payer', async () => {
            const result = await screenPaymentParties(
                BAD_WALLET,
                CLEAN_WALLET,
                { testMode: true }
            );

            expect(result.canProceed).to.be.false;
            expect(result.blockedParty).to.equal('payer');
            expect(result.payer.shouldBlock).to.be.true;
            expect(result.merchant.shouldBlock).to.be.false;
        });

        it('should block payment to bad merchant', async () => {
            const result = await screenPaymentParties(
                CLEAN_WALLET,
                BAD_WALLET,
                { testMode: true }
            );

            expect(result.canProceed).to.be.false;
            expect(result.blockedParty).to.equal('merchant');
            expect(result.payer.shouldBlock).to.be.false;
            expect(result.merchant.shouldBlock).to.be.true;
        });

        it('should block both bad parties', async () => {
            const result = await screenPaymentParties(
                BAD_WALLET,
                MIXER_WALLET,
                { testMode: true }
            );

            expect(result.canProceed).to.be.false;
            expect(result.blockedParty).to.equal('both');
        });
    });

    describe('RiskLevel enum', () => {
        it('should have all expected risk levels', () => {
            expect(RiskLevel.LOW).to.equal('low');
            expect(RiskLevel.MEDIUM).to.equal('medium');
            expect(RiskLevel.HIGH).to.equal('high');
            expect(RiskLevel.SEVERE).to.equal('severe');
            expect(RiskLevel.UNKNOWN).to.equal('unknown');
        });
    });

    describe('RiskCategory enum', () => {
        it('should have all expected risk categories', () => {
            expect(RiskCategory.SANCTIONS).to.equal('sanctions');
            expect(RiskCategory.FRAUD).to.equal('fraud');
            expect(RiskCategory.MIXER).to.equal('mixer');
            expect(RiskCategory.DARKNET).to.equal('darknet');
            expect(RiskCategory.RANSOMWARE).to.equal('ransomware');
            expect(RiskCategory.STOLEN_FUNDS).to.equal('stolen_funds');
            expect(RiskCategory.TERRORISM).to.equal('terrorism');
            expect(RiskCategory.SCAM).to.equal('scam');
            expect(RiskCategory.GAMBLING).to.equal('gambling');
            expect(RiskCategory.CLEAN).to.equal('clean');
        });
    });
});
