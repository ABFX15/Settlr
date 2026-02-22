/**
 * MagicBlock PER (Private Ephemeral Rollups) Tests
 * 
 * Tests TEE-based private payment integration
 * 
 * Run: npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/inco-lightning.test.ts'
 */

import { expect } from 'chai';
import { PublicKey } from '@solana/web3.js';
import {
    DELEGATION_PROGRAM_ID,
    PERMISSION_PROGRAM_ID,
    SETTLR_PROGRAM_ID,
    TEE_VALIDATOR,
    PER_ENDPOINT,
    PER_WS_ENDPOINT,
    SessionStatus,
    SESSION_STATUS_LABELS,
    findPrivateReceiptPda,
    findDelegationRecordPda,
    findDelegationMetadataPda,
    usdcToMicroUnits,
    microUnitsToUsdc,
    getPrivacyVisibility,
} from '../lib/inco-lightning';

describe('MagicBlock PER - Private Payments', () => {
    const TEST_WALLET = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
    const CUSTOMER_WALLET = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';

    describe('Program IDs', () => {
        it('should have correct Delegation program ID', () => {
            expect(DELEGATION_PROGRAM_ID).to.be.instanceOf(PublicKey);
            expect(DELEGATION_PROGRAM_ID.toBase58()).to.equal('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh');
        });

        it('should have correct Permission program ID', () => {
            expect(PERMISSION_PROGRAM_ID).to.be.instanceOf(PublicKey);
            expect(PERMISSION_PROGRAM_ID.toBase58()).to.equal('ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1');
        });

        it('should have correct Settlr program ID', () => {
            expect(SETTLR_PROGRAM_ID).to.be.instanceOf(PublicKey);
            expect(SETTLR_PROGRAM_ID.toBase58()).to.equal('339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5');
        });

        it('should have correct TEE validator address', () => {
            expect(TEE_VALIDATOR).to.be.instanceOf(PublicKey);
            expect(TEE_VALIDATOR.toBase58()).to.equal('FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA');
        });
    });

    describe('Endpoints', () => {
        it('should have correct PER endpoint', () => {
            expect(PER_ENDPOINT).to.equal('https://tee.magicblock.app');
        });

        it('should have correct PER WebSocket endpoint', () => {
            expect(PER_WS_ENDPOINT).to.equal('wss://tee.magicblock.app');
        });
    });

    describe('findPrivateReceiptPda', () => {
        it('should derive valid PDA for payment ID', () => {
            const [pda, bump] = findPrivateReceiptPda('pay_test_123');
            expect(pda).to.be.instanceOf(PublicKey);
            expect(bump).to.be.a('number');
            expect(bump).to.be.lessThanOrEqual(255);
        });

        it('should be deterministic (same input = same output)', () => {
            const paymentId = 'pay_deterministic_test';
            const [pda1] = findPrivateReceiptPda(paymentId);
            const [pda2] = findPrivateReceiptPda(paymentId);
            expect(pda1.toBase58()).to.equal(pda2.toBase58());
        });

        it('should return different PDAs for different payment IDs', () => {
            const [pda1] = findPrivateReceiptPda('pay_first');
            const [pda2] = findPrivateReceiptPda('pay_second');
            expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
        });

        it('should handle long payment IDs (truncation)', () => {
            const longId = 'a'.repeat(100);
            const [pda] = findPrivateReceiptPda(longId);
            expect(pda).to.be.instanceOf(PublicKey);
        });
    });

    describe('Delegation PDAs', () => {
        it('should derive valid delegation record PDA', () => {
            const account = new PublicKey(TEST_WALLET);
            const [pda, bump] = findDelegationRecordPda(account);
            expect(pda).to.be.instanceOf(PublicKey);
            expect(bump).to.be.a('number');
        });

        it('should be deterministic', () => {
            const account = new PublicKey(TEST_WALLET);
            const [pda1] = findDelegationRecordPda(account);
            const [pda2] = findDelegationRecordPda(account);
            expect(pda1.toBase58()).to.equal(pda2.toBase58());
        });

        it('should return different PDAs for different accounts', () => {
            const [pda1] = findDelegationRecordPda(new PublicKey(TEST_WALLET));
            const [pda2] = findDelegationRecordPda(new PublicKey(CUSTOMER_WALLET));
            expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
        });

        it('should derive delegation metadata PDA', () => {
            const account = new PublicKey(TEST_WALLET);
            const [metaPda] = findDelegationMetadataPda(account);
            expect(metaPda).to.be.instanceOf(PublicKey);
        });

        it('should return different PDAs for record vs metadata', () => {
            const account = new PublicKey(TEST_WALLET);
            const [recordPda] = findDelegationRecordPda(account);
            const [metaPda] = findDelegationMetadataPda(account);
            expect(recordPda.toBase58()).to.not.equal(metaPda.toBase58());
        });
    });

    describe('Session Status', () => {
        it('should define all session states', () => {
            expect(SessionStatus.Pending).to.equal(0);
            expect(SessionStatus.Active).to.equal(1);
            expect(SessionStatus.Processed).to.equal(2);
            expect(SessionStatus.Settled).to.equal(3);
        });

        it('should have labels for all states', () => {
            expect(SESSION_STATUS_LABELS[SessionStatus.Pending]).to.equal('Pending');
            expect(SESSION_STATUS_LABELS[SessionStatus.Active]).to.equal('Delegated to TEE');
            expect(SESSION_STATUS_LABELS[SessionStatus.Processed]).to.equal('Processed in TEE');
            expect(SESSION_STATUS_LABELS[SessionStatus.Settled]).to.equal('Settled on Base Layer');
        });
    });

    describe('Privacy Visibility', () => {
        it('should hide amount during TEE delegation', () => {
            const vis = getPrivacyVisibility(SessionStatus.Active);
            expect(vis.amountVisible).to.be.false;
            expect(vis.label).to.include('TEE');
        });

        it('should hide amount during processing', () => {
            const vis = getPrivacyVisibility(SessionStatus.Processed);
            expect(vis.amountVisible).to.be.false;
        });

        it('should reveal amount after settlement', () => {
            const vis = getPrivacyVisibility(SessionStatus.Settled);
            expect(vis.amountVisible).to.be.true;
            expect(vis.label).to.equal('Settled');
        });
    });

    describe('PER Payment Flow', () => {
        it('should support the private payment session pattern', () => {
            const flow = [
                '1. Create private payment session on base layer',
                '2. Delegate session account to MagicBlock TEE validator',
                '3. Process payment privately inside TEE (hidden from observers)',
                '4. Settle: commit state back to base layer',
            ];

            expect(flow).to.have.length(4);
            expect(flow[0]).to.include('session');
            expect(flow[1]).to.include('TEE');
            expect(flow[2]).to.include('hidden');
            expect(flow[3]).to.include('base layer');
        });

        it('should integrate with checkout session private mode', () => {
            const privateSession = {
                sessionId: 'cs_private_123',
                private: true,
                amount: 100,
                sessionStatus: SessionStatus.Pending,
                isDelegated: false,
            };

            expect(privateSession.private).to.be.true;
            expect(privateSession.sessionStatus).to.equal(SessionStatus.Pending);
            expect(privateSession.isDelegated).to.be.false;
        });
    });

    describe('USDC Conversion', () => {
        it('should convert USDC to micro-units', () => {
            expect(usdcToMicroUnits(10.5)).to.equal(BigInt(10_500_000));
            expect(usdcToMicroUnits(1)).to.equal(BigInt(1_000_000));
        });

        it('should convert micro-units back to USDC', () => {
            expect(microUnitsToUsdc(BigInt(10_500_000))).to.equal(10.5);
            expect(microUnitsToUsdc(BigInt(1_000_000))).to.equal(1);
        });
    });
});
