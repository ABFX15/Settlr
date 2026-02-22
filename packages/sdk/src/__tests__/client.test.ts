/**
 * Settlr SDK Client Unit Tests
 * 
 * Tests all SDK client methods using mocha/chai
 * 
 * Run: npx mocha -r ts-node/register packages/sdk/src/__tests__/client.test.ts
 */

import { expect } from 'chai';
import { Settlr } from '../client';
import { parseUSDC, generatePaymentId, isValidSolanaAddress } from '../utils';

describe('Settlr SDK Client', () => {
    const TEST_API_KEY = 'sk_test_1234567890abcdef';
    const TEST_WALLET = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
    const TEST_MERCHANT_NAME = 'Test Store';

    describe('constructor', () => {
        it('should throw error without API key', () => {
            expect(() => {
                new Settlr({
                    apiKey: '',
                    merchant: { name: 'Test', walletAddress: TEST_WALLET },
                });
            }).to.throw('API key is required');
        });

        it('should throw error with invalid wallet address', () => {
            expect(() => {
                new Settlr({
                    apiKey: TEST_API_KEY,
                    merchant: { name: 'Test', walletAddress: 'invalid-wallet' },
                });
            }).to.throw('Invalid merchant wallet address');
        });

        it('should create client with valid config', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
            });
            expect(client).to.not.be.undefined;
        });

        it('should create client without wallet (for API-fetched wallet)', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: { name: TEST_MERCHANT_NAME },
            });
            expect(client).to.not.be.undefined;
        });

        it('should default to devnet network', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
            });
            expect(client).to.not.be.undefined;
        });

        it('should accept mainnet-beta network', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                network: 'mainnet-beta',
            });
            expect(client).to.not.be.undefined;
        });

        it('should accept custom RPC endpoint', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                rpcEndpoint: 'https://custom-rpc.example.com',
            });
            expect(client).to.not.be.undefined;
        });

        it('should enable test mode for devnet', () => {
            const client = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                network: 'devnet',
            });
            expect(client).to.not.be.undefined;
        });
    });

    describe('getCheckoutUrl', () => {
        let settlr: Settlr;

        beforeEach(() => {
            settlr = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                network: 'devnet',
                testMode: true,
            });
        });

        it('should generate valid checkout URL with amount', () => {
            const url = settlr.getCheckoutUrl({
                amount: 29.99,
            });

            expect(url).to.include('amount=29.99');
            expect(url).to.include(`to=${TEST_WALLET}`);
        });

        it('should include memo in URL', () => {
            const url = settlr.getCheckoutUrl({
                amount: 29.99,
                memo: 'Test payment',
            });

            expect(url).to.include('memo=');
            expect(url).to.include('amount=29.99');
        });

        it('should include orderId in URL', () => {
            const url = settlr.getCheckoutUrl({
                amount: 50.00,
                orderId: 'order_123',
            });

            expect(url).to.include('orderId=order_123');
        });

        it('should include success and cancel URLs', () => {
            const url = settlr.getCheckoutUrl({
                amount: 50.00,
                successUrl: 'https://example.com/success',
                cancelUrl: 'https://example.com/cancel',
            });

            expect(url).to.include('successUrl=');
            expect(url).to.include('cancelUrl=');
        });
    });

    describe('createPayment', () => {
        let settlr: Settlr;

        beforeEach(() => {
            settlr = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                network: 'devnet',
                testMode: true,
            });
        });

        it('should reject zero amount', async () => {
            try {
                await settlr.createPayment({ amount: 0 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.include('Amount must be greater than 0');
            }
        });

        it('should reject negative amount', async () => {
            try {
                await settlr.createPayment({ amount: -10 });
                expect.fail('Should have thrown error');
            } catch (err: any) {
                expect(err.message).to.include('Amount must be greater than 0');
            }
        });
    });

    describe('getTier', () => {
        it('should return undefined before validation', () => {
            const settlr = new Settlr({
                apiKey: TEST_API_KEY,
                merchant: {
                    name: TEST_MERCHANT_NAME,
                    walletAddress: TEST_WALLET,
                },
                testMode: true,
            });
            expect(settlr.getTier()).to.be.undefined;
        });
    });
});

describe('Settlr SDK Utils', () => {
    describe('parseUSDC', () => {
        it('should convert 1 dollar to 1000000 lamports', () => {
            expect(parseUSDC(1)).to.equal(1000000n);
        });

        it('should convert decimal amounts correctly', () => {
            expect(parseUSDC(29.99)).to.equal(29990000n);
            expect(parseUSDC(0.01)).to.equal(10000n);
        });

        it('should handle large amounts', () => {
            expect(parseUSDC(1000000)).to.equal(1000000000000n);
        });

        it('should handle zero', () => {
            expect(parseUSDC(0)).to.equal(0n);
        });
    });

    describe('generatePaymentId', () => {
        it('should generate unique payment IDs', () => {
            const id1 = generatePaymentId();
            const id2 = generatePaymentId();
            expect(id1).to.not.equal(id2);
        });

        it('should start with pay_ prefix', () => {
            const id = generatePaymentId();
            expect(id.startsWith('pay_')).to.be.true;
        });

        it('should have reasonable length', () => {
            const id = generatePaymentId();
            expect(id.length).to.be.greaterThan(10);
        });
    });

    describe('isValidSolanaAddress', () => {
        it('should validate correct addresses', () => {
            expect(isValidSolanaAddress('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')).to.be.true;
            expect(isValidSolanaAddress('So11111111111111111111111111111111111111112')).to.be.true;
        });

        it('should reject empty string', () => {
            expect(isValidSolanaAddress('')).to.be.false;
        });

        it('should reject invalid addresses', () => {
            expect(isValidSolanaAddress('invalid')).to.be.false;
        });

        it('should reject Ethereum addresses', () => {
            expect(isValidSolanaAddress('0x1234567890abcdef1234567890abcdef12345678')).to.be.false;
        });

        it('should reject addresses with wrong length', () => {
            expect(isValidSolanaAddress('short')).to.be.false;
            expect(isValidSolanaAddress('toolongaddressthatwontworkforsure123456789012345678901234567890')).to.be.false;
        });
    });
});

// Import privacy module for testing
import {
    findPrivateReceiptPda,
    findDelegationBufferPda,
    findDelegationRecordPda,
    findDelegationMetadataPda,
    DELEGATION_PROGRAM_ID,
    PERMISSION_PROGRAM_ID,
    SETTLR_PROGRAM_ID,
    SessionStatus,
    buildPaymentPermissions,
} from '../privacy';
import { PublicKey } from '@solana/web3.js';

describe('Settlr SDK Privacy Module (MagicBlock PER)', () => {
    const TEST_WALLET = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
    const TEST_MERCHANT = new PublicKey('So11111111111111111111111111111111111111112');

    describe('Program IDs', () => {
        it('should have valid Delegation program ID', () => {
            expect(DELEGATION_PROGRAM_ID).to.be.instanceOf(PublicKey);
            expect(DELEGATION_PROGRAM_ID.toBase58()).to.equal('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh');
        });

        it('should have valid Permission program ID', () => {
            expect(PERMISSION_PROGRAM_ID).to.be.instanceOf(PublicKey);
            expect(PERMISSION_PROGRAM_ID.toBase58()).to.equal('ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1');
        });

        it('should have valid Settlr program ID', () => {
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

        it('should return same PDA for same payment ID (deterministic)', () => {
            const [pda1] = findPrivateReceiptPda('pay_deterministic');
            const [pda2] = findPrivateReceiptPda('pay_deterministic');
            expect(pda1.toBase58()).to.equal(pda2.toBase58());
        });

        it('should return different PDAs for different payment IDs', () => {
            const [pda1] = findPrivateReceiptPda('pay_first');
            const [pda2] = findPrivateReceiptPda('pay_second');
            expect(pda1.toBase58()).to.not.equal(pda2.toBase58());
        });

        it('should handle moderately long payment IDs', () => {
            const longId = 'pay_' + 'a'.repeat(25); // 29 bytes total, within limit
            const [pda, bump] = findPrivateReceiptPda(longId);
            expect(pda).to.be.instanceOf(PublicKey);
            expect(bump).to.be.a('number');
        });

        it('should throw for payment IDs exceeding max seed length', () => {
            const tooLongId = 'pay_' + 'a'.repeat(100); // Exceeds 32 byte limit
            expect(() => findPrivateReceiptPda(tooLongId)).to.throw();
        });

        it('should handle special characters in payment ID', () => {
            const [pda] = findPrivateReceiptPda('pay_special-chars_123');
            expect(pda).to.be.instanceOf(PublicKey);
        });
    });

    describe('Delegation PDAs', () => {
        it('should derive valid delegation buffer PDA', () => {
            const [receiptPda] = findPrivateReceiptPda('pay_buffer_test');
            const [bufferPda, bump] = findDelegationBufferPda(receiptPda);
            expect(bufferPda).to.be.instanceOf(PublicKey);
            expect(bump).to.be.a('number');
        });

        it('should derive valid delegation record PDA', () => {
            const [receiptPda] = findPrivateReceiptPda('pay_record_test');
            const [recordPda, bump] = findDelegationRecordPda(receiptPda);
            expect(recordPda).to.be.instanceOf(PublicKey);
            expect(bump).to.be.a('number');
        });

        it('should derive valid delegation metadata PDA', () => {
            const [receiptPda] = findPrivateReceiptPda('pay_meta_test');
            const [metaPda, bump] = findDelegationMetadataPda(receiptPda);
            expect(metaPda).to.be.instanceOf(PublicKey);
            expect(bump).to.be.a('number');
        });

        it('should produce different PDAs for different receipt accounts', () => {
            const [receipt1] = findPrivateReceiptPda('pay_1');
            const [receipt2] = findPrivateReceiptPda('pay_2');
            const [buf1] = findDelegationBufferPda(receipt1);
            const [buf2] = findDelegationBufferPda(receipt2);
            expect(buf1.toBase58()).to.not.equal(buf2.toBase58());
        });

        it('should be deterministic', () => {
            const [receiptPda] = findPrivateReceiptPda('pay_det');
            const [buf1] = findDelegationBufferPda(receiptPda);
            const [buf2] = findDelegationBufferPda(receiptPda);
            expect(buf1.toBase58()).to.equal(buf2.toBase58());
        });
    });

    describe('SessionStatus', () => {
        it('should have all status values', () => {
            expect(SessionStatus.Pending).to.equal('pending');
            expect(SessionStatus.Active).to.equal('active');
            expect(SessionStatus.Processed).to.equal('processed');
            expect(SessionStatus.Settled).to.equal('settled');
        });
    });

    describe('buildPaymentPermissions', () => {
        it('should return permission list for customer and merchant', () => {
            const perms = buildPaymentPermissions(TEST_WALLET, TEST_MERCHANT);
            expect(perms).to.be.an('array');
            expect(perms.length).to.equal(2);
            expect(perms[0].pubkey.toBase58()).to.equal(TEST_WALLET.toBase58());
            expect(perms[1].pubkey.toBase58()).to.equal(TEST_MERCHANT.toBase58());
        });

        it('should assign permission flags', () => {
            const perms = buildPaymentPermissions(TEST_WALLET, TEST_MERCHANT);
            expect(perms[0].permissions).to.be.a('number');
            expect(perms[1].permissions).to.be.a('number');
            expect(perms[0].permissions).to.be.greaterThan(0);
        });
    });
});
