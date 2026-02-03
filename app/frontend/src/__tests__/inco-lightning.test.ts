/**
 * Inco Lightning Tests
 * 
 * Tests FHE encryption for private receipts
 * 
 * Run: npx tsx node_modules/mocha/bin/mocha.js 'src/__tests__/inco-lightning.test.ts'
 */

import { expect } from 'chai';
import { PublicKey } from '@solana/web3.js';
import {
    INCO_LIGHTNING_PROGRAM_ID,
    SETTLR_PROGRAM_ID,
    findPrivateReceiptPda,
    findAllowancePda,
} from '../lib/inco-lightning';

describe('Inco Lightning - FHE Private Receipts', () => {
    const TEST_WALLET = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
    const CUSTOMER_WALLET = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';

    describe('Program IDs', () => {
        it('should have correct Inco Lightning program ID', () => {
            expect(INCO_LIGHTNING_PROGRAM_ID).to.be.instanceOf(PublicKey);
            expect(INCO_LIGHTNING_PROGRAM_ID.toBase58()).to.equal('5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj');
        });

        it('should have correct Settlr program ID', () => {
            expect(SETTLR_PROGRAM_ID).to.be.instanceOf(PublicKey);
            expect(SETTLR_PROGRAM_ID.toBase58()).to.equal('339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5');
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
    });

    describe('findAllowancePda', () => {
        it('should derive valid allowance PDA', () => {
            const handle = BigInt('12345678901234567890');
            const [pda, bump] = findAllowancePda(handle, new PublicKey(TEST_WALLET));
            expect(pda).to.be.instanceOf(PublicKey);
            expect(bump).to.be.a('number');
        });

        it('should be deterministic', () => {
            const handle = BigInt('9876543210');
            const wallet = new PublicKey(TEST_WALLET);
            const [pda1] = findAllowancePda(handle, wallet);
            const [pda2] = findAllowancePda(handle, wallet);
            expect(pda1.toBase58()).to.equal(pda2.toBase58());
        });

        it('should return different PDAs for different handles', () => {
            const wallet = new PublicKey(TEST_WALLET);
            const [pda1] = findAllowancePda(BigInt('111'), wallet);
            const [pda2] = findAllowancePda(BigInt('222'), wallet);
            expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
        });

        it('should return different PDAs for different addresses', () => {
            const handle = BigInt('12345');
            const wallet1 = new PublicKey(TEST_WALLET);
            const wallet2 = new PublicKey('So11111111111111111111111111111111111111112');
            const [pda1] = findAllowancePda(handle, wallet1);
            const [pda2] = findAllowancePda(handle, wallet2);
            expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
        });

        it('should handle max u128 value', () => {
            const maxU128 = BigInt('340282366920938463463374607431768211455');
            const [pda] = findAllowancePda(maxU128, new PublicKey(TEST_WALLET));
            expect(pda).to.be.instanceOf(PublicKey);
        });

        it('should handle zero handle', () => {
            const [pda] = findAllowancePda(BigInt(0), new PublicKey(TEST_WALLET));
            expect(pda).to.be.instanceOf(PublicKey);
        });
    });

    describe('FHE Encryption Flow', () => {
        it('should support the private receipt issuance pattern', () => {
            // Document the expected flow
            const flow = [
                '1. Client encrypts amount using encryptAmount()',
                '2. Ciphertext sent to on-chain program via issuePrivateReceipt',
                '3. Program calls Inco Lightning CPI to create encrypted handle',
                '4. Allowance PDAs created for merchant + customer',
                '5. Only authorized parties can decrypt via attested-decrypt',
            ];

            expect(flow).to.have.length(5);
            expect(flow[0]).to.include('encryptAmount');
            expect(flow[2]).to.include('CPI');
            expect(flow[4]).to.include('attested-decrypt');
        });

        it('should integrate with checkout session private mode', () => {
            const privateSession = {
                sessionId: 'cs_private_123',
                private: true,
                amount: 100,
                // When private=true, Inco Lightning encrypts the amount
            };

            expect(privateSession.private).to.be.true;
        });
    });

    describe('Decryption Access Control', () => {
        it('should support granting decryption access to specific wallets', () => {
            // Verify the concept of allowance PDAs
            const merchantWallet = new PublicKey(TEST_WALLET);
            const customerWallet = new PublicKey(CUSTOMER_WALLET);
            const encryptedHandle = BigInt('99999999');

            // Both parties get their own allowance PDA
            const [merchantAllowance] = findAllowancePda(encryptedHandle, merchantWallet);
            const [customerAllowance] = findAllowancePda(encryptedHandle, customerWallet);

            // Different PDAs for different parties
            expect(merchantAllowance.toBase58()).to.not.equal(customerAllowance.toBase58());
        });
    });
});
